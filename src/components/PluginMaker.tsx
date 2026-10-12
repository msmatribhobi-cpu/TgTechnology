import React from 'react';
import { PluginMeta, ValidationIssue, VirtualFile } from '../types';
import { FileTreeViewer } from './FileTreeViewer';
import { CodeEditor } from './CodeEditor';
import { ValidationBanner } from './ValidationBanner';
import { 
  Package, 
  Settings2, 
  Cpu, 
  Layers, 
  Download, 
  Sparkles, 
  RefreshCw,
  Tag,
  User,
  Info,
  Sliders,
  FolderTree
} from 'lucide-react';

interface PluginMakerProps {
  meta: PluginMeta;
  onMetaChange: (updated: Partial<PluginMeta>) => void;
  files: VirtualFile[];
  activeFileId: string;
  onSelectFile: (id: string) => void;
  onFileContentChange: (id: string, content: string) => void;
  onAddFile: (path: string, content: string) => void;
  onDeleteFile: (id: string) => void;
  onUploadPluginYml: (file: File) => void;
  onUploadMainPhp: (file: File) => void;
  psr4Path: string;
  issues: ValidationIssue[];
  onAutoFixAll: () => void;
  onExportZip: () => void;
  onExportPhar: () => void;
  onDownloadSingleFile: (file: VirtualFile) => void;
}

export const PluginMaker: React.FC<PluginMakerProps> = ({
  meta,
  onMetaChange,
  files,
  activeFileId,
  onSelectFile,
  onFileContentChange,
  onAddFile,
  onDeleteFile,
  onUploadPluginYml,
  onUploadMainPhp,
  psr4Path,
  issues,
  onAutoFixAll,
  onExportZip,
  onExportPhar,
  onDownloadSingleFile,
}) => {
  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  return (
    <div className="space-y-4">
      {/* Top Quick Configuration & Metadata Strip */}
      <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Metadata Inputs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
            {/* Plugin Name */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-emerald-400" />
                <span>Plugin Name</span>
              </label>
              <input
                type="text"
                value={meta.name}
                onChange={(e) => onMetaChange({ name: e.target.value })}
                placeholder="e.g. OpSword"
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-semibold text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* API Version */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                <span>API Version</span>
              </label>
              <div className="relative">
                <select
                  value={['2.0.0', '3.0.0', '4.0.0', '5.0.0', '5.10.0'].includes(meta.api) ? meta.api : 'custom'}
                  onChange={(e) => {
                    if (e.target.value !== 'custom') {
                      onMetaChange({ api: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-semibold text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                >
                  <option value="5.0.0">5.0.0 (PocketMine 5.x)</option>
                  <option value="4.0.0">4.0.0 (PocketMine 4.x)</option>
                  <option value="3.0.0">3.0.0 (PocketMine 3.x)</option>
                  <option value="2.0.0">2.0.0 (PocketMine 2.x)</option>
                  <option value="custom">Custom API...</option>
                </select>
              </div>
            </div>

            {/* Plugin Version */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-emerald-400" />
                <span>Version</span>
              </label>
              <input
                type="text"
                value={meta.version}
                onChange={(e) => onMetaChange({ version: e.target.value })}
                placeholder="e.g. 1.6.0"
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-semibold text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* Author */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Author</span>
              </label>
              <input
                type="text"
                value={meta.author}
                onChange={(e) => onMetaChange({ author: e.target.value })}
                placeholder="e.g. TgTechnoLogy"
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-semibold text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Quick Stats / Namespace Indicator */}
          <div className="flex flex-col justify-center px-4 py-2 bg-slate-950 rounded-lg border border-slate-800 text-xs shrink-0">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1">
              <FolderTree className="w-3 h-3 text-emerald-400" />
              <span>Resolved Entry Point</span>
            </div>
            <div className="font-mono text-emerald-300 font-bold mt-0.5">
              {meta.main || `${meta.name}\\Main`}
            </div>
          </div>

        </div>
      </div>

      {/* Real-time Diagnostics & Auto-Solver Banner */}
      <ValidationBanner issues={issues} onAutoFixAll={onAutoFixAll} />

      {/* Main Split Layout: File Tree (Left) & Code Editor (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[620px]">
        {/* Left Column: Explorer & Uploads */}
        <div className="lg:col-span-4 h-full">
          <FileTreeViewer
            files={files}
            activeFileId={activeFileId}
            onSelectFile={onSelectFile}
            onAddFile={onAddFile}
            onDeleteFile={onDeleteFile}
            onUploadPluginYml={onUploadPluginYml}
            onUploadMainPhp={onUploadMainPhp}
            psr4Path={psr4Path}
          />
        </div>

        {/* Right Column: Code Editor */}
        <div className="lg:col-span-8 h-full">
          {activeFile ? (
            <CodeEditor
              file={activeFile}
              onChange={(content) => onFileContentChange(activeFile.id, content)}
              onDownloadSingleFile={onDownloadSingleFile}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-slate-950 rounded-xl border border-slate-800 text-slate-500 text-sm">
              Select a file from the explorer on the left to edit.
            </div>
          )}
        </div>
      </div>

      {/* Bottom Export Strip */}
      <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100">
              Export {meta.name || 'Plugin'} Archive
            </h4>
            <p className="text-xs text-slate-400">
              Includes auto-structured PSR-4 namespace directories and valid plugin.yml descriptor.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onExportZip}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold rounded-lg border border-slate-700 hover:border-slate-600 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Download .ZIP</span>
          </button>

          <button
            onClick={onExportPhar}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-950/60 border border-emerald-400/40 transition-all hover:scale-[1.02]"
          >
            <Cpu className="w-4 h-4 text-emerald-100" />
            <span>Compile .PHAR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
