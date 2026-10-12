export type PocketMineApiVersion = '2.0.0' | '3.0.0' | '4.0.0' | '5.0.0' | '5.10.0' | 'Custom';

export interface PluginMeta {
  name: string;
  version: string;
  api: string;
  main: string;
  author: string;
  description: string;
  website?: string;
  prefix?: string;
  load?: 'STARTUP' | 'POSTWORLD';
  commands?: Record<string, {
    description?: string;
    usage?: string;
    permission?: string;
    aliases?: string[];
  }>;
  permissions?: Record<string, {
    description?: string;
    default?: 'true' | 'false' | 'op' | 'notop';
  }>;
}

export interface VirtualFile {
  id: string;
  path: string; // e.g. "plugin.yml", "src/OpSword/Main.php", "resources/config.yml"
  content: string;
  type: 'yml' | 'php' | 'json' | 'txt' | 'other';
  isCustom?: boolean;
}

export interface ValidationIssue {
  id: string;
  level: 'error' | 'warning' | 'info';
  category: 'plugin.yml' | 'Main.php' | 'Namespace' | 'API Compatibility' | 'General';
  message: string;
  explanation: string;
  fixable: boolean;
  fixAction?: () => void;
  suggestedFix?: string;
}

export interface PluginTemplate {
  id: string;
  name: string;
  tagline: string;
  apiVersion: string;
  pluginVersion: string;
  pluginName: string;
  author: string;
  description: string;
  files: { path: string; content: string }[];
}

export type ActiveTab = 'plugin-maker' | 'text-to-file' | 'templates' | 'inspector';
