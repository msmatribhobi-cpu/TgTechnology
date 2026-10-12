import React from 'react';
import { PLUGIN_TEMPLATES } from '../utils/templates';
import { PluginTemplate } from '../types';
import { Sparkles, Sword, Terminal, MessageSquare, Box, ArrowRight, Check } from 'lucide-react';

interface TemplatesViewProps {
  onSelectTemplate: (template: PluginTemplate) => void;
  currentPluginName: string;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  onSelectTemplate,
  currentPluginName,
}) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'op-sword':
        return <Sword className="w-5 h-5 text-amber-400" />;
      case 'commands-pack':
        return <Terminal className="w-5 h-5 text-emerald-400" />;
      case 'welcome-events':
        return <MessageSquare className="w-5 h-5 text-cyan-400" />;
      default:
        return <Box className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-400/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Ready-to-Use PocketMine-MP Plugin Starters
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any starter below to load the complete code, plugin.yml, and namespace PSR-4 folder hierarchy into your workspace.
            </p>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PLUGIN_TEMPLATES.map((tmpl) => {
          const isCurrent = currentPluginName.toLowerCase() === tmpl.pluginName.toLowerCase();

          return (
            <div
              key={tmpl.id}
              className={`p-5 rounded-xl border flex flex-col justify-between transition-all bg-slate-900/60 hover:bg-slate-900 hover:border-emerald-500/40 hover:shadow-lg ${
                isCurrent
                  ? 'border-emerald-500/50 bg-emerald-950/10'
                  : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                      {getIcon(tmpl.id)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                        {tmpl.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-mono">
                        <span className="bg-slate-800 text-emerald-400 px-1.5 py-0.2 rounded">
                          API {tmpl.apiVersion}
                        </span>
                        <span>v{tmpl.pluginVersion}</span>
                      </div>
                    </div>
                  </div>

                  {isCurrent && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <Check className="w-3 h-3" />
                      <span>Loaded</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {tmpl.tagline}
                </p>

                {/* Included files preview */}
                <div className="bg-slate-950/80 rounded-lg p-2.5 border border-slate-800 text-[11px] font-mono text-slate-400 mb-4 space-y-1">
                  <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Included Structure:
                  </div>
                  {tmpl.files.map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-slate-300">
                      <span className="text-emerald-500">›</span>
                      <span>{f.path}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Load Button */}
              <button
                onClick={() => onSelectTemplate(tmpl)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow transition-all hover:scale-[1.01]"
              >
                <span>Load Template into Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
