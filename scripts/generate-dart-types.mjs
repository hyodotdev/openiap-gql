import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  GraphQLList,
  GraphQLNonNull,
  buildASTSchema,
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

const dartKeywords = new Set([
  'abstract', 'as', 'assert', 'async', 'await', 'break', 'case', 'catch', 'class', 'const',
  'continue', 'covariant', 'default', 'deferred', 'do', 'dynamic', 'else', 'enum', 'export',
  'extends', 'extension', 'external', 'factory', 'false', 'final', 'finally', 'for', 'Function',
  'get', 'hide', 'if', 'implements', 'import', 'in', 'interface', 'is', 'late', 'library', 'mixin',
  'new', 'null', 'on', 'operator', 'part', 'required', 'rethrow', 'return', 'set', 'show', 'static',
  'super', 'switch', 'sync', 'this', 'throw', 'true', 'try', 'typedef', 'var', 'void', 'while', 'with',
  'yield',
]);

const dartKeywordOverrides = new Map([
  ['deferred', 'deferred'],
]);

const escapeDartName = (name) => {
  if (dartKeywordOverrides.has(name)) {
    return dartKeywordOverrides.get(name);
  }
  return dartKeywords.has(name) ? `_${name}` : name;
};

const toCamelCase = (value, upper = false) => {
  const tokens = value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_\-\s]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((token) => token.toLowerCase());
  if (tokens.length === 0) return value;
  const [first, ...rest] = tokens;
  const firstToken = upper ? first.charAt(0).toUpperCase() + first.slice(1) : first;
  return [firstToken, ...rest.map((token) => token.charAt(0).toUpperCase() + token.slice(1))].join('');
};

const toPascalCase = (value) => toCamelCase(value, true);

const toConstantCase = (value) => value
  .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
  .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
  .replace(/[-\s]+/g, '_')
  .toUpperCase();

const scalarMap = new Map([
  ['ID', 'String'],
  ['String', 'String'],
  ['Boolean', 'bool'],
  ['Int', 'int'],
  ['Float', 'double'],
]);

const getDartType = (graphqlType) => {
  if (graphqlType instanceof GraphQLNonNull) {
    const inner = getDartType(graphqlType.ofType);
    return { type: inner.type, nullable: false };
  }
  if (graphqlType instanceof GraphQLList) {
    const inner = getDartType(graphqlType.ofType);
    const element = inner.type + (inner.nullable ? '?' : '');
    return { type: `List<${element}>`, nullable: true };
  }
  const mapped = scalarMap.get(graphqlType.name) ?? graphqlType.name;
  return { type: mapped, nullable: true };
};

const addDocComment = (lines, description, indent = '') => {
  if (!description) return;
  for (const docLine of description.split(/\r?\n/)) {
    lines.push(`${indent}/// ${docLine}`);
  }
};

const unionMembership = new Map();
const enums = [];
const interfaces = [];
const objects = [];
const inputs = [];
const unions = [];
const operationTypes = [];

for (const name of typeNames) {
  const type = typeMap[name];
  if (isScalarType(type)) {
    if (scalarMap.has(type.name)) continue;
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
    for (const member of type.getTypes()) {
      if (!unionMembership.has(member.name)) {
        unionMembership.set(member.name, new Set());
      }
      unionMembership.get(member.name).add(type.name);
    }
    continue;
  }
  if (isObjectType(type)) {
    if (['Query', 'Mutation', 'Subscription'].includes(name)) {
      operationTypes.push(type);
      continue;
    }
    objects.push(type);
    continue;
  }
  if (isInputObjectType(type)) {
    inputs.push(type);
  }
}

const lines = [];
lines.push(
  '// ============================================================================',
  '// AUTO-GENERATED TYPES — DO NOT EDIT DIRECTLY',
  "// Run `npm run generate` after updating any *.graphql schema file.",
  '// ============================================================================',
  '',
  '// ignore_for_file: unused_element, unused_field',
  '',
  "import 'dart:async';",
  '',
);

const printEnum = (enumType) => {
  addDocComment(lines, enumType.description);
  lines.push(`enum ${enumType.name} {`);
  const values = enumType.getValues();
  values.forEach((value, index) => {
    addDocComment(lines, value.description, '  ');
    const name = escapeDartName(toCamelCase(value.name));
    const rawValue = toConstantCase(value.name);
    const suffix = index === values.length - 1 ? ';' : ',';
    lines.push(`  ${name}('${rawValue}')${suffix}`);
  });
  lines.push('', `  const ${enumType.name}(this.value);`, '  final String value;', '}', '');
};

