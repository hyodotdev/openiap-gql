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

const kotlinKeywords = new Set([
  'as',
  'break',
  'class',
  'continue',
  'do',
  'else',
  'false',
  'for',
  'fun',
  'if',
  'in',
  'interface',
  'is',
  'null',
  'object',
  'package',
  'return',
  'super',
  'this',
  'throw',
  'true',
  'try',
  'typealias',
  'val',
  'var',
  'when',
  'while',
]);

const escapeKotlinName = (name) => (kotlinKeywords.has(name) ? `\`${name}\`` : name);

const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);

const pascalCase = (value) => {
  const tokens = value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_\-\s]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((token) => token.toLowerCase());
  if (tokens.length === 0) return value;
  return tokens.map(capitalize).join('');
};

const toConstantCase = (value) => value
  .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
  .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
  .replace(/[-\s]+/g, '_')
  .toUpperCase();

const scalarMap = new Map([
  ['ID', 'String'],
  ['String', 'String'],
  ['Boolean', 'Boolean'],
  ['Int', 'Int'],
  ['Float', 'Double'],
]);

const getKotlinType = (graphqlType) => {
  if (graphqlType instanceof GraphQLNonNull) {
    const inner = getKotlinType(graphqlType.ofType);
    return { type: inner.type, nullable: false };
  }
  if (graphqlType instanceof GraphQLList) {
    const inner = getKotlinType(graphqlType.ofType);
    const innerType = inner.type + (inner.nullable ? '?' : '');
    return { type: `List<${innerType}>`, nullable: true };
  }
  const mapped = scalarMap.get(graphqlType.name) ?? graphqlType.name;
  return { type: mapped, nullable: true };
};

const addDocComment = (lines, description, indent = '') => {
  if (!description) return;
  lines.push(`${indent}/**`);
  for (const docLine of description.split(/\r?\n/)) {
    lines.push(`${indent} * ${docLine}`);
  }
  lines.push(`${indent} */`);
};

const unionMembership = new Map();
const unions = [];
const enums = [];
const interfaces = [];
const objects = [];
const inputs = [];
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
  '@file:Suppress("unused")',
  ''
);

const printEnum = (enumType) => {
  addDocComment(lines, enumType.description);
  lines.push(`public enum class ${enumType.name}(val rawValue: String) {`);
  const values = enumType.getValues();
  values.forEach((value, index) => {
    addDocComment(lines, value.description, '    ');
    const caseName = escapeKotlinName(pascalCase(value.name));
    const rawValue = toConstantCase(value.name);
    const suffix = index === values.length - 1 ? '' : ',';
    lines.push(`    ${caseName}("${rawValue}")${suffix}`);
  });
  lines.push('}', '');
};

const printInterface = (interfaceType) => {
  addDocComment(lines, interfaceType.description);
  lines.push(`public interface ${interfaceType.name} {`);
  const fields = Object.values(interfaceType.getFields()).sort((a, b) => a.name.localeCompare(b.name));
  for (const field of fields) {
    addDocComment(lines, field.description, '    ');
    const { type, nullable } = getKotlinType(field.type);
    const propertyType = type + (nullable ? '?' : '');
    const propertyName = escapeKotlinName(field.name);
    lines.push(`    val ${propertyName}: ${propertyType}`);
  }
  lines.push('}', '');
};

const printDataClass = (objectType) => {
  addDocComment(lines, objectType.description);
  const interfacesForObject = objectType.getInterfaces().map((iface) => iface.name);
  const unionInterfaces = unionMembership.has(objectType.name)
    ? Array.from(unionMembership.get(objectType.name)).sort()
    : [];
  const conformances = ['public data class', `${objectType.name}(`];
  const fields = Object.values(objectType.getFields()).sort((a, b) => a.name.localeCompare(b.name));
  const propertyLines = [];
  fields.forEach((field, index) => {
    const { type, nullable } = getKotlinType(field.type);
    const propertyType = type + (nullable ? '?' : '');
    const propertyName = escapeKotlinName(field.name);
    const defaultValue = nullable ? ' = null' : '';
    addDocComment(propertyLines, field.description, '    ');
    const suffix = index === fields.length - 1 ? '' : ',';
    propertyLines.push(`    val ${propertyName}: ${propertyType}${defaultValue}${suffix}`);
  });
  if (fields.length === 0) {
    lines.push(`public class ${objectType.name}`);
    lines.push('');
    return;
  }
  lines.push(`${conformances[0]} ${conformances[1]}`);
  lines.push(...propertyLines);
  const implementsList = [...interfacesForObject, ...unionInterfaces];
  if (implementsList.length > 0) {
    lines.push(`) : ${implementsList.join(', ')}`);
  } else {
    lines.push(')');
  }
  lines.push('', '');
};

const printInput = (inputType) => {
  addDocComment(lines, inputType.description);
  const fields = Object.values(inputType.getFields()).sort((a, b) => a.name.localeCompare(b.name));
  lines.push(`public data class ${inputType.name}(`);
  fields.forEach((field, index) => {
    const { type, nullable } = getKotlinType(field.type);
    const propertyType = type + (nullable ? '?' : '');
    const propertyName = escapeKotlinName(field.name);
    const defaultValue = nullable ? ' = null' : '';
    addDocComment(lines, field.description, '    ');
    const suffix = index === fields.length - 1 ? '' : ',';
    lines.push(`    val ${propertyName}: ${propertyType}${defaultValue}${suffix}`);
  });
  lines.push(')', '');
};

const printUnion = (unionType) => {
  addDocComment(lines, unionType.description);
  lines.push(`public sealed interface ${unionType.name}`);
  lines.push('');
};

const printOperationInterface = (operationType) => {
  const interfaceName = `${operationType.name}Resolver`;
  addDocComment(lines, operationType.description ?? `GraphQL root ${operationType.name.toLowerCase()} operations.`);
  lines.push(`public interface ${interfaceName} {`);
  const fields = Object.values(operationType.getFields())
    .filter((field) => field.name !== '_placeholder')
    .sort((a, b) => a.name.localeCompare(b.name));
  for (const field of fields) {
    addDocComment(lines, field.description, '    ');
    const { type, nullable } = getKotlinType(field.type);
    const returnType = type + (nullable ? '?' : '');
    const args = field.args.map((arg) => {
      const { type: argType, nullable: argNullable } = getKotlinType(arg.type);
      const argumentType = argType + (argNullable ? '?' : '');
      const defaultValue = argNullable ? ' = null' : '';
      return `${escapeKotlinName(arg.name)}: ${argumentType}${defaultValue}`;
    });
    const params = args.length > 0 ? args.join(', ') : '';
    const paramSegment = params ? `(${params})` : '()';
    lines.push(`    suspend fun ${escapeKotlinName(field.name)}${paramSegment}: ${returnType}`);
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
  objects.sort((a, b) => a.name.localeCompare(b.name)).forEach(printDataClass);
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

const outputPath = resolve(__dirname, '../src/generated/Types.kt');
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, lines.join('\n'));

// eslint-disable-next-line no-console
console.log('[generate-kotlin-types] wrote', outputPath);
