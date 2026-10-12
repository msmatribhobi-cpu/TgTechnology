import { PluginMeta, ValidationIssue, VirtualFile } from '../types';

/**
 * Basic YAML parser and serializer for PocketMine plugin.yml
 */
export function parsePluginYml(ymlContent: string): Partial<PluginMeta> {
  const result: Partial<PluginMeta> = {};
  const lines = ymlContent.split('\n');

  let currentSection = '';

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    // Check top-level keys
    if (!rawLine.startsWith(' ') && !rawLine.startsWith('\t') && line.includes(':')) {
      const parts = line.split(':');
      const key = parts[0].trim();
      const value = parts.slice(1).join(':').trim().replace(/^['"]|['"]$/g, '');

      if (['name', 'version', 'api', 'main', 'author', 'description', 'website', 'prefix', 'load'].includes(key)) {
        (result as any)[key] = value;
      }
      currentSection = key;
    }
  }

  return result;
}

/**
 * Format metadata object back into a clean, compliant PocketMine plugin.yml
 */
export function generatePluginYml(meta: PluginMeta): string {
  let yml = `name: ${meta.name || 'MyPlugin'}
version: ${meta.version || '1.0.0'}
api: ${Array.isArray(meta.api) ? `[${meta.api.join(', ')}]` : meta.api || '4.0.0'}
main: ${meta.main || `${meta.name || 'MyPlugin'}\\Main`}
author: ${meta.author || 'TgTechnoLogy'}
description: ${meta.description || 'A PocketMine-MP plugin created with TgTechnoLogy'}
`;

  if (meta.website) {
    yml += `website: ${meta.website}\n`;
  }
  if (meta.prefix) {
    yml += `prefix: ${meta.prefix}\n`;
  }
  if (meta.load) {
    yml += `load: ${meta.load}\n`;
  }

  if (meta.commands && Object.keys(meta.commands).length > 0) {
    yml += `\ncommands:\n`;
    for (const [cmd, details] of Object.entries(meta.commands)) {
      yml += `  ${cmd}:\n`;
      if (details.description) yml += `    description: "${details.description}"\n`;
      if (details.usage) yml += `    usage: "${details.usage}"\n`;
      if (details.permission) yml += `    permission: "${details.permission}"\n`;
      if (details.aliases && details.aliases.length > 0) {
        yml += `    aliases: [${details.aliases.join(', ')}]\n`;
      }
    }
  }

  if (meta.permissions && Object.keys(meta.permissions).length > 0) {
    yml += `\npermissions:\n`;
    for (const [perm, details] of Object.entries(meta.permissions)) {
      yml += `  ${perm}:\n`;
      if (details.description) yml += `    description: "${details.description}"\n`;
      if (details.default) yml += `    default: ${details.default}\n`;
    }
  }

  return yml;
}

/**
 * Analyzes PHP source to extract namespace and main class name
 */
export function parsePhpClass(phpContent: string): {
  namespace: string;
  className: string;
  extendsClass: string | null;
  implementsInterfaces: string[];
  fullQualifiedName: string;
  hasPhpTag: boolean;
  hasPluginBaseUse: boolean;
  usesListener: boolean;
  onEnableReturnTyped: boolean;
} {
  const hasPhpTag = /<\?php/i.test(phpContent);

  // Extract namespace
  const namespaceMatch = phpContent.match(/namespace\s+([a-zA-Z0-9_\\]+)\s*;/i);
  const namespace = namespaceMatch ? namespaceMatch[1].trim() : '';

  // Extract class name & extends
  const classMatch = phpContent.match(/class\s+([a-zA-Z0-9_]+)(?:\s+extends\s+([a-zA-Z0-9_\\]+))?(?:\s+implements\s+([a-zA-Z0-9_\\,\s]+))?/i);
  const className = classMatch ? classMatch[1].trim() : 'Main';
  const extendsClass = classMatch && classMatch[2] ? classMatch[2].trim() : null;
  const implementsString = classMatch && classMatch[3] ? classMatch[3].trim() : '';
  const implementsInterfaces = implementsString
    ? implementsString.split(',').map(i => i.trim()).filter(Boolean)
    : [];

  const fullQualifiedName = namespace ? `${namespace}\\${className}` : className;
  const hasPluginBaseUse = /use\s+pocketmine\\plugin\\PluginBase\s*;/i.test(phpContent);
  const usesListener = /implements\s+.*Listener/i.test(phpContent) || /use\s+pocketmine\\event\\Listener\s*;/i.test(phpContent);
  const onEnableReturnTyped = /function\s+onEnable\s*\([^)]*\)\s*:\s*void/i.test(phpContent);

  return {
    namespace,
    className,
    extendsClass,
    implementsInterfaces,
    fullQualifiedName,
    hasPhpTag,
    hasPluginBaseUse,
    usesListener,
    onEnableReturnTyped,
  };
}