const printInterface = (interfaceType) => {
  addDocComment(lines, interfaceType.description);
  lines.push(`abstract class ${interfaceType.name} {`);
  const fields = Object.values(interfaceType.getFields()).sort((a, b) => a.name.localeCompare(b.name));
  for (const field of fields) {
    addDocComment(lines, field.description, '  ');
    const { type, nullable } = getDartType(field.type);
    const fieldType = `${type}${nullable ? '?' : ''}`;
    const fieldName = escapeDartName(field.name);
    lines.push(`  ${fieldType} get ${fieldName};`);
  }
  lines.push('}', '');
};

const printObject = (objectType) => {
  addDocComment(lines, objectType.description);
  const interfacesForObject = objectType.getInterfaces().map((iface) => iface.name);
  const unionInterfaces = unionMembership.has(objectType.name)
    ? Array.from(unionMembership.get(objectType.name)).sort()
    : [];
  const implementsList = [...interfacesForObject, ...unionInterfaces];
  const implementsClause = implementsList.length ? ` implements ${implementsList.join(', ')}` : '';
  lines.push(`class ${objectType.name}${implementsClause} {`);
  lines.push(`  const ${objectType.name}({`);
  const fields = Object.values(objectType.getFields()).sort((a, b) => a.name.localeCompare(b.name));
  fields.forEach((field, index) => {
    addDocComment(lines, field.description, '    ');
    const { type, nullable } = getDartType(field.type);
    const fieldType = `${type}${nullable ? '?' : ''}`;
    const fieldName = escapeDartName(field.name);
    const line = `    ${nullable ? '' : 'required '}this.${fieldName},`;
    lines.push(line);
  });
  lines.push('  });', '');
  fields.forEach((field) => {
    addDocComment(lines, field.description, '  ');
    const { type, nullable } = getDartType(field.type);
    const fieldType = `${type}${nullable ? '?' : ''}`;
    const fieldName = escapeDartName(field.name);
    lines.push(`  final ${fieldType} ${fieldName};`);
  });
  lines.push('}', '');
};

const printInput = (inputType) => {
  addDocComment(lines, inputType.description);
  lines.push(`class ${inputType.name} {`);
  lines.push(`  const ${inputType.name}({`);
  const fields = Object.values(inputType.getFields()).sort((a, b) => a.name.localeCompare(b.name));
  fields.forEach((field) => {
    addDocComment(lines, field.description, '    ');
    const { type, nullable } = getDartType(field.type);
    const fieldType = `${type}${nullable ? '?' : ''}`;
    const fieldName = escapeDartName(field.name);
    const line = `    ${nullable ? '' : 'required '}this.${fieldName},`;
    lines.push(line);
  });
  lines.push('  });', '');
  fields.forEach((field) => {
    addDocComment(lines, field.description, '  ');
    const { type, nullable } = getDartType(field.type);
    const fieldType = `${type}${nullable ? '?' : ''}`;
    const fieldName = escapeDartName(field.name);
    lines.push(`  final ${fieldType} ${fieldName};`);
  });
  lines.push('}', '');
};

const printUnion = (unionType) => {
  addDocComment(lines, unionType.description);
  lines.push(`abstract class ${unionType.name} {}`);
  lines.push('');
};

const printOperationInterface = (operationType) => {
  const interfaceName = `${operationType.name}Resolver`;
  addDocComment(lines, operationType.description ?? `GraphQL root ${operationType.name.toLowerCase()} operations.`);
  lines.push(`abstract class ${interfaceName} {`);
  const fields = Object.values(operationType.getFields())
    .filter((field) => field.name !== '_placeholder')
    .sort((a, b) => a.name.localeCompare(b.name));
  for (const field of fields) {
    addDocComment(lines, field.description, '  ');
    const { type, nullable } = getDartType(field.type);
    const returnType = `${type}${nullable ? '?' : ''}`;
    if (field.args.length === 0) {
      lines.push(`  Future<${returnType}> ${escapeDartName(field.name)}();`);
      continue;
    }
    lines.push('  Future<' + returnType + `> ${escapeDartName(field.name)}({`);
    field.args.forEach((arg, index) => {
      const { type: argType, nullable: argNullable } = getDartType(arg.type);
      const finalType = `${argType}${argNullable ? '?' : ''}`;
      const argName = escapeDartName(arg.name);
      const prefix = argNullable ? '' : 'required ';
      const suffix = index === field.args.length - 1 ? '' : '';
      lines.push(`    ${prefix}${finalType} ${argName},${suffix}`);
    });
    lines.push('  });');
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

if (operationTypes.length) {
  lines.push('// MARK: - Root Operations', '');
  operationTypes.sort((a, b) => a.name.localeCompare(b.name)).forEach(printOperationInterface);
}

const outputPath = resolve(__dirname, '../src/generated/types.dart');
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, lines.join('\n'));

// eslint-disable-next-line no-console
console.log('[generate-dart-types] wrote', outputPath);
