import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { parse } from 'graphql';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const targetPath = resolve(__dirname, '../src/generated/types.ts');
const schemaFiles = [
  resolve(__dirname, '../src/api.graphql'),
  resolve(__dirname, '../src/api-ios.graphql'),
  resolve(__dirname, '../src/api-android.graphql'),
];
const schemaDefinitionFiles = [
  '../src/schema.graphql',
  '../src/type.graphql',
  '../src/type-ios.graphql',
  '../src/type-android.graphql',
  '../src/api.graphql',
  '../src/api-ios.graphql',
  '../src/api-android.graphql',
  '../src/error.graphql',
  '../src/event.graphql',
].map((relativePath) => resolve(__dirname, relativePath));

let content = readFileSync(targetPath, 'utf8');

// eslint-disable-next-line no-console
console.log('[fix-generated-types] transforming output');

const scalarReplacements = new Map([
  ["Scalars['ID']['output']", 'string'],
  ["Scalars['ID']['input']", 'string'],
  ["Scalars['String']['output']", 'string'],
  ["Scalars['String']['input']", 'string'],
  ["Scalars['Boolean']['output']", 'boolean'],
  ["Scalars['Boolean']['input']", 'boolean'],
  ["Scalars['Int']['output']", 'number'],
  ["Scalars['Int']['input']", 'number'],
  ["Scalars['Float']['output']", 'number'],
  ["Scalars['Float']['input']", 'number'],
]);

for (const [from, to] of scalarReplacements) {
  const pattern = new RegExp(from.replace(/[[\]]/g, (m) => `\\${m}`), 'g');
  content = content.replace(pattern, to);
}

const iosTypeMap = new Map();
for (const schemaPath of schemaDefinitionFiles) {
  const sdl = readFileSync(schemaPath, 'utf8');
  const document = parse(sdl, { noLocation: true });
  for (const definition of document.definitions) {
    if (!definition.name) continue;
    const name = definition.name.value;
    if (!name.includes('IOS')) continue;
    const tsName = name.replace(/IOS/g, 'Ios');
    iosTypeMap.set(tsName, name);
  }
}

for (const [tsName, iosName] of iosTypeMap) {
  const pattern = new RegExp(`\\b${tsName}\\b`, 'g');
  content = content.replace(pattern, iosName);
}

// Enforce IOS capitalization conventions for enum members and fields.
content = content.replace(/\b([A-Za-z0-9]+)Ios\b/g, (_, prefix) => `${prefix}IOS`);
content = content.replace(/\bIos\b/g, 'IOS');

const toKebabCase = (value) => value
  .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
  .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
  .replace(/[_\s]+/g, '-')
  .replace(/-+/g, '-')
  .toLowerCase();

// Convert enums (except ErrorCode) to union literal types with lower-snake-case values.
content = content.replace(/export enum (\w+) \{[\s\S]*?\}\n?/g, (match) => {
  const enumName = match.match(/export enum (\w+)/)[1];
  if (enumName === 'ErrorCode') return match;
  const valueMatches = [...match.matchAll(/=\s*'([^']+)'/g)];
  if (valueMatches.length === 0) return match;
  const literals = valueMatches.map(([, raw]) => `'${toKebabCase(raw)}'`);
  return `export type ${enumName} = ${literals.join(' | ')};\n`;
});

const removeDefinition = (keyword) => {
  const pattern = new RegExp(`^export type ${keyword}[^]*?;\n`, 'm');
  if (pattern.test(content)) {
    content = content.replace(pattern, '');
  }
};

const removeScalarsBlock = () => {
  const pattern = /\/\*\* All built-in and custom scalars[^]*?}\n\n/;
  content = content.replace(pattern, '');
};

removeScalarsBlock();
removeDefinition('Maybe');
removeDefinition('InputMaybe');
removeDefinition('Exact');
removeDefinition('MakeOptional');
removeDefinition('MakeMaybe');
removeDefinition('MakeEmpty');
removeDefinition('Incremental');

