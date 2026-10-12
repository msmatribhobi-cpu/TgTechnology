import React from 'react';
import { ActiveTab } from '../types';
import { Layers, FileCode, Sparkles, AlertTriangle, Download, Terminal, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  issuesCount: number;
  onQuickExportZip: () => void;
  onQuickExportPhar: () => void;
  pluginName: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  issuesCount,
  onQuickExportZip,
  onQuickExportPhar,
  pluginName,
}) => {
  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-emerald-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-3 gap-3">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-900/30 border border-emerald-400/40">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  Tg<span className="text-emerald-400">TechnoLogy</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  PocketMine PM-MP Studio
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Minecraft Plugin Maker • Namespace Auto-Structurer • Text to File • ZIP & PHAR Compiler
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('plugin-maker')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'plugin-maker'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Plugin Maker</span>
            </button>

            <button
              onClick={() => setActiveTab('text-to-file')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'text-to-file'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Text To File</span>
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'templates'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Presets & OpSword</span>
            </button>

            <button
              onClick={() => setActiveTab('inspector')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                activeTab === 'inspector'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {issuesCount > 0 ? (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>Diagnostics</span>
              {issuesCount > 0 && (
                <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 text-[10px] rounded-full">
                  {issuesCount}
                </span>
              )}
            </button>
          </nav>

          {/* Quick Export Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onQuickExportZip}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 hover:border-slate-600 transition-colors shadow-sm"
              title="Download structured .ZIP archive"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export .ZIP</span>
            </button>

            <button
              onClick={onQuickExportPhar}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-950/50 border border-emerald-400/30 transition-all hover:scale-[1.02]"
              title="Build executable PocketMine .PHAR binary"
            >
              <Download className="w-3.5 h-3.5 text-emerald-100" />
              <span>Compile .PHAR</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
