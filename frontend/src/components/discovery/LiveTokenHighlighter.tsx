import React from 'react';
import { TokenHighlight } from '../../types/workflow';
import { User, Zap, HelpCircle, FileText, Server, Sparkles } from 'lucide-react';

interface LiveTokenHighlighterProps {
  text: string;
  tokens?: TokenHighlight[];
}

export const LiveTokenHighlighter: React.FC<LiveTokenHighlighterProps> = ({
  text,
  tokens = []
}) => {
  if (!text) return null;

  const renderAnnotatedText = () => {
    if (!tokens || tokens.length === 0) {
      return <p className="text-slate-300 whitespace-pre-wrap">{text}</p>;
    }

    const sorted = [...tokens].sort((a, b) => a.startIndex - b.startIndex);
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    sorted.forEach((tok, idx) => {
      if (tok.startIndex > lastIndex) {
        elements.push(
          <span key={`text_${lastIndex}_${tok.startIndex}`}>
            {text.substring(lastIndex, tok.startIndex)}
          </span>
        );
      }

      let badgeClass = 'bg-white/[0.05] text-slate-200 border-white/[0.08]';
      let icon = <Sparkles className="w-2.5 h-2.5 inline mr-1" />;

      if (tok.type === 'actor') {
        badgeClass = 'bg-[#38bdf8]/20 text-[#38bdf8] border-[#38bdf8]/40 shadow-[0_0_10px_rgba(56,189,248,0.3)]';
        icon = <User className="w-2.5 h-2.5 inline mr-1" />;
      } else if (tok.type === 'action') {
        badgeClass = 'bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/40 shadow-[0_0_10px_rgba(0,212,255,0.3)]';
        icon = <Zap className="w-2.5 h-2.5 inline mr-1" />;
      } else if (tok.type === 'decision') {
        badgeClass = 'bg-[#7c3aed]/20 text-purple-300 border-[#7c3aed]/40 shadow-[0_0_10px_rgba(124,58,237,0.3)]';
        icon = <HelpCircle className="w-2.5 h-2.5 inline mr-1" />;
      } else if (tok.type === 'document') {
        badgeClass = 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
        icon = <FileText className="w-2.5 h-2.5 inline mr-1" />;
      } else if (tok.type === 'system') {
        badgeClass = 'bg-pink-500/20 text-pink-300 border-pink-400/40 shadow-[0_0_10px_rgba(236,72,153,0.3)]';
        icon = <Server className="w-2.5 h-2.5 inline mr-1" />;
      }

      elements.push(
        <span
          key={`tok_${idx}_${tok.startIndex}`}
          className={`inline-flex items-center px-2 py-0.5 mx-0.5 rounded-2xl text-xs font-mono font-medium border transition-transform hover:scale-105 cursor-pointer ${badgeClass}`}
          title={`${tok.type.toUpperCase()}: ${tok.text} (Confidence: ${(tok.confidence * 100).toFixed(0)}%)`}
        >
          {icon}
          <span>{tok.text}</span>
        </span>
      );

      lastIndex = tok.endIndex;
    });

    if (lastIndex < text.length) {
      elements.push(
        <span key={`text_end_${lastIndex}`}>
          {text.substring(lastIndex)}
        </span>
      );
    }

    return elements;
  };

  return (
    <div className="glass-card p-5 font-mono text-xs sm:text-sm leading-relaxed space-y-3">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
        <span className="text-[11px] font-mono text-[#00d4ff] font-bold uppercase tracking-wider font-display">
          LIVE ENTITY & TOKEN STREAM
        </span>
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#38bdf8]" /> Actor</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00d4ff]" /> Action</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#7c3aed]" /> Decision</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10b981]" /> Doc</span>
        </div>
      </div>

      <div className="max-h-[220px] overflow-y-auto">
        {renderAnnotatedText()}
      </div>
    </div>
  );
};
