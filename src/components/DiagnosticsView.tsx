import React from 'react';
import { ValidationIssue } from '../types';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  Code2, 
  FolderTree, 
  Wrench,
  BookOpen
} from 'lucide-react';

interface DiagnosticsViewProps {
  issues: ValidationIssue[];
  onAutoFixAll: () => void;
  psr4Path: string;
  pluginName: string;
  mainEntry: string;
}

export const DiagnosticsView: React.FC<DiagnosticsViewProps> = ({
  issues,
  onAutoFixAll,
  psr4Path,
  pluginName,
  mainEntry,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-400/30 flex items-center justify-center">
            {issues.length > 0 ? (
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>PocketMine-MP Plugin Diagnostics & Solver</span>
              {issues.length > 0 ? (
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  {issues.length} Issue{issues.length > 1 ? 's' : ''} Detected
                </span>
              ) : (
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  100% Ready
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              TgTechnoLogy checks namespace consistency, YAML syntax, PocketMine API rules, and directory structures.
            </p>
          </div>
        </div>

        {issues.length > 0 && (
          <button
            onClick={onAutoFixAll}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-950/60 border border-emerald-400/40 transition-all hover:scale-[1.02] shrink-0"
          >
            <Sparkles className="w-4 h-4 text-emerald-100" />
            <span>Auto-Fix & Solve All Mistakes</span>
          </button>
        )}
      </div>

      {/* Directory & Namespace Mapping Card */}
      <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-emerald-400" />
          <span>PSR-4 Directory & Namespace Hierarchy Resolution</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-500 uppercase font-semibold">Plugin Name</div>
            <div className="text-sm font-mono font-bold text-slate-100 mt-1">{pluginName || 'OpSword'}</div>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-500 uppercase font-semibold">plugin.yml `main:` entry</div>
            <div className="text-sm font-mono font-bold text-emerald-400 mt-1 truncate">{mainEntry}</div>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-500 uppercase font-semibold">Target File Location</div>
            <div className="text-sm font-mono font-bold text-cyan-400 mt-1 truncate">{psr4Path}</div>
          </div>
        </div>
      </div>

      {/* Issues Breakdown */}
      {issues.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Detected Problems & Solutions
          </h4>
          <div className="space-y-2.5">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        issue.level === 'error'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {issue.level}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      [{issue.category}]
                    </span>
                    <span className="text-xs font-bold text-slate-100">
                      {issue.message}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300/90 leading-relaxed">
                    {issue.explanation}
                  </p>
                  {issue.suggestedFix && (
                    <div className="text-xs text-emerald-400 flex items-center gap-1.5 pt-1">
                      <Wrench className="w-3.5 h-3.5" />
                      <span>{issue.suggestedFix}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-8 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h4 className="text-base font-bold text-slate-100">
            Your Plugin is Completely Error-Free!
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            All namespace classes match the plugin descriptor, YAML is properly spaced, and PluginBase interfaces are satisfied. You can safely export as .ZIP or .PHAR.
          </p>
        </div>
      )}

      {/* PocketMine Best Practices Guide */}
      <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>PocketMine-MP Development Best Practices</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300 leading-relaxed">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
            <span className="font-bold text-emerald-400">1. PSR-4 Namespace Rule</span>
            <p>
              If your class namespace is <code className="text-slate-200">OpSword</code> and class is <code className="text-slate-200">Main</code>, the file MUST be in <code className="text-cyan-300 font-mono">src/OpSword/Main.php</code>.
            </p>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
            <span className="font-bold text-emerald-400">2. YAML Indentation</span>
            <p>
              PocketMine YAML parser strictly rejects Tab keys. Use standard 2-space indentation for <code className="text-slate-200">commands:</code> and <code className="text-slate-200">permissions:</code>.
            </p>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
            <span className="font-bold text-emerald-400">3. Event Listener Registration</span>
            <p>
              If you implement <code className="text-slate-200">Listener</code>, remember to call <code className="text-cyan-300 font-mono">$this-&gt;getServer()-&gt;getPluginManager()-&gt;registerEvents($this, $this);</code> inside <code className="text-slate-200">onEnable()</code>.
            </p>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
            <span className="font-bold text-emerald-400">4. Return Types in PM4/PM5</span>
            <p>
              PocketMine API 4.0.0 and 5.0.0 require <code className="text-cyan-300 font-mono">protected function onEnable(): void</code> with strict return typing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