const replaceMaybeLike = (keyword) => {
  const token = `${keyword}<`;
  let index = content.indexOf(token);
  while (index !== -1) {
    const definitionPrefix = `export type ${keyword}`;
    const prefixStart = index - definitionPrefix.length;
    if (prefixStart >= 0 && content.slice(prefixStart, index) === definitionPrefix) {
      index = content.indexOf(token, index + token.length);
      continue;
    }
    let i = index + token.length;
    let depth = 1;
    while (i < content.length && depth > 0) {
      const ch = content[i];
      if (ch === '<') depth += 1;
      else if (ch === '>') depth -= 1;
      i += 1;
    }
    if (depth !== 0) break;
    const inner = content.slice(index + token.length, i - 1).trim();
    const replacement = `(${inner} | null)`;
    content = content.slice(0, index) + replacement + content.slice(i);
    index = content.indexOf(token, index + replacement.length);
  }
};

replaceMaybeLike('InputMaybe');
replaceMaybeLike('Maybe');

const convertArrays = () => {
  const token = 'Array<';
  let index = content.indexOf(token);
  while (index !== -1) {
    let i = index + token.length;
    let depth = 1;
    while (i < content.length && depth > 0) {
      const ch = content[i];
      if (ch === '<') depth += 1;
      else if (ch === '>') depth -= 1;
      i += 1;
    }
    if (depth !== 0) break;
    const innerRaw = content.slice(index + token.length, i - 1).trim();
    const needsParens = /[|&]/.test(innerRaw) && !(innerRaw.startsWith('(') && innerRaw.endsWith(')'));
    const inner = needsParens ? `(${innerRaw})` : innerRaw;
    content = content.slice(0, index) + inner + '[]' + content.slice(i);
    index = content.indexOf(token, index + inner.length + 2);
  }
};

convertArrays();

const toConstantCase = (value) => value
  .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
  .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
  .replace(/-/g, '_')
  .toUpperCase();

content = content.replace(/export enum [^{]+\{[\s\S]*?\}/g, (block) =>
  block.replace(/= '([^']+)'/g, (_, value) => `= '${toConstantCase(value)}'`)
);

content = content.replace(
  /export interface RequestPurchaseProps \{[\s\S]*?\}\n\n/,
  [
    'export type RequestPurchaseProps =',
    '  | {',
    '      /** Per-platform purchase request props */',
    '      request: RequestPurchasePropsByPlatforms;',
    "      type: 'in-app';",
    '    }',
    '  | {',
    '      /** Per-platform subscription request props */',
    '      request: RequestSubscriptionPropsByPlatforms;',
    "      type: 'subs';",
    '    };\n\n',
  ].join('\n'),
);

content = content.replace(
  /export interface MutationRequestPurchaseArgs \{[\s\S]*?\}\n\n/,
  [
    'export type MutationRequestPurchaseArgs =',
    '  | {',
    '      /** Per-platform purchase request props */',
    '      request: RequestPurchasePropsByPlatforms;',
    "      type: 'in-app';",
    '    }',
    '  | {',
    '      /** Per-platform subscription request props */',
    '      request: RequestSubscriptionPropsByPlatforms;',
    "      type: 'subs';",
    '    };\n\n',
  ].join('\n'),
);

const needsParentheses = (value) => {
  const trimmed = value.trim();
  if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
    let depth = 0;
    for (let i = 0; i < trimmed.length; i += 1) {
      const ch = trimmed[i];
      if (ch === '(') depth += 1;
      else if (ch === ')') depth -= 1;
      if (depth === 0 && i < trimmed.length - 1) {
        return true;
      }
    }
    return false;
  }
  return /[|&]/.test(trimmed);
};

