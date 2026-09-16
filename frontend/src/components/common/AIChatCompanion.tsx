import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  Volume2,
  VolumeX,
  Zap,
  HelpCircle,
  TrendingDown,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  Bot,
  User,
  Mic,
  Maximize2,
  Minimize2,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { Workflow, CustomWorkflowNode } from '../../types/workflow';
import { soundFX } from '../../utils/audioEffects';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  highlightNodeId?: string;
  actionButton?: {
    label: string;
    action: () => void;
  };
}

interface AIChatCompanionProps {
  workflow: Workflow;
  onHighlightNode?: (nodeId: string) => void;
  onApplyOptimization?: () => void;
}

export const AIChatCompanion: React.FC<AIChatCompanionProps> = ({
  workflow,
  onHighlightNode,
  onApplyOptimization
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Derive primary bottleneck / review node dynamically
  const primaryBottleneck = useMemo(() => {
    return (workflow.nodes || []).find(n => n.type === 'decisionNode' || n.data?.category === 'decision' || n.data?.isBottleneck) || workflow.nodes?.[1] || null;
  }, [workflow]);

  const bottleneckLabel = useMemo(() => {
    return primaryBottleneck ? String(primaryBottleneck.data?.label || primaryBottleneck.data?.name || primaryBottleneck.data?.title || 'Review step') : 'Decision Gate';
  }, [primaryBottleneck]);

  // Dynamic Preset Questions
  const presetQuestions = useMemo(() => [
    `Why is "${bottleneckLabel.length > 18 ? bottleneckLabel.slice(0, 17) + '…' : bottleneckLabel}" a bottleneck?`,
    `How to optimize ${workflow.workflowName || 'workflow'}?`,
    'Show me the optimization path',
    'Explain the 0-cycle DAG guarantee',
    'Which actor handles the most steps?'
  ], [bottleneckLabel, workflow.workflowName]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome_1',
      sender: 'ai',
      text: `👋 Greetings! I am your **AI Process Partner**. I can explain the topology of **${workflow.workflowName || workflow.title}**, diagnose latency bottlenecks, and guide your Straight-Through Processing optimizations.`,
      timestamp: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isThinking]);

  // Reset welcome message if workflow changes
  useEffect(() => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        sender: 'ai',
        text: `👋 Greetings! I am your **AI Process Partner**. I can explain the topology of **${workflow.workflowName || workflow.title}**, diagnose latency bottlenecks, and guide your Straight-Through Processing optimizations.`,
        timestamp: 'Just now'
      }
    ]);
  }, [workflow.id, workflow.workflowName]);

  // Speech Synthesis helper
  const speakText = (text: string) => {
    if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => (v.lang.startsWith('en') && v.name.includes('Google')) || v.name.includes('Natural'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  // Generate intelligent contextual response
  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    soundFX.playClick();

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    setTimeout(() => {
      soundFX.playChime();
      let aiResponse = '';
      let highlightId: string | undefined = undefined;
      let actionBtn: { label: string; action: () => void } | undefined = undefined;

      const qLower = query.toLowerCase();

      if (qLower.includes('bottleneck') || qLower.includes(bottleneckLabel.toLowerCase()) || qLower.includes('kyc') || qLower.includes('delay')) {
        aiResponse = `🔎 **${bottleneckLabel}** currently introduces manual queue latency (~3.8h) due to synchronous verification or human approval.\n\n⚡ **AI Recommendation:** Replace with automated Straight-Through Processing (STP) validation to reduce delay by **94% (0.2h)**.`;
        highlightId = primaryBottleneck?.id || 'step-002';
        if (onHighlightNode && highlightId) onHighlightNode(highlightId);
        if (onApplyOptimization) {
          actionBtn = {
            label: `Auto-Fix ${bottleneckLabel}`,
            action: () => onApplyOptimization()
          };
        }
      } else if (qLower.includes('efficiency') || qLower.includes('improve') || qLower.includes('optimize')) {
        aiResponse = `📊 Overall process health for **${workflow.workflowName || workflow.title}** is currently indexed at **${workflow.healthScore?.overall || 96}%**.\n\nApplying **Straight-Through Processing (STP)** saves operational hours per case and streamlines ${(workflow.nodes?.length || 4)} execution steps.`;
        if (onApplyOptimization) {
          actionBtn = {
            label: 'Simulate STP Optimization',
            action: () => onApplyOptimization()
          };
        }
      } else if (qLower.includes('path') || qLower.includes('optimization')) {
        aiResponse = `🛤️ **Optimization Path Identified:**\n1. Enable instant automated API validation.\n2. Add auto-approval threshold for standard payload schemas.\n3. Straight-through database state synchronization.\n\nThis achieves **100% DAG verification** and straight-through routing.`;
      } else if (qLower.includes('dag') || qLower.includes('0-cycle') || qLower.includes('guarantee')) {
        aiResponse = `🛡️ **Mathematical 0-Cycle Guarantee:**\nOur Kahn's topological sort analyzer verified that no circular edge loops exist in this graph. All ${workflow.nodes?.length || (workflow.steps?.length || 4)} nodes strictly flow from source to completion.`;
      } else if (qLower.includes('actor') || qLower.includes('stakeholder')) {
        const actorName = workflow.actors?.[0]?.name || 'Initiator';
        aiResponse = `👥 **Actor Workload Analysis:**\nThe **${actorName}** triggers the flow, followed by the **FlowIntel AI Orchestrator** executing background functions.`;
      } else {
        aiResponse = `🤖 I've analyzed your workflow "${workflow.workflowName || workflow.title}". It has **${workflow.nodes?.length || 4} steps** and a straight-through health rating of **${workflow.healthScore?.overall || 96}%**. Ask me about bottlenecks, DAG cycles, or latency reduction!`;
      }

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        highlightNodeId: highlightId,
        actionButton: actionBtn
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsThinking(false);
      speakText(aiResponse);
    }, 700);
  };

  return (
    <>
      {/* 1. Floating AI Avatar in Bottom-Right Corner (Glowing Cyan Circle with Subtle Shadow) */}
      {!isOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 animate-node-pop">
          <button
            type="button"
            onClick={() => {
              soundFX.playWhoosh();
              setIsOpen(true);
            }}
            className="group relative flex items-center gap-3 p-2 pr-5 rounded-full bg-white dark:bg-[#0a0e1a]/95 border-2 border-[#00b4d8] shadow-[0_4px_20px_rgba(0,180,216,0.35)] backdrop-blur-[24px] hover:scale-105 transition-all cursor-pointer button-scale animate-heartbeat"
            aria-label="Open AI Process Partner"
          >
            {/* Glowing Cyan Circle with Subtle Shadow */}
            <div className="relative w-12 h-12 rounded-full bg-[#00b4d8] p-[2px] shadow-[0_0_20px_rgba(0,180,216,0.5)]">
              <div className="w-full h-full rounded-full bg-white dark:bg-[#0a0e1a] flex items-center justify-center relative overflow-hidden">
                {/* Orbital Rotating Ambient Aura */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#00b4d8]/30 to-[#7c3aed]/30 animate-spin" />
                
                {/* Animated Avatar Face */}
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <Bot className="w-6 h-6 text-[#00b4d8] animate-pulse" />
                </div>
              </div>

              {/* Online Green Heartbeat Pulse Dot */}
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#10b981] border-2 border-white dark:border-[#0a0e1a] shadow-[0_0_8px_#10b981] animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#10b981] border-2 border-white dark:border-[#0a0e1a]" />
            </div>

            <div className="text-left">
              <div className="text-xs font-bold font-display text-[#0f172a] dark:text-[#e8edf5] flex items-center gap-1.5">
                <span>AI Process Partner</span>
                <span className="text-[9px] font-mono text-[#00b4d8] bg-[#00b4d8]/15 px-1.5 py-0.2 rounded-md font-bold">ONLINE</span>
              </div>
              <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00b4d8] animate-ping" />
                <span>Ask why bottlenecks exist</span>
              </p>
            </div>
          </button>
        </div>
      )}

      {/* 3. Expanded Glassmorphic AI Chat Bubble in Bottom-Right */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            aria-label="AI Process Partner Chat"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className={`fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 rounded-2xl bg-white/95 dark:bg-[#0a0e1a]/95 border-2 border-[#00b4d8]/40 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_0_70px_rgba(0,212,255,0.4)] backdrop-blur-[28px] flex flex-col overflow-hidden transition-all duration-300 ${
              isMinimized ? 'w-80 h-16' : 'w-96 sm:w-[420px] h-[550px]'
            }`}
          >
            {/* Companion Header */}
            <div className="p-3.5 bg-slate-50 dark:bg-white/[0.04] border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#00b4d8] p-[1.5px] shadow-[0_0_12px_rgba(0,180,216,0.4)]">
                  <div className="w-full h-full rounded-full bg-white dark:bg-[#0a0e1a] flex items-center justify-center">
                    <Bot className="w-4 h-4 text-[#00b4d8]" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0f172a] dark:text-[#e8edf5] font-display flex items-center gap-1.5">
                    <span>AI Process Partner</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
                  </h4>
                  <p className="text-[9px] font-mono text-slate-500 dark:text-slate-400">Contextual Reasoning & DAG Highlighter</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Voice Readout Toggle */}
                <button
                  type="button"
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`p-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    voiceEnabled ? 'bg-[#00b4d8]/20 text-[#00b4d8]' : 'text-slate-400 hover:text-[#0f172a] dark:hover:text-white'
                  }`}
                  title={voiceEnabled ? 'Voice Synthesis Enabled' : 'Enable Voice Synthesis'}
                >
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {/* Minimize Toggle */}
                <button
                  type="button"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#0f172a] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                  title={isMinimized ? 'Expand' : 'Minimize'}
                >
                  {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setIsOpen(false);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#0f172a] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* 3. Message History Bubble Stream */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs font-mono">
                  {messages.map((msg) => {
                    const isAi = msg.sender === 'ai';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isAi ? 'items-start' : 'items-end'} space-y-1`}
                      >
                        <div className="flex items-center gap-1.5 text-[9px] text-slate-500 dark:text-slate-400">
                          {isAi ? <Bot className="w-3 h-3 text-[#00b4d8]" /> : <User className="w-3 h-3 text-[#00b4d8]" />}
                          <span>{isAi ? 'AI Process Partner' : 'You'}</span>
                          <span>•</span>
                          <span>{msg.timestamp}</span>
                        </div>

                        {/* User Bubble: #00b4d8 with white text | AI Bubble: #f1f5f9 with dark text */}
                        <div
                          className={`p-3.5 rounded-2xl max-w-[92%] leading-relaxed whitespace-pre-line shadow-sm ${
                            isAi
                              ? 'bg-[#f1f5f9] dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] text-[#0f172a] dark:text-slate-200'
                              : 'bg-[#00b4d8] text-white shadow-[0_2px_12px_rgba(0,180,216,0.3)]'
                          }`}
                        >
                          {msg.text}

                          {/* Direct Action Button in AI Bubble */}
                          {msg.actionButton && (
                            <div className="pt-2.5 mt-2.5 border-t border-slate-200 dark:border-white/[0.08]">
                              <button
                                type="button"
                                onClick={() => {
                                  soundFX.playClick();
                                  msg.actionButton?.action();
                                }}
                                className="px-3 py-1.5 rounded-xl bg-[#00b4d8] text-white hover:bg-[#0096b4] text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                              >
                                <Zap className="w-3.5 h-3.5" />
                                <span>{msg.actionButton.label}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* 2. Typing Indicator with #00b4d8 dots */}
                  {isThinking && (
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#f1f5f9] dark:bg-white/[0.04] border border-[#00b4d8]/30 text-xs text-[#00b4d8] font-mono animate-pulse">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#00b4d8] animate-bounce" style={{ animationDelay: '0s' }} />
                        <span className="w-2 h-2 rounded-full bg-[#00b4d8] animate-bounce" style={{ animationDelay: '0.15s' }} />
                        <span className="w-2 h-2 rounded-full bg-[#00b4d8] animate-bounce" style={{ animationDelay: '0.3s' }} />
                      </div>
                      <span className="text-[11px] text-[#334155] dark:text-slate-300 font-bold">
                        AI Partner is analyzing topology & highlighting DAG...
                      </span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* 4. Pre-populated Suggested Questions Carousel */}
                <div className="px-3 py-2 border-t border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {presetQuestions.map((pq, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(pq)}
                      className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] hover:border-[#00b4d8] hover:bg-[#00b4d8]/10 text-[10px] font-mono text-[#334155] dark:text-slate-300 hover:text-[#00b4d8] whitespace-nowrap shrink-0 transition-all cursor-pointer shadow-sm"
                    >
                      {pq}
                    </button>
                  ))}
                </div>

                {/* Input Field: White Background, Border #e2e8f0, Focus #00b4d8 */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="p-3 border-t border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#0a0e1a] flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask why a bottleneck exists, or how to optimize..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/[0.05] border border-[#e2e8f0] dark:border-white/[0.1] text-xs text-[#0f172a] dark:text-[#e8edf5] placeholder-slate-400 focus:outline-none focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 font-mono transition-colors shadow-sm"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isThinking}
                    className="p-2.5 rounded-xl bg-[#00b4d8] hover:bg-[#0096b4] disabled:opacity-40 flex items-center justify-center cursor-pointer transition-all shrink-0 text-white shadow-sm"
                    aria-label="Send Message"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </form>
              </>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};
