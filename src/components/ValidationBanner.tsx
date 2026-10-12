import React from 'react';
import { ValidationIssue } from '../types';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Wrench, 
  Sparkles, 
  Info, 
  XCircle, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface ValidationBannerProps {
  issues: ValidationIssue[];
  onAutoFixAll: () => void;
  onApplySingleFix?: (issue: ValidationIssue) => void;
}

export const ValidationBanner: React.FC<ValidationBannerProps> = ({
  issues,
  onAutoFixAll,
}) => {
  const errors = issues.filter(i => i.level === 'error');
  const warnings = issues.filter(i => i.level === 'warning');
  const infos = issues.filter(i => i.level === 'info');

  if (issues.length === 0) {
    return (
      <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-300">
              Valid PocketMine-MP Structure & Namespace
            </h4>
            <p className="text-xs text-slate-300">
              No errors detected. Ready to package as high-speed .ZIP and .PHAR for your Minecraft Bedrock server!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-4 shadow-lg space-y-3">
      {/* Top Banner Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-100">
                Found {issues.length} Plugin Mistake{issues.length > 1 ? 's' : ''} & Structure Issue{issues.length > 1 ? 's' : ''}
              </h4>
              <div className="flex items-center gap-1.5 text-[11px]">
                {errors.length > 0 && (
                  <span className="bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold border border-rose-500/30">
                    {errors.length} Error{errors.length > 1 ? 's' : ''}
                  </span>
                )}
                {warnings.length > 0 && (
                  <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
                    {warnings.length} Warning{warnings.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              TgTechnoLogy analyzed your plugin.yml and Main.php for syntax & namespace consistency.
            </p>
          </div>
        </div>

        {/* Auto Fix Button */}
        <button
          onClick={onAutoFixAll}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-950/60 border border-emerald-400/30 transition-all hover:scale-[1.02] shrink-0"
        >
          <Sparkles className="w-4 h-4 text-emerald-100" />
          <span>Auto-Fix & Solve All Mistakes</span>
        </button>
      </div>

      {/* Issues Breakdown List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
        {issues.map((issue) => {
          const isError = issue.level === 'error';
          const isWarning = issue.level === 'warning';

          return (
            <div
              key={issue.id}
              className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between ${
                isError
                  ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                  : isWarning
                  ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                  : 'bg-blue-950/20 border-blue-500/30 text-blue-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-[11px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-700/50">
                    {issue.category}
                  </span>
                  <span className={`text-[10px] font-bold ${isError ? 'text-rose-400' : 'text-amber-400'}`}>
                    {issue.level.toUpperCase()}
                  </span>
                </div>
                <div className="font-bold text-slate-100 mb-1">{issue.message}</div>
                <div className="text-[11px] text-slate-300/90 leading-relaxed">{issue.explanation}</div>
              </div>

              {issue.suggestedFix && (
                <div className="mt-2 pt-2 border-t border-slate-800 flex items-center gap-1.5 text-[11px] text-emerald-400">
                  <Wrench className="w-3 h-3 shrink-0" />
                  <span className="truncate">Fix: {issue.suggestedFix}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