const singleFieldInterfaceTypes = new Map();
const interfacePattern = /export interface (\w+) \{\n([\s\S]*?)\n\}\n/g;
let interfaceMatch;
while ((interfaceMatch = interfacePattern.exec(content)) !== null) {
  const [, name, body] = interfaceMatch;
  if (['Query', 'Mutation', 'Subscription'].includes(name)) {
    continue;
  }
  const rawLines = body.split(/\r?\n/);
  const fieldLines = rawLines
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('/**') && !line.startsWith('*'));
  const propertyLines = fieldLines.filter((line) => /^[A-Za-z0-9_]+\??:/.test(line));
  if (propertyLines.length !== 1) {
    continue;
  }
  const propertyMatch = propertyLines[0].match(/^([A-Za-z0-9_]+)(\??): ([^;]+);$/);
  if (!propertyMatch) {
    continue;
  }
  const optionalMarker = propertyMatch[2];
  const rawType = propertyMatch[3].trim();
  const grouped = needsParentheses(rawType) ? `(${rawType})` : rawType;
  const finalType = optionalMarker === '?'
    ? `${grouped} | undefined`
    : rawType;
  singleFieldInterfaceTypes.set(name, finalType);
}

const rootNames = ['Query', 'Mutation', 'Subscription'];
for (const root of rootNames) {
  const pattern = new RegExp(`export interface ${root} \\{\\n([\\s\\S]*?)\\n\\}(\\n*)`);
  content = content.replace(pattern, (match, body, trailingNewlines) => {
    const lines = body.split(/\r?\n/);
    const transformed = lines.map((line) => {
      const fieldMatch = line.match(/^(\s*)([A-Za-z0-9_]+)(\??):\s*([^;]+);$/);
      if (!fieldMatch) {
        return line;
      }
      const [, indent, fieldName, optionalMarker, typeSegmentRaw] = fieldMatch;
      let typeSegment = typeSegmentRaw;
      if (!typeSegment.includes('Promise<')) {
        return line;
      }
      let updated = false;
      for (const [interfaceName, replacementType] of singleFieldInterfaceTypes) {
        const namePattern = new RegExp(`\\b${interfaceName}\\b`);
        if (!namePattern.test(typeSegment)) {
          continue;
        }
        const replacePattern = new RegExp(`\\b${interfaceName}\\b`, 'g');
        typeSegment = typeSegment.replace(replacePattern, replacementType);
        updated = true;
      }
      if (!updated) {
        return line;
      }
      return `${indent}${fieldName}${optionalMarker}: ${typeSegment};`;
    }).join('\n');
    return `export interface ${root} {\n${transformed}\n}\n${trailingNewlines}`;
  });
}

content = content.replace(
  /export interface (\w+Args) \{\n([\s\S]*?)\n\}\n\n/g,
  (match, name, body) => {
    const trimmed = body.trim();
    if (!trimmed) return match;

    let comment = '';
    let remainder = trimmed;
    const docMatch = remainder.match(/^\/\*\*[\s\S]*?\*\/\s*/);
    if (docMatch) {
      comment = docMatch[0];
      remainder = remainder.slice(docMatch[0].length).trim();
    }

    const lines = remainder.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length !== 1) return match;

    const propertyMatch = lines[0].trim().match(/^([A-Za-z0-9_]+)(\??): ([^;]+);$/);
    if (!propertyMatch) return match;

    const [, , optionalMarker, rawType] = propertyMatch;
    const baseType = rawType.trim();
    const groupedType = needsParentheses(baseType) ? `(${baseType})` : baseType;
    const aliasType = optionalMarker === '?' ? `${groupedType} | undefined` : groupedType;
    const prefix = comment ? `${comment}` : '';
    return `${prefix}export type ${name} = ${aliasType};\n\n`;
  },
);

const futureFields = new Set();
for (const file of schemaFiles) {
  let previousWasMarker = false;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#') && trimmed.toLowerCase().includes('future')) {
      previousWasMarker = true;
      continue;
    }
    if (previousWasMarker) {
      const match = trimmed.match(/^([A-Za-z0-9_]+)\s*\(/) || trimmed.match(/^([A-Za-z0-9_]+)\s*:/);
      if (match) {
        futureFields.add(match[1]);
      }
      previousWasMarker = false;
    }
  }
}

