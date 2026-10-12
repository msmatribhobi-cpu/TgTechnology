import React, { useState } from 'react';
import { Copy, Check, FileCode, WrapText, Download, Code2 } from 'lucide-react';
import { VirtualFile } from '../types';

interface CodeEditorProps {
  file: VirtualFile;
  onChange: (content: string) => void;
  onDownloadSingleFile: (file: VirtualFile) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  file,
  onChange,
  onDownloadSingleFile,
}) => {
  const [copied, setCopied] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);

  const handleCopy = () => {
    navigator.clipboard.writeText(file.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const indent = '  '; // 2 spaces

      const newContent =
        file.content.substring(0, start) + indent + file.content.substring(end);
      onChange(newContent);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + indent.length;
      }, 0);
    }
  };

  const lineCount = file.content.split('\n').length;
  const charCount = file.content.length;
  const byteSize = new TextEncoder().encode(file.content).length;
  const formattedSize =
    byteSize < 1024 ? `${byteSize} B` : `${(byteSize / 1024).toFixed(1)} KB`;

  const getLanguageLabel = () => {
    if (file.path.endsWith('.php')) return 'PHP 8.x';
    if (file.path.endsWith('.yml') || file.path.endsWith('.yaml')) return 'YAML';
    if (file.path.endsWith('.json')) return 'JSON';
    return 'Text';
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner">
      {/* Editor Top Bar */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-mono font-bold text-slate-200 truncate">
            {file.path}
          </span>
          <span className="text-[10px] bg-slate-800 text-emerald-400 font-semibold px-2 py-0.5 rounded border border-slate-700">
            {getLanguageLabel()}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setWordWrap(!wordWrap)}
            className={`p-1.5 rounded text-xs transition-colors flex items-center gap-1 ${
              wordWrap
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Word Wrap"
          >
            <WrapText className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded border border-slate-700 transition-colors"
            title="Copy file contents"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>

          <button
            onClick={() => onDownloadSingleFile(file)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-emerald-900/60 text-slate-200 hover:text-emerald-300 text-xs rounded border border-slate-700 hover:border-emerald-700 transition-colors"
            title="Download this single file"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="text-[11px]">Save File</span>
          </button>
        </div>
      </div>

      {/* Editor Body with Monospace TextArea */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Line Numbers Bar */}
        <div className="w-12 bg-slate-900/90 select-none py-3 px-1 text-right text-[11px] font-mono text-slate-600 border-r border-slate-800/80 overflow-hidden shrink-0">
          {Array.from({ length: Math.max(lineCount, 1) }).map((_, idx) => (
            <div key={idx} className="leading-6">
              {idx + 1}
            </div>
          ))}
        </div>

        {/* Code Input */}
        <div className="flex-1 relative h-full">
          <textarea
            value={file.content}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            className={`w-full h-full p-3 bg-transparent text-slate-100 font-mono text-xs leading-6 resize-none focus:outline-none ${
              wordWrap ? 'whitespace-pre-wrap' : 'whitespace-pre overflow-x-auto'
            }`}
            placeholder="Enter or paste your file contents here..."
          />
        </div>
      </div>

      {/* Status Footer */}
      <div className="px-4 py-1.5 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
        <div className="flex items-center gap-4">
          <span>Lines: {lineCount}</span>
          <span>Chars: {charCount}</span>
          <span>Size: {formattedSize}</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400/80">
          <Code2 className="w-3.5 h-3.5" />
          <span>TgTechnoLogy Engine Ready</span>
        </div>
      </div>
    </div>
  );
};
