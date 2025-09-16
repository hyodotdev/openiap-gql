import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const targetPath = resolve(__dirname, '../src/generated/types.ts');
const schemaFiles = [
  resolve(__dirname, '../src/api.graphql'),
  resolve(__dirname, '../src/api-ios.graphql'),
  resolve(__dirname, '../src/api-android.graphql'),
];

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

writeFileSync(targetPath, content);