const wrapReturns = (interfaceName) => {
  const pattern = new RegExp(`export interface ${interfaceName} \\\{\\n([\\s\\S]*?)\\n\\}`, 'g');
  content = content.replace(pattern, (match, body) => {
    const transformed = body.replace(/(\s*)([A-Za-z0-9_]+)(\??: )(?!Promise<)([^;]+);/g, (line, indent, name, sep, type) => {
      if (!futureFields.has(name)) {
        return line;
      }
      return `${indent}${name}${sep}Promise<${type}>;`;
    });
    return `export interface ${interfaceName} {\n${transformed}\n}`;
  });
};

wrapReturns('Query');
wrapReturns('Mutation');

content = content.replace(/^\s*_placeholder\??: [^;]+;\n/gm, '');

const ROOT_DEFINITIONS = ['Query', 'Mutation', 'Subscription'];

const helperMarkers = (root) => ({
  start: `// -- ${root} helper types (auto-generated)`,
  end: `// -- End ${root.toLowerCase()} helper types`,
});

const removeRootHelpers = (root) => {
  const { start, end } = helperMarkers(root);
  const startIdx = content.indexOf(start);
  if (startIdx === -1) return;
  const endIdx = content.indexOf(end);
  if (endIdx === -1) return;
  const sliceEnd = content.indexOf('\n', endIdx + end.length);
  const finalEnd = sliceEnd === -1 ? content.length : sliceEnd + 1;
  content = content.slice(0, startIdx) + content.slice(finalEnd);
};

const findArgsType = (root, pascalFieldName) => {
  const prefixes = new Set([
    `${root}${pascalFieldName}Args`,
    `${root}${pascalFieldName.replace(/IOS/g, 'Ios')}Args`,
    `${root}${pascalFieldName.replace(/Ios/g, 'IOS')}Args`,
  ]);
  for (const name of prefixes) {
    if (
      content.includes(`export interface ${name} {`) ||
      content.includes(`export type ${name} =`)
    ) {
      return name;
    }
  }
  return 'never';
};

const buildRootHelpers = (root) => {
  const rootMatch = content.match(new RegExp(`export interface ${root} {\n([\\s\\S]*?)\n}\n`));
  if (!rootMatch) return '';
  const body = rootMatch[1];
  const fieldPattern = /^\s*([A-Za-z0-9_]+)\??:\s*[^;]+;$/gm;
  const entries = [];
  let fieldMatch;
  while ((fieldMatch = fieldPattern.exec(body)) !== null) {
    const fieldName = fieldMatch[1];
    const pascal = fieldName[0].toUpperCase() + fieldName.slice(1);
    const argsType = findArgsType(root, pascal);
    entries.push({ fieldName, argsType });
  }
  if (entries.length === 0) return '';
  const { start, end } = helperMarkers(root);
  const mapName = `${root}ArgsMap`;
  const fieldAlias = `${root}Field`;
  const mapAlias = `${root}FieldMap`;
  const lines = [];
  lines.push(start);
  lines.push(`export type ${mapName} = {`);
  for (const { fieldName, argsType } of entries) {
    lines.push(`  ${fieldName}: ${argsType};`);
  }
  lines.push('};');
  lines.push('');
  lines.push(`export type ${fieldAlias}<K extends keyof ${root}> =`);
  lines.push(`  ${mapName}[K] extends never`);
  lines.push(`    ? () => NonNullable<${root}[K]>`);
  lines.push(`    : undefined extends ${mapName}[K]`);
  lines.push(`      ? (args?: ${mapName}[K]) => NonNullable<${root}[K]>`);
  lines.push(`      : (args: ${mapName}[K]) => NonNullable<${root}[K]>;`);
  lines.push('');
  lines.push(`export type ${mapAlias} = {`);
  lines.push(`  [K in keyof ${root}]?: ${fieldAlias}<K>;`);
  lines.push('};');
  lines.push(end);
  lines.push('');
  return lines.join('\n');
};

const helperBlocks = [];
for (const root of ROOT_DEFINITIONS) {
  removeRootHelpers(root);
  const block = buildRootHelpers(root);
  if (block) helperBlocks.push(block);
}

if (helperBlocks.length > 0) {
  if (!content.endsWith('\n')) {
    content += '\n';
  }
  content += helperBlocks.join('\n');
}

writeFileSync(targetPath, content);
