import React, { useState } from 'react';
import { VirtualFile } from '../types';
import { 
  FileText, 
  Folder, 
  Plus, 
  Trash2, 
  Upload, 
  CheckCircle2, 
  FileCode2,
  Settings,
  HelpCircle,
  FileCheck
} from 'lucide-react';

interface FileTreeViewerProps {
  files: VirtualFile[];
  activeFileId: string;
  onSelectFile: (id: string) => void;
  onAddFile: (path: string, content: string) => void;
  onDeleteFile: (id: string) => void;
  onUploadPluginYml: (file: File) => void;
  onUploadMainPhp: (file: File) => void;
  psr4Path: string;
}

export const FileTreeViewer: React.FC<FileTreeViewerProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onAddFile,
  onDeleteFile,
  onUploadPluginYml,
  onUploadMainPhp,
  psr4Path,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newFilePath, setNewFilePath] = useState('');

  const handleCreateFile = () => {
    if (!newFilePath.trim()) return;
    let path = newFilePath.trim();
    if (!path.startsWith('src/') && !path.startsWith('resources/') && !path.includes('.')) {
      path = `src/${path}.php`;
    }
    const isPhp = path.endsWith('.php');
    const isYml = path.endsWith('.yml') || path.endsWith('.yaml');
    
    let defaultContent = '';
    if (isPhp) {
      defaultContent = `<?php\n\ndeclare(strict_types=1);\n\n// Custom Class for PocketMine-MP\n`;
    } else if (isYml) {
      defaultContent = `# Configuration file\nkey: value\n`;
    } else {
      defaultContent = `// File content\n`;
    }

    onAddFile(path, defaultContent);
    setNewFilePath('');
    setIsAdding(false);
  };

  const getFileIcon = (file: VirtualFile) => {
    if (file.path.endsWith('plugin.yml')) {
      return <Settings className="w-4 h-4 text-amber-400 shrink-0" />;
    }
    if (file.path.endsWith('.php')) {
      return <FileCode2 className="w-4 h-4 text-purple-400 shrink-0" />;
    }
    if (file.path.endsWith('.yml') || file.path.endsWith('.yaml')) {
      return <FileText className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
    return <FileText className="w-4 h-4 text-slate-400 shrink-0" />;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Plugin Structure (PSR-4)
          </span>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
          title="Add new file or resource"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* New File Inline Creator */}
      {isAdding && (
        <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex flex-col gap-2">
          <div className="text-[11px] text-slate-400 font-medium">New File Path:</div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newFilePath}
              onChange={(e) => setNewFilePath(e.target.value)}
              placeholder="e.g. resources/config.yml or src/OpSword/Utils.php"
              className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()}
            />
            <button
              onClick={handleCreateFile}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* PSR-4 Root Info Pill */}
      <div className="px-3 py-2 bg-emerald-950/30 border-b border-emerald-900/30 flex items-center gap-2">
        <FileCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <div className="text-[11px] text-slate-300 truncate">
          Main Path: <span className="font-mono text-emerald-300 font-semibold">{psr4Path}</span>
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {files.map((file) => {
          const isActive = file.id === activeFileId;
          const isCore = file.path === 'plugin.yml' || file.path.includes('Main.php');

          return (
            <div
              key={file.id}
              onClick={() => onSelectFile(file.id)}
              className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                isActive
                  ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-medium'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {getFileIcon(file)}
                <span className="text-xs font-mono truncate">{file.path}</span>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {isCore ? (
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-sans">
                    Required
                  </span>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFile(file.id);
                    }}
                    className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                    title="Delete file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Drag/Drop Actions for User Requirements */}
      <div className="p-3 bg-slate-950/70 border-t border-slate-800 space-y-2">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Upload className="w-3.5 h-3.5 text-emerald-400" />
          <span>Upload Existing Files</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Upload plugin.yml */}
          <label className="flex flex-col items-center justify-center p-2 bg-slate-900 hover:bg-slate-800/80 border border-dashed border-slate-700 hover:border-emerald-500/50 rounded-lg cursor-pointer transition-colors text-center group">
            <span className="text-xs font-medium text-slate-300 group-hover:text-emerald-300">
              plugin.yml
            </span>
            <span className="text-[10px] text-slate-500">Upload YAML</span>
            <input
              type="file"
              accept=".yml,.yaml"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUploadPluginYml(file);
              }}
            />
          </label>

          {/* Upload Main.php */}
          <label className="flex flex-col items-center justify-center p-2 bg-slate-900 hover:bg-slate-800/80 border border-dashed border-slate-700 hover:border-emerald-500/50 rounded-lg cursor-pointer transition-colors text-center group">
            <span className="text-xs font-medium text-slate-300 group-hover:text-emerald-300">
              Main.php
            </span>
            <span className="text-[10px] text-slate-500">Upload PHP</span>
            <input
              type="file"
              accept=".php"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUploadMainPhp(file);
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
};
