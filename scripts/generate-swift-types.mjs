import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildASTSchema,
  GraphQLList,
  GraphQLNonNull,
  isEnumType,
  isInputObjectType,
  isInterfaceType,
  isObjectType,
  isScalarType,
  isUnionType,
  parse,
} from 'graphql';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const schemaPaths = [
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

const documentNode = {
  kind: 'Document',
  definitions: schemaPaths.flatMap((schemaPath) => {
    const sdl = readFileSync(schemaPath, 'utf8');
    return parse(sdl).definitions;
  }),
};

const schema = buildASTSchema(documentNode, { assumeValidSDL: true });
const typeMap = schema.getTypeMap();
const typeNames = Object.keys(typeMap)
  .filter((name) => !name.startsWith('__'))
  .sort((a, b) => a.localeCompare(b));

const swiftKeywords = new Set([
  'associatedtype',
  'class',
  'deinit',
  'enum',
  'extension',
  'func',
  'import',
  'init',
  'inout',
  'internal',
  'let',
  'operator',
  'private',
  'protocol',
  'public',
  'static',
  'struct',
  'subscript',
  'typealias',
  'var',
  'break',
  'case',
  'continue',
  'default',
  'defer',
  'do',
  'else',
  'fallthrough',
  'for',
  'guard',
  'if',
  'in',
  'repeat',
  'return',
  'switch',
  'where',
  'while',
  'as',
  'catch',
  'false',
  'is',
  'nil',
  'rethrows',
  'super',
  'self',
  'Self',
  'throw',
  'throws',
  'true',
  'try',
  'Any',
  'Protocol',
]);

const escapeSwiftName = (name) => (swiftKeywords.has(name) ? `\`${name}\`` : name);

const lowerCamelCase = (value) => {
  const parts = value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_\-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((segment) => segment.toLowerCase());
  if (parts.length === 0) return value;
  return parts[0] + parts.slice(1).map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1)).join('');
};

const toConstantCase = (value) => value
  .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
  .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
  .replace(/[-\s]+/g, '_')
  .toUpperCase();

const scalarMap = new Map([
  ['ID', 'String'],
  ['String', 'String'],
  ['Boolean', 'Bool'],
  ['Int', 'Int'],
  ['Float', 'Double'],
]);

const swiftTypeFor = (graphqlType) => {
  if (graphqlType instanceof GraphQLNonNull) {
    const inner = swiftTypeFor(graphqlType.ofType);
    return { type: inner.type, optional: false };
  }
  if (graphqlType instanceof GraphQLList) {
    const inner = swiftTypeFor(graphqlType.ofType);
    const element = inner.type + (inner.optional ? '?' : '');
    return { type: `[${element}]`, optional: true };
  }
  const namedType = graphqlType.name;
  const mapped = scalarMap.get(namedType) ?? namedType;
  return { type: mapped, optional: true };
};

const addDocComment = (lines, description, indent = '') => {
  if (!description) return;
  for (const docLine of description.split(/\r?\n/)) {
    lines.push(`${indent}/// ${docLine}`);
  }
};

const lines = [];
lines.push(
  '// ============================================================================',
  '// AUTO-GENERATED TYPES — DO NOT EDIT DIRECTLY',
  "// Run `npm run generate` after updating any *.graphql schema file.",
  '// ============================================================================',
  '',
  'import Foundation',
  ''
);

const enums = [];
const interfaces = [];
const objects = [];
const inputs = [];
const unions = [];
const operations = [];

for (const name of typeNames) {
  const type = typeMap[name];
  if (isScalarType(type)) {
    if (scalarMap.has(type.name)) continue;
    // Custom scalars can be represented as typealias to String by default
    const swiftType = scalarMap.get(type.name) ?? 'String';
    lines.push(`// TODO: Map custom scalar ${type.name} to an appropriate Swift type (defaulting to ${swiftType}).`);
    continue;
  }
  if (isEnumType(type)) {
    enums.push(type);
    continue;
  }
  if (isInterfaceType(type)) {
    interfaces.push(type);
    continue;
  }
  if (isUnionType(type)) {
    unions.push(type);
    continue;
  }
  if (isObjectType(type)) {
    if (name === 'Query' || name === 'Mutation' || name === 'Subscription') {
      operations.push(type);
      continue;
    }
    objects.push(type);
    continue;
  }
  if (isInputObjectType(type)) {
    inputs.push(type);
  }
}

const printEnum = (enumType) => {
  addDocComment(lines, enumType.description);
  lines.push(`public enum ${enumType.name}: String, Codable, CaseIterable {`);
  const values = enumType.getValues();
  values.forEach((value, index) => {
    addDocComment(lines, value.description, '    ');
    const caseName = escapeSwiftName(lowerCamelCase(value.name));
    const rawValue = toConstantCase(value.name);
    lines.push(`    case ${caseName} = "${rawValue}"`);
    if (index === values.length - 1) return;
  });
  lines.push('}', '');
};

