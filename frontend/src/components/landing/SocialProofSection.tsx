import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  CheckCircle2,
  Award,
  Users,
  Building2,
  Cpu,
  Layers,
  Sparkles,
  Zap
} from 'lucide-react';

const CLIENT_LOGOS = [
  { name: 'ACME FINANCIAL', category: 'Fintech Tier 1' },
  { name: 'NEXUS HEALTH', category: 'Healthcare Ops' },
  { name: 'VERTEX SUPPLY', category: 'Global Logistics' },
  { name: 'HYPERSCALE CLOUD', category: 'Infrastructure' },
  { name: 'OMEGA COMMERCE', category: 'Omnichannel Retail' },
  { name: 'AURA PHARMA', category: 'Compliance & QA' }
];

export const SocialProofSection: React.FC = () => {
  return (
    <section
      aria-label="Enterprise Trust & Social Proof"
      className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8"
    >
      {/* 1. Core Trust & Verification Badges */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-mono">
        {/* Badge 1: 100% DAG Verified */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#10b981]/15 border border-[#10b981]/30 text-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.2)] backdrop-blur-[20px]">
          <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
          <span className="font-bold tracking-wide">100% DAG Verified (0 Cycles)</span>
        </div>

        {/* Badge 2: Production AI Hackathon Suite */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#00d4ff]/15 border border-[#00d4ff]/30 text-[#00d4ff] shadow-[0_0_20px_rgba(0,212,255,0.2)] backdrop-blur-[20px]">
          <Award className="w-4 h-4 text-[#00d4ff]" />
          <span className="font-bold tracking-wide">Production AI Hackathon Suite</span>
        </div>

        {/* Badge 3: Enterprise Trust Metric */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#7c3aed]/15 border border-[#7c3aed]/30 text-purple-300 shadow-[0_0_20px_rgba(124,58,237,0.2)] backdrop-blur-[20px]">
          <Building2 className="w-4 h-4 text-purple-300" />
          <span className="font-bold tracking-wide">Trusted by 50+ Scaleups & Enterprise Teams</span>
        </div>
      </div>

      {/* 2. Client Logo Grid (Grey & Cyan Sleek Metallic Boxes) */}
      <div className="space-y-4 text-center">
        <p className="text-[11px] font-mono uppercase text-slate-400 tracking-widest">
          Powering Automated Process Discovery Across Global Leaders
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {CLIENT_LOGOS.map((client, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="group p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-[#00d4ff]/40 hover:bg-[#00d4ff]/5 transition-all duration-300 backdrop-blur-[20px] flex flex-col items-center justify-center text-center cursor-default shadow-sm hover:shadow-[0_0_25px_rgba(0,212,255,0.15)]"
            >
              <div className="text-xs font-black font-display text-slate-300 group-hover:text-[#00d4ff] tracking-wider transition-colors">
                {client.name}
              </div>
              <div className="text-[9px] font-mono text-slate-400 mt-0.5">
                {client.category}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