/**
 * Calculates PSR-4 File Path based on namespace and class name
 * e.g., Namespace "OpSword" and Class "Main" -> "src/OpSword/Main.php"
 * e.g., Namespace "TgTech\OpSword" and Class "Main" -> "src/TgTech/OpSword/Main.php"
 */
export function calculatePsr4Path(namespace: string, className: string): string {
  const cleanNamespace = namespace.replace(/^\\+|\\+$/g, '').trim();
  const cleanClass = (className || 'Main').trim();

  if (!cleanNamespace) {
    return `src/${cleanClass}.php`;
  }

  const parts = cleanNamespace.split('\\').filter(Boolean);
  return `src/${parts.join('/')}/${cleanClass}.php`;
}

/**
 * Comprehensive PocketMine-MP validation & mistake solver
 */
export function validatePluginStructure(
  ymlContent: string,
  phpContent: string,
  currentFiles: VirtualFile[]
): {
  issues: ValidationIssue[];
  suggestedYml: string;
  suggestedPhp: string;
  suggestedPsr4Path: string;
} {
  const issues: ValidationIssue[] = [];
  const ymlMeta = parsePluginYml(ymlContent);
  const phpInfo = parsePhpClass(phpContent);

  // 1. Validate PHP Open Tag
  if (!phpInfo.hasPhpTag) {
    issues.push({
      id: 'missing-php-tag',
      level: 'error',
      category: 'Main.php',
      message: 'Missing <?php open tag in Main.php',
      explanation: 'PHP files must begin with <?php on the very first line for PocketMine-MP to parse the file.',
      fixable: true,
      suggestedFix: 'Add <?php to the top of the file.',
    });
  }

  // 2. Validate Namespace
  if (!phpInfo.namespace) {
    issues.push({
      id: 'missing-namespace',
      level: 'warning',
      category: 'Namespace',
      message: 'No namespace defined in Main.php',
      explanation: 'PocketMine-MP plugins should use PSR-4 namespaces (e.g. namespace OpSword; or namespace TgTech\\OpSword;).',
      fixable: true,
      suggestedFix: `Set namespace to "${ymlMeta.name || 'MyPlugin'}".`,
    });
  }

  // 3. Validate PluginBase inheritance
  if (!phpInfo.extendsClass || !phpInfo.extendsClass.endsWith('PluginBase')) {
    issues.push({
      id: 'missing-pluginbase-extends',
      level: 'error',
      category: 'Main.php',
      message: 'Main class does not extend PluginBase',
      explanation: 'PocketMine plugin entry point classes must extend PluginBase to receive server lifecycle callbacks (onEnable, onDisable).',
      fixable: true,
      suggestedFix: `Update class declaration to "class ${phpInfo.className || 'Main'} extends PluginBase".`,
    });
  }

  // 4. Validate PluginBase import
  if (!phpInfo.hasPluginBaseUse && (!phpInfo.extendsClass || !phpInfo.extendsClass.startsWith('\\pocketmine\\plugin\\'))) {
    issues.push({
      id: 'missing-pluginbase-import',
      level: 'warning',
      category: 'Main.php',
      message: 'Missing "use pocketmine\\plugin\\PluginBase;" import',
      explanation: 'Without importing PluginBase, PHP might fail to resolve the base class if not referenced by fully-qualified namespace.',
      fixable: true,
      suggestedFix: 'Add "use pocketmine\\plugin\\PluginBase;" at the top of Main.php.',
    });
  }

  // 5. Check plugin.yml fields
  if (!ymlMeta.name) {
    issues.push({
      id: 'missing-yml-name',
      level: 'error',
      category: 'plugin.yml',
      message: 'Missing "name:" field in plugin.yml',
      explanation: 'PocketMine-MP requires a unique plugin name to identify and load the plugin.',
      fixable: true,
      suggestedFix: `Set name: ${phpInfo.namespace || 'MyPlugin'} in plugin.yml.`,
    });
  }

  if (!ymlMeta.version) {
    issues.push({
      id: 'missing-yml-version',
      level: 'warning',
      category: 'plugin.yml',
      message: 'Missing "version:" in plugin.yml',
      explanation: 'A semantic version string (like 1.0.0) is strongly recommended.',
      fixable: true,
      suggestedFix: 'Set version: 1.0.0 in plugin.yml.',
    });
  }

  if (!ymlMeta.api) {
    issues.push({
      id: 'missing-yml-api',
      level: 'error',
      category: 'plugin.yml',
      message: 'Missing "api:" version in plugin.yml',
      explanation: 'PocketMine requires the compatible API version (e.g. 4.0.0, 5.0.0).',
      fixable: true,
      suggestedFix: 'Set api: 4.0.0 in plugin.yml.',
    });
  }

  // 6. Check Namespace / Main Class Synchronization (THE BIGGEST MISTAKE IN MINECRAFT PLUGINS)
  const expectedMain = phpInfo.fullQualifiedName.replace(/^\\+/, '');
  const ymlMain = (ymlMeta.main || '').replace(/^\\+/, '');

  if (!ymlMeta.main) {
    issues.push({
      id: 'missing-yml-main',
      level: 'error',
      category: 'plugin.yml',
      message: 'Missing "main:" entry point in plugin.yml',
      explanation: `PocketMine cannot find your entry class. It should point to: "${expectedMain}".`,
      fixable: true,
      suggestedFix: `Set main: ${expectedMain} in plugin.yml.`,
    });
  } else if (ymlMain.toLowerCase() !== expectedMain.toLowerCase()) {
    issues.push({
      id: 'mismatched-main-entry',
      level: 'error',
      category: 'Namespace',
      message: `Mismatched Entry Point: plugin.yml has "${ymlMeta.main}" but Main.php is "${expectedMain}"`,
      explanation: `PocketMine loader will crash with "ClassNotFoundException" because the declared main class does not match the actual PHP class namespace.`,
      fixable: true,
      suggestedFix: `Update plugin.yml "main: ${expectedMain}" to match Main.php.`,
    });
  }

  // 7. Check YAML indentation (Tabs vs spaces)
  if (/\t/.test(ymlContent)) {
    issues.push({
      id: 'yaml-tab-character',
      level: 'warning',
      category: 'plugin.yml',
      message: 'plugin.yml contains Tab characters',
      explanation: 'YAML standard forbids tab characters for indentation. Use 2 spaces instead.',
      fixable: true,
      suggestedFix: 'Replace all tabs with 2 spaces in plugin.yml.',
    });
  }

  // 8. API version compatibility checks (e.g., PM4/PM5 require : void on onEnable/onDisable)
  const isModernPm = ymlMeta.api && (ymlMeta.api.startsWith('4') || ymlMeta.api.startsWith('5'));
  if (isModernPm && !phpInfo.onEnableReturnTyped && /function\s+onEnable/i.test(phpContent)) {
    issues.push({
      id: 'pm-return-type',
      level: 'info',
      category: 'API Compatibility',
      message: `PocketMine API ${ymlMeta.api} recommends ": void" return types on lifecycle methods`,
      explanation: 'PocketMine-MP API 4.x and 5.x use strict PHP 8.x typing: `protected function onEnable(): void`.',
      fixable: true,
      suggestedFix: 'Add ": void" to onEnable and onDisable functions.',
    });
  }

  // Generate Suggested Fixed PHP and YAML
  let fixedPhp = phpContent.trim();
  if (!phpInfo.hasPhpTag) {
    fixedPhp = '<?php\n\ndeclare(strict_types=1);\n\n' + fixedPhp;
  }

  const desiredNamespace = phpInfo.namespace || ymlMeta.name || 'OpSword';
  const desiredClassName = phpInfo.className || 'Main';

  if (!phpInfo.namespace) {
    if (/<\?php/i.test(fixedPhp)) {
      fixedPhp = fixedPhp.replace(/(<\?php(?:\s*declare\(strict_types=1\);)?)/i, `$1\n\nnamespace ${desiredNamespace};\n`);
    } else {
      fixedPhp = `<?php\n\ndeclare(strict_types=1);\n\nnamespace ${desiredNamespace};\n\n` + fixedPhp;
    }
  }

  if (!/use\s+pocketmine\\plugin\\PluginBase\s*;/i.test(fixedPhp)) {
    fixedPhp = fixedPhp.replace(/(namespace\s+[a-zA-Z0-9_\\]+\s*;)/i, `$1\n\nuse pocketmine\\plugin\\PluginBase;\nuse pocketmine\\event\\Listener;`);
  }

  if (!/class\s+[a-zA-Z0-9_]+\s+extends\s+PluginBase/i.test(fixedPhp)) {
    fixedPhp = fixedPhp.replace(/class\s+([a-zA-Z0-9_]+)(?:\s+extends\s+[a-zA-Z0-9_\\]+)?/i, `class $1 extends PluginBase`);
  }

  // Ensure plugin.yml is aligned
  const targetMainFull = `${desiredNamespace}\\${desiredClassName}`;
  const fixedMeta: PluginMeta = {
    name: ymlMeta.name || desiredNamespace,
    version: ymlMeta.version || '1.0.0',
    api: ymlMeta.api || '4.0.0',
    main: targetMainFull,
    author: ymlMeta.author || 'TgTechnoLogy',
    description: ymlMeta.description || `PocketMine-MP plugin for ${ymlMeta.name || desiredNamespace}`,
    website: ymlMeta.website,
    prefix: ymlMeta.prefix,
    load: ymlMeta.load,
    commands: ymlMeta.commands,
    permissions: ymlMeta.permissions,
  };

  const suggestedYml = generatePluginYml(fixedMeta);
  const suggestedPsr4Path = calculatePsr4Path(desiredNamespace, desiredClassName);

  return {
    issues,
    suggestedYml,
    suggestedPhp: fixedPhp,
    suggestedPsr4Path,
  };
}