const printInterface = (interfaceType) => {
  addDocComment(lines, interfaceType.description);
  lines.push(`public protocol ${interfaceType.name}: Codable {`);
  const fields = Object.values(interfaceType.getFields()).sort((a, b) => a.name.localeCompare(b.name));
  for (const field of fields) {
    addDocComment(lines, field.description, '    ');
    const { type, optional } = swiftTypeFor(field.type);
    const propertyType = type + (optional ? '?' : '');
    const propertyName = escapeSwiftName(field.name);
    lines.push(`    var ${propertyName}: ${propertyType} { get }`);
  }
  lines.push('}', '');
};

const printObject = (objectType) => {
  addDocComment(lines, objectType.description);
  const interfacesForObject = objectType.getInterfaces();
  const conformances = ['Codable', ...interfacesForObject.map((iface) => iface.name)];
  lines.push(`public struct ${objectType.name}: ${conformances.join(', ')} {`);
  const fields = Object.values(objectType.getFields()).sort((a, b) => a.name.localeCompare(b.name));
  if (fields.length === 0) {
    lines.push('    public init() {}');
  } else {
    for (const field of fields) {
      addDocComment(lines, field.description, '    ');
      const { type, optional } = swiftTypeFor(field.type);
      const propertyType = type + (optional ? '?' : '');
      const propertyName = escapeSwiftName(field.name);
      lines.push(`    public var ${propertyName}: ${propertyType}`);
    }
  }
  lines.push('}', '');
};

const printInput = (inputType) => {
  addDocComment(lines, inputType.description);
  lines.push(`public struct ${inputType.name}: Codable {`);
  const fields = Object.values(inputType.getFields()).sort((a, b) => a.name.localeCompare(b.name));
  if (fields.length === 0) {
    lines.push('    public init() {}');
  } else {
    for (const field of fields) {
      addDocComment(lines, field.description, '    ');
      const { type, optional } = swiftTypeFor(field.type);
      const propertyType = type + (optional ? '?' : '');
      const propertyName = escapeSwiftName(field.name);
      lines.push(`    public var ${propertyName}: ${propertyType}`);
    }
  }
  lines.push('}', '');
};

const printUnion = (unionType) => {
  addDocComment(lines, unionType.description);
  lines.push(`public enum ${unionType.name} {`);
  const types = unionType.getTypes();
  for (const member of types) {
    const caseName = escapeSwiftName(lowerCamelCase(member.name));
    lines.push(`    case ${caseName}(${member.name})`);
  }
  lines.push('}', '');
};

const printOperationProtocol = (operationType) => {
  const protocolName = `${operationType.name}Resolver`;
  addDocComment(lines, operationType.description ?? `GraphQL root ${operationType.name.toLowerCase()} operations.`);
  lines.push(`public protocol ${protocolName} {`);
  const fields = Object.values(operationType.getFields())
    .filter((field) => field.name !== '_placeholder')
    .sort((a, b) => a.name.localeCompare(b.name));
  if (fields.length === 0) {
    lines.push('    // No operations defined.');
  }
  for (const field of fields) {
    addDocComment(lines, field.description, '    ');
    const { type, optional } = swiftTypeFor(field.type);
    const returnType = type + (optional ? '?' : '');
    const args = field.args.map((arg) => {
      const { type: argType, optional: argOptional } = swiftTypeFor(arg.type);
      const argName = escapeSwiftName(arg.name);
      const finalType = argType + (argOptional ? '?' : '');
      const defaultValue = argOptional ? ' = nil' : '';
      return `${argName}: ${finalType}${defaultValue}`;
    });
    const params = args.length > 0 ? args.join(', ') : '';
    const paramSegment = params ? `(${params})` : '()';
    lines.push(`    func ${escapeSwiftName(field.name)}${paramSegment} async throws -> ${returnType}`);
  }
  lines.push('}', '');
};

if (enums.length) {
  lines.push('// MARK: - Enums', '');
  enums.sort((a, b) => a.name.localeCompare(b.name)).forEach(printEnum);
}

if (interfaces.length) {
  lines.push('// MARK: - Interfaces', '');
  interfaces.sort((a, b) => a.name.localeCompare(b.name)).forEach(printInterface);
}

if (objects.length) {
  lines.push('// MARK: - Objects', '');
  objects.sort((a, b) => a.name.localeCompare(b.name)).forEach(printObject);
}

if (inputs.length) {
  lines.push('// MARK: - Input Objects', '');
  inputs.sort((a, b) => a.name.localeCompare(b.name)).forEach(printInput);
}

if (unions.length) {
  lines.push('// MARK: - Unions', '');
  unions.sort((a, b) => a.name.localeCompare(b.name)).forEach(printUnion);
}

if (operations.length) {
  lines.push('// MARK: - Root Operations', '');
  operations.sort((a, b) => a.name.localeCompare(b.name)).forEach(printOperationProtocol);
}

const outputPath = resolve(__dirname, '../src/generated/Types.swift');
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, lines.join('\n'));

// eslint-disable-next-line no-console
console.log('[generate-swift-types] wrote', outputPath);
