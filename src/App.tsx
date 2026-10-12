import React, { useState, useMemo, useCallback } from 'react';
import { ActiveTab, PluginMeta, PluginTemplate, VirtualFile } from './types';
import { PLUGIN_TEMPLATES } from './utils/templates';
import { 
  validatePluginStructure, 
  parsePluginYml, 
  generatePluginYml, 
  parsePhpClass, 
  calculatePsr4Path 
} from './utils/pocketmineValidator';
import { generateZipBlob, generatePharBlob, triggerDownload } from './utils/pharBuilder';

import { Header } from './components/Header';
import { PluginMaker } from './components/PluginMaker';
import { TextToFileConverter } from './components/TextToFileConverter';
import { TemplatesView } from './components/TemplatesView';
import { DiagnosticsView } from './components/DiagnosticsView';
import { Check, Info, Sparkles, X } from 'lucide-react';

export default function App() {
  const defaultTemplate = PLUGIN_TEMPLATES[0]; // OpSword starter

  const [activeTab, setActiveTab] = useState<ActiveTab>('plugin-maker');

  // Metadata
  const [meta, setMeta] = useState<PluginMeta>({
    name: defaultTemplate.pluginName,
    version: defaultTemplate.pluginVersion,
    api: defaultTemplate.apiVersion,
    main: `${defaultTemplate.pluginName}\\Main`,
    author: defaultTemplate.author,
    description: defaultTemplate.description,
  });

  // Virtual Files
  const [files, setFiles] = useState<VirtualFile[]>(() =>
    defaultTemplate.files.map((f, i) => ({
      id: `file-${i}`,
      path: f.path,
      content: f.content,
      type: f.path.endsWith('.php') ? 'php' : f.path.endsWith('.yml') ? 'yml' : 'other',
    }))
  );

  const [activeFileId, setActiveFileId] = useState<string>('file-0');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Find plugin.yml and Main.php
  const pluginYmlFile = files.find((f) => f.path.endsWith('plugin.yml')) || files[0];
  const mainPhpFile = files.find((f) => f.path.includes('Main.php') || f.path.endsWith('.php')) || files[1] || files[0];

  // Derive PHP Class Info & PSR-4 Path
  const phpInfo = useMemo(() => {
    return parsePhpClass(mainPhpFile?.content || '');
  }, [mainPhpFile?.content]);

  const psr4Path = useMemo(() => {
    const namespace = phpInfo.namespace || meta.name || 'OpSword';
    const className = phpInfo.className || 'Main';
    return calculatePsr4Path(namespace, className);
  }, [phpInfo.namespace, phpInfo.className, meta.name]);

  // Validation issues
  const validationResult = useMemo(() => {
    return validatePluginStructure(
      pluginYmlFile?.content || '',
      mainPhpFile?.content || '',
      files
    );
  }, [pluginYmlFile?.content, mainPhpFile?.content, files]);

  // Handle Meta Changes from UI inputs
  const handleMetaChange = (updated: Partial<PluginMeta>) => {
    const newMeta = { ...meta, ...updated };
    if (updated.name && !updated.main) {
      newMeta.main = `${updated.name}\\Main`;
    }
    setMeta(newMeta);

    // Update plugin.yml content
    const updatedYmlContent = generatePluginYml(newMeta);
    setFiles((prev) =>
      prev.map((f) => {
        if (f.path === 'plugin.yml') {
          return { ...f, content: updatedYmlContent };
        }
        // If plugin name changed, update Main.php path
        if (updated.name && f.path.includes('Main.php')) {
          const newPath = calculatePsr4Path(updated.name, phpInfo.className || 'Main');
          return { ...f, path: newPath };
        }
        return f;
      })
    );
  };

  // Handle File Content Changes in Editor
  const handleFileContentChange = (id: string, content: string) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          // If editing plugin.yml, sync back to meta
          if (f.path === 'plugin.yml') {
            const parsed = parsePluginYml(content);
            setMeta((m) => ({
              ...m,
              name: parsed.name || m.name,
              version: parsed.version || m.version,
              api: parsed.api || m.api,
              main: parsed.main || m.main,
              author: parsed.author || m.author,
              description: parsed.description || m.description,
            }));
          }
          // If editing Main.php, dynamically update path if namespace/class changed
          if (f.path.includes('Main.php') || f.path.endsWith('.php')) {
            const info = parsePhpClass(content);
            if (info.namespace || info.className) {
              const newPath = calculatePsr4Path(info.namespace || meta.name, info.className || 'Main');
              return { ...f, content, path: newPath };
            }
          }
          return { ...f, content };
        }
        return f;
      })
    );
  };

  // Add custom file
  const handleAddFile = (path: string, content: string) => {
    const newFile: VirtualFile = {
      id: `file-${Date.now()}`,
      path,
      content,
      type: path.endsWith('.php') ? 'php' : path.endsWith('.yml') ? 'yml' : 'other',
      isCustom: true,
    };
    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
    showToast(`Added file: ${path}`);
  };

  // Delete file
  const handleDeleteFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (activeFileId === id) {
      setActiveFileId(files[0]?.id || '');
    }
    showToast('File removed');
  };

  // Upload plugin.yml
  const handleUploadPluginYml = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = parsePluginYml(text);
      setMeta((prev) => ({
        ...prev,
        name: parsed.name || prev.name,
        version: parsed.version || prev.version,
        api: parsed.api || prev.api,
        main: parsed.main || prev.main,
        author: parsed.author || prev.author,
        description: parsed.description || prev.description,
      }));

      setFiles((prev) => {
        const exists = prev.find((f) => f.path === 'plugin.yml');
        if (exists) {
          return prev.map((f) => (f.path === 'plugin.yml' ? { ...f, content: text } : f));
        }
        return [{ id: `file-${Date.now()}`, path: 'plugin.yml', content: text, type: 'yml' }, ...prev];
      });
      showToast('Uploaded plugin.yml successfully!');
    } catch {
      showToast('Error reading uploaded plugin.yml');
    }
  };

  // Upload Main.php
  const handleUploadMainPhp = async (file: File) => {
    try {
      const text = await file.text();
      const info = parsePhpClass(text);
      const targetPath = calculatePsr4Path(info.namespace || meta.name, info.className || 'Main');

      setFiles((prev) => {
        const remaining = prev.filter((f) => !f.path.includes('Main.php'));
        const newMainFile: VirtualFile = {
          id: `file-main-${Date.now()}`,
          path: targetPath,
          content: text,
          type: 'php',
        };
        return [...remaining, newMainFile];
      });

      // Update main in plugin.yml if needed
      if (info.fullQualifiedName) {
        setMeta((m) => ({ ...m, main: info.fullQualifiedName }));
      }
      showToast(`Uploaded Main.php! Organized into ${targetPath}`);
    } catch {
      showToast('Error reading uploaded Main.php');
    }
  };

  // Auto-Fix All Mistakes (Single Click Solver)
  const handleAutoFixAll = useCallback(() => {
    const { suggestedYml, suggestedPhp, suggestedPsr4Path } = validationResult;

    setFiles((prev) =>
      prev.map((f) => {
        if (f.path === 'plugin.yml') {
          return { ...f, content: suggestedYml };
        }
        if (f.path.includes('Main.php') || f.path.endsWith('.php')) {
          return { ...f, content: suggestedPhp, path: suggestedPsr4Path };
        }
        return f;
      })
    );

    // Sync meta
    const parsed = parsePluginYml(suggestedYml);
    setMeta((m) => ({
      ...m,
      name: parsed.name || m.name,
      version: parsed.version || m.version,
      api: parsed.api || m.api,
      main: parsed.main || m.main,
    }));

    showToast('✨ All syntax, YAML and PSR-4 namespace mistakes solved!');
  }, [validationResult]);

  // Template Selection
  const handleSelectTemplate = (template: PluginTemplate) => {
    setMeta({
      name: template.pluginName,
      version: template.pluginVersion,
      api: template.apiVersion,
      main: `${template.pluginName}\\Main`,
      author: template.author,
      description: template.description,
    });

    const newFiles: VirtualFile[] = template.files.map((f, i) => ({
      id: `tmpl-${i}-${Date.now()}`,
      path: f.path,
      content: f.content,
      type: f.path.endsWith('.php') ? 'php' : f.path.endsWith('.yml') ? 'yml' : 'other',
    }));

    setFiles(newFiles);
    setActiveFileId(newFiles[0].id);
    setActiveTab('plugin-maker');
    showToast(`Loaded ${template.name} preset into workspace!`);
  };

  // Exports
  const handleExportZip = async () => {
    try {
      const zipBlob = await generateZipBlob(files);
      const filename = `${meta.name || 'PocketMine_Plugin'}_v${meta.version || '1.0.0'}.zip`;
      triggerDownload(zipBlob, filename);
      showToast(`Exported ${filename}`);
    } catch {
      showToast('Failed to build ZIP archive');
    }
  };

  const handleExportPhar = async () => {
    try {
      const pharBlob = await generatePharBlob(files, meta.name || 'Plugin');
      const filename = `${meta.name || 'PocketMine_Plugin'}_v${meta.version || '1.0.0'}.phar`;
      triggerDownload(pharBlob, filename);
      showToast(`Compiled & Downloaded ${filename}`);
    } catch {
      showToast('Failed to compile PHAR binary');
    }
  };

  const handleDownloadSingleFile = (file: VirtualFile) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const filename = file.path.split('/').pop() || 'file.txt';
    triggerDownload(blob, filename);
    showToast(`Downloaded ${filename}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        issuesCount={validationResult.issues.length}
        onQuickExportZip={handleExportZip}
        onQuickExportPhar={handleExportPhar}
        pluginName={meta.name}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'plugin-maker' && (
          <PluginMaker
            meta={meta}
            onMetaChange={handleMetaChange}
            files={files}
            activeFileId={activeFileId}
            onSelectFile={setActiveFileId}
            onFileContentChange={handleFileContentChange}
            onAddFile={handleAddFile}
            onDeleteFile={handleDeleteFile}
            onUploadPluginYml={handleUploadPluginYml}
            onUploadMainPhp={handleUploadMainPhp}
            psr4Path={psr4Path}
            issues={validationResult.issues}
            onAutoFixAll={handleAutoFixAll}
            onExportZip={handleExportZip}
            onExportPhar={handleExportPhar}
            onDownloadSingleFile={handleDownloadSingleFile}
          />
        )}

        {activeTab === 'text-to-file' && (
          <TextToFileConverter />
        )}

        {activeTab === 'templates' && (
          <TemplatesView
            onSelectTemplate={handleSelectTemplate}
            currentPluginName={meta.name}
          />
        )}

        {activeTab === 'inspector' && (
          <DiagnosticsView
            issues={validationResult.issues}
            onAutoFixAll={handleAutoFixAll}
            psr4Path={psr4Path}
            pluginName={meta.name}
            mainEntry={meta.main || `${meta.name}\\Main`}
          />
        )}
      </main>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-900 border border-emerald-500/40 text-slate-100 rounded-xl shadow-2xl shadow-emerald-950/80 text-xs font-medium backdrop-blur-md">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-slate-400 hover:text-slate-200 p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-4 border-t border-slate-900 text-center text-xs text-slate-500 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-bold text-slate-400">TgTechnoLogy</span> • Minecraft Bedrock & PocketMine-MP Developer Tool
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
            <span>PSR-4 Auto-Structuring</span>
            <span>•</span>
            <span>ZIP / PHAR Engine</span>
            <span>•</span>
            <span>Live Syntax Solver</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
