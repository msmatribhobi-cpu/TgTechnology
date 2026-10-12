import React, { useState } from 'react';
import { 
  FileCode, 
  Download, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Layers, 
  FileText, 
  Binary, 
  Code2, 
  FolderArchive,
  ArrowRightLeft,
  Sparkles
} from 'lucide-react';
import { VirtualFile } from '../types';
import { generateZipBlob, generatePharBlob, triggerDownload } from '../utils/pharBuilder';

interface TextToFileConverterProps {
  onLoadIntoPluginMaker?: (files: VirtualFile[]) => void;
}

export const TextToFileConverter: React.FC<TextToFileConverterProps> = ({
  onLoadIntoPluginMaker,
}) => {
  const [files, setFiles] = useState<VirtualFile[]>([
    {
      id: 'text-file-1',
      path: 'script.php',
      content: `<?php\n// Converted by TgTechnoLogy Text-To-File\necho "Hello from TgTechnoLogy!";\n`,
      type: 'php',
    },
  ]);

  const [activeFileId, setActiveFileId] = useState<string>('text-file-1');
  const [newFileName, setNewFileName] = useState('config.yml');
  const [selectedExt, setSelectedExt] = useState('.yml');
  const [copied, setCopied] = useState(false);
  const [conversionNote, setConversionNote] = useState<string | null>(null);

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  const handleAddFile = () => {
    let name = newFileName.trim();
    if (!name) name = `file_${files.length + 1}${selectedExt}`;
    if (!name.includes('.')) name += selectedExt;

    const newFile: VirtualFile = {
      id: `text-file-${Date.now()}`,
      path: name,
      content: `# New converted file\n# Created with TgTechnoLogy\n`,
      type: name.endsWith('.php') ? 'php' : name.endsWith('.yml') ? 'yml' : 'txt',
    };

    setFiles([...files, newFile]);
    setActiveFileId(newFile.id);
    setNewFileName('');
  };

  const handleUpdateContent = (content: string) => {
    setFiles(files.map((f) => (f.id === activeFile.id ? { ...f, content } : f)));
  };

  const handleUpdatePath = (newPath: string) => {
    setFiles(files.map((f) => (f.id === activeFile.id ? { ...f, path: newPath } : f)));
  };

  const handleDeleteFile = (id: string) => {
    if (files.length <= 1) return;
    const remaining = files.filter((f) => f.id !== id);
    setFiles(remaining);
    if (activeFileId === id) {
      setActiveFileId(remaining[0].id);
    }
  };

  const handleDownloadSingle = (file: VirtualFile) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    triggerDownload(blob, file.path.split('/').pop() || 'file.txt');
  };

  const handleDownloadZip = async () => {
    const blob = await generateZipBlob(files);
    triggerDownload(blob, 'TgTechnoLogy_Files.zip');
  };

  const handleDownloadPhar = async () => {
    const blob = await generatePharBlob(files, 'TgTechnoLogy_Archive');
    triggerDownload(blob, 'TgTechnoLogy_Files.phar');
  };

  // Quick Text Transformers
  const handleBase64Encode = () => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(activeFile.content)));
      handleUpdateContent(encoded);
      setConversionNote('Converted text to Base64');
      setTimeout(() => setConversionNote(null), 2500);
    } catch {
      setConversionNote('Encoding failed');
    }
  };

  const handleBase64Decode = () => {
    try {
      const decoded = decodeURIComponent(escape(atob(activeFile.content)));
      handleUpdateContent(decoded);
      setConversionNote('Decoded Base64 to Plain Text');
      setTimeout(() => setConversionNote(null), 2500);
    } catch {
      setConversionNote('Invalid Base64 string');
      setTimeout(() => setConversionNote(null), 2500);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Intro banner */}
      <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <FileCode className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-100">
              Text to File Converter & Archive Packager
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Convert any text into PHP, YAML, JSON, TXT, or Minecraft format, and compile into single files, ZIP or PHAR archives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadZip}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors shadow-sm"
          >
            <FolderArchive className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download All as .ZIP</span>
          </button>

          <button
            onClick={handleDownloadPhar}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-lg shadow-md border border-emerald-400/30 transition-all hover:scale-[1.02]"
          >
            <Binary className="w-3.5 h-3.5 text-emerald-100" />
            <span>Compile into .PHAR</span>
          </button>
        </div>
      </div>

      {/* Main Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[600px]">
        {/* Left: Files & Format selector */}
        <div className="lg:col-span-4 flex flex-col h-full bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden">
          {/* Add file bar */}
          <div className="p-3 bg-slate-900 border-b border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              File Queue ({files.length})
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="e.g. data.json or src/Main.php"
                className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                onKeyDown={(e) => e.key === 'Enter' && handleAddFile()}
              />
              <button
                onClick={handleAddFile}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Quick Extension Selector */}
            <div className="flex flex-wrap gap-1 pt-1">
              {['.php', '.yml', '.json', '.txt', '.mcfunction', '.md', '.ini', '.env'].map((ext) => (
                <button
                  key={ext}
                  onClick={() => {
                    setSelectedExt(ext);
                    setNewFileName((prev) => {
                      const base = prev.includes('.') ? prev.split('.')[0] : prev || 'file';
                      return `${base}${ext}`;
                    });
                  }}
                  className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                    newFileName.endsWith(ext)
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {ext}
                </button>
              ))}
            </div>
          </div>

          {/* Files List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {files.map((file) => {
              const isActive = file.id === activeFile.id;
              return (
                <div
                  key={file.id}
                  onClick={() => setActiveFileId(file.id)}
                  className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                    isActive
                      ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-medium'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-xs font-mono truncate">{file.path}</span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadSingle(file);
                      }}
                      className="p-1 text-slate-400 hover:text-emerald-300 hover:bg-slate-800 rounded"
                      title="Download file"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                    {files.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFile(file.id);
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded"
                        title="Delete file"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Encodings / Utilities */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <ArrowRightLeft className="w-3 h-3 text-emerald-400" />
              <span>Text Format Tools</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={handleBase64Encode}
                className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs rounded border border-slate-800 text-center font-mono"
              >
                Base64 Encode
              </button>
              <button
                onClick={handleBase64Decode}
                className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs rounded border border-slate-800 text-center font-mono"
              >
                Base64 Decode
              </button>
            </div>
            {conversionNote && (
              <div className="text-[11px] text-emerald-400 font-medium text-center">
                {conversionNote}
              </div>
            )}
          </div>
        </div>

        {/* Right: Text Input & File Config */}
        <div className="lg:col-span-8 flex flex-col h-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
          {/* File header bar */}
          <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-slate-400 font-semibold">Filename:</span>
              <input
                type="text"
                value={activeFile.path}
                onChange={(e) => handleUpdatePath(e.target.value)}
                className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500 w-64"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={() => handleDownloadSingle(activeFile)}
                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save File</span>
              </button>
            </div>
          </div>

          {/* Raw Text Box */}
          <div className="flex-1 p-3">
            <textarea
              value={activeFile.content}
              onChange={(e) => handleUpdateContent(e.target.value)}
              placeholder="Paste or write any text to convert into a file here..."
              className="w-full h-full bg-transparent text-slate-100 font-mono text-xs leading-relaxed resize-none focus:outline-none"
              spellCheck={false}
            />
          </div>

          {/* Footer stats */}
          <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between font-mono">
            <div>
              {activeFile.content.split('\n').length} lines • {activeFile.content.length} chars •{' '}
              {new TextEncoder().encode(activeFile.content).length} bytes
            </div>
            <div className="text-emerald-400">
              Format: {activeFile.path.split('.').pop()?.toUpperCase() || 'RAW'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
