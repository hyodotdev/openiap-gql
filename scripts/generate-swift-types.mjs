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

const capitalize = (value) => (value.length === 0 ? value : value.charAt(0).toUpperCase() + value.slice(1));

const toKebabCase = (value) => value
  .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
  .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
  .replace(/[_\s]+/g, '-')
  .replace(/-+/g, '-')
  .toLowerCase();

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

const unwrapNonNull = (graphqlType) => {
  let current = graphqlType;
  while (current instanceof GraphQLNonNull) {
    current = current.ofType;
  }
  return current;
};

const getNamedGraphQLType = (graphqlType) => {
  const unwrapped = unwrapNonNull(graphqlType);
  if (unwrapped instanceof GraphQLList) {
    return null;
  }
  return unwrapped;
};

const getOperationReturnType = (graphqlType) => {
  const base = swiftTypeFor(graphqlType);
  const namedType = getNamedGraphQLType(graphqlType);
  if (namedType && namedType.name === 'VoidResult') {
    return {
      type: 'Void',
      optional: !(graphqlType instanceof GraphQLNonNull),
    };
  }
  if (!namedType) {
    return base;
  }
  const singleFieldType = singleFieldObjects.get(namedType.name);
  if (!singleFieldType) {
    return base;
  }
  const fieldInfo = swiftTypeFor(singleFieldType);
  const fieldOptional = !(graphqlType instanceof GraphQLNonNull);
  return {
    type: fieldInfo.type,
    optional: fieldInfo.optional || fieldOptional,
  };
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

const unionWrapperNames = new Set();
for (const schemaPath of schemaPaths) {
  let expectTypeName = false;
  for (const line of readFileSync(schemaPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#') && trimmed.toLowerCase().includes('=> union')) {
      expectTypeName = true;
      continue;
    }
    if (expectTypeName) {
      if (trimmed.length === 0) {
        continue;
      }
      if (trimmed.startsWith('#')) {
        continue;
      }
      const typeMatch = trimmed.match(/^type\s+([A-Za-z0-9_]+)/);
      if (typeMatch) {
        unionWrapperNames.add(typeMatch[1]);
      }
      expectTypeName = false;
    }
  }
}

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

const singleFieldObjects = new Map();
for (const objectType of objects) {
  const fields = Object.values(objectType.getFields());
  if (fields.length === 1 && objectType.name.endsWith('Args')) {
    singleFieldObjects.set(objectType.name, fields[0].type);
  }
}

const resultUnionObjects = new Map();
for (const objectType of objects) {
  if (!unionWrapperNames.has(objectType.name)) continue;
  const fields = Object.values(objectType.getFields()).sort((a, b) => a.name.localeCompare(b.name));
  if (fields.length === 0) continue;
  const unionEntries = [];
  let allOptional = true;
  for (const field of fields) {
    if (field.type instanceof GraphQLNonNull) {
      allOptional = false;
      break;
    }
    const { type, optional } = swiftTypeFor(field.type);
    unionEntries.push({ field, type, optional });
  }
  if (!allOptional) continue;
  if (unionEntries.length === 0) continue;
  resultUnionObjects.set(objectType.name, unionEntries);
}

const printEnum = (enumType) => {
  addDocComment(lines, enumType.description);
  lines.push(`public enum ${enumType.name}: String, Codable, CaseIterable {`);
  const values = enumType.getValues();
  values.forEach((value, index) => {
    addDocComment(lines, value.description, '    ');
    const caseName = escapeSwiftName(lowerCamelCase(value.name));
    const rawValue = toKebabCase(value.name);
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
  if (objectType.name === 'VoidResult') {
    lines.push('public typealias VoidResult = Void', '');
    return;
  }
  if (resultUnionObjects.has(objectType.name)) {
    addDocComment(lines, objectType.description);
    lines.push(`public enum ${objectType.name} {`);
    const unionEntries = resultUnionObjects.get(objectType.name);
    unionEntries.forEach(({ field, type, optional }) => {
      const caseName = escapeSwiftName(lowerCamelCase(field.name));
      const payloadType = type + (optional ? '?' : '');
      lines.push(`    case ${caseName}(${payloadType})`);
    });
    lines.push('}', '');
    return;
  }
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
  if (inputType.name === 'RequestPurchaseProps') {
    addDocComment(lines, inputType.description);
    lines.push('public struct RequestPurchaseProps: Codable {');
    lines.push('    public var request: Request');
    lines.push('    public var type: ProductQueryType');
    lines.push('');
    lines.push('    public init(request: Request, type: ProductQueryType? = nil) {');
    lines.push('        switch request {');
    lines.push('        case .purchase:');
    lines.push('            let resolved = type ?? .inApp');
    lines.push('            precondition(resolved == .inApp, "RequestPurchaseProps.type must be .inApp when request is purchase")');
    lines.push('            self.type = resolved');
    lines.push('        case .subscription:');
    lines.push('            let resolved = type ?? .subs');
    lines.push('            precondition(resolved == .subs, "RequestPurchaseProps.type must be .subs when request is subscription")');
    lines.push('            self.type = resolved');
    lines.push('        }');
    lines.push('        self.request = request');
    lines.push('    }');
    lines.push('');
    lines.push('    private enum CodingKeys: String, CodingKey {');
    lines.push('        case requestPurchase');
    lines.push('        case requestSubscription');
    lines.push('        case type');
    lines.push('    }');
    lines.push('');
    lines.push('    public init(from decoder: Decoder) throws {');
    lines.push('        let container = try decoder.container(keyedBy: CodingKeys.self)');
    lines.push('        let decodedType = try container.decodeIfPresent(ProductQueryType.self, forKey: .type)');
    lines.push('        if let purchase = try container.decodeIfPresent(RequestPurchasePropsByPlatforms.self, forKey: .requestPurchase) {');
    lines.push('            let finalType = decodedType ?? .inApp');
    lines.push('            guard finalType == .inApp else {');
    lines.push('                throw DecodingError.dataCorruptedError(forKey: .type, in: container, debugDescription: "type must be IN_APP when requestPurchase is provided")');
    lines.push('            }');
    lines.push('            self.request = .purchase(purchase)');
    lines.push('            self.type = finalType');
    lines.push('            return');
    lines.push('        }');
    lines.push('        if let subscription = try container.decodeIfPresent(RequestSubscriptionPropsByPlatforms.self, forKey: .requestSubscription) {');
    lines.push('            let finalType = decodedType ?? .subs');
    lines.push('            guard finalType == .subs else {');
    lines.push('                throw DecodingError.dataCorruptedError(forKey: .type, in: container, debugDescription: "type must be SUBS when requestSubscription is provided")');
    lines.push('            }');
    lines.push('            self.request = .subscription(subscription)');
    lines.push('            self.type = finalType');
    lines.push('            return');
    lines.push('        }');
    lines.push('        throw DecodingError.dataCorruptedError(forKey: .requestPurchase, in: container, debugDescription: "RequestPurchaseProps requires requestPurchase or requestSubscription.")');
    lines.push('    }');
    lines.push('');
    lines.push('    public func encode(to encoder: Encoder) throws {');
    lines.push('        var container = encoder.container(keyedBy: CodingKeys.self)');
    lines.push('        switch request {');
    lines.push('        case let .purchase(value):');
    lines.push('            try container.encode(value, forKey: .requestPurchase)');
    lines.push('        case let .subscription(value):');
    lines.push('            try container.encode(value, forKey: .requestSubscription)');
    lines.push('        }');
    lines.push('        try container.encode(type, forKey: .type)');
    lines.push('    }');
    lines.push('');
    lines.push('    public enum Request {');
    lines.push('        case purchase(RequestPurchasePropsByPlatforms)');
    lines.push('        case subscription(RequestSubscriptionPropsByPlatforms)');
    lines.push('    }');
    lines.push('}');
    lines.push('');
    return;
  }
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
  const memberTypes = unionType.getTypes();
  const caseInfos = memberTypes.map((member) => ({
    typeName: member.name,
    caseName: escapeSwiftName(lowerCamelCase(member.name)),
  }));

  let sharedInterfaceNames = [];
  if (memberTypes.length > 0) {
    const [firstMember, ...otherMembers] = memberTypes;
    const firstInterfaces = new Set(firstMember.getInterfaces().map((iface) => iface.name));
    for (const member of otherMembers) {
      const memberInterfaces = new Set(member.getInterfaces().map((iface) => iface.name));
      for (const ifaceName of Array.from(firstInterfaces)) {
        if (!memberInterfaces.has(ifaceName)) {
          firstInterfaces.delete(ifaceName);
        }
      }
    }
    sharedInterfaceNames = Array.from(firstInterfaces).sort();
  }

  const conformances = ['Codable', ...sharedInterfaceNames];
  const conformanceClause = conformances.length ? `: ${conformances.join(', ')}` : '';

  lines.push(`public enum ${unionType.name}${conformanceClause} {`);
  caseInfos.forEach(({ typeName, caseName }) => {
    lines.push(`    case ${caseName}(${typeName})`);
  });

  if (sharedInterfaceNames.length) {
    const interfaceFieldMap = new Map();
    for (const interfaceName of sharedInterfaceNames) {
      const interfaceType = schema.getType(interfaceName);
      if (!interfaceType || !isInterfaceType(interfaceType)) continue;
      const fields = Object.values(interfaceType.getFields()).sort((a, b) => a.name.localeCompare(b.name));
      for (const field of fields) {
        if (interfaceFieldMap.has(field.name)) continue;
        const { type, optional } = swiftTypeFor(field.type);
        interfaceFieldMap.set(field.name, { field, type, optional });
      }
    }

    const interfaceFields = Array.from(interfaceFieldMap.values()).sort((a, b) => a.field.name.localeCompare(b.field.name));
    if (interfaceFields.length) {
      lines.push('');
    }
    interfaceFields.forEach(({ field, type, optional }, index) => {
      addDocComment(lines, field.description, '    ');
      const propertyType = type + (optional ? '?' : '');
      const propertyName = escapeSwiftName(field.name);
      lines.push(`    public var ${propertyName}: ${propertyType} {`);
      lines.push('        switch self {');
      caseInfos.forEach(({ caseName }) => {
        lines.push(`        case let .${caseName}(value):`);
        lines.push(`            return value.${propertyName}`);
      });
      lines.push('        }');
      lines.push('    }');
      if (index < interfaceFields.length - 1) {
        lines.push('');
      }
    });
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
    const { type, optional } = getOperationReturnType(field.type);
    const returnType = type + (optional ? '?' : '');
    if (field.args.length === 0) {
      lines.push(`    func ${escapeSwiftName(field.name)}() async throws -> ${returnType}`);
      continue;
    }
    if (field.args.length === 1) {
      const arg = field.args[0];
      const { type: argType, optional: argOptional } = swiftTypeFor(arg.type);
      const argName = escapeSwiftName(arg.name);
      const finalType = argType + (argOptional ? '?' : '');
      const defaultValue = argOptional ? ' = nil' : '';
      lines.push(`    func ${escapeSwiftName(field.name)}(_ ${argName}: ${finalType}${defaultValue}) async throws -> ${returnType}`);
      continue;
    }
    const params = field.args.map((arg) => {
      const { type: argType, optional: argOptional } = swiftTypeFor(arg.type);
      const argName = escapeSwiftName(arg.name);
      const finalType = argType + (argOptional ? '?' : '');
      const defaultValue = argOptional ? ' = nil' : '';
      return `${argName}: ${finalType}${defaultValue}`;
    }).join(', ');
    lines.push(`    func ${escapeSwiftName(field.name)}(${params}) async throws -> ${returnType}`);
  }
  lines.push('}', '');
};

const printOperationHelpers = (operationType) => {
  const rootName = operationType.name;
  const fields = Object.values(operationType.getFields())
    .filter((field) => field.name !== '_placeholder')
    .sort((a, b) => a.name.localeCompare(b.name));
  if (fields.length === 0) return;

  lines.push(`// MARK: - ${rootName} Helpers`, '');

  fields.forEach((field) => {
    const aliasName = `${rootName}${capitalize(field.name)}Handler`;
    const { type, optional } = getOperationReturnType(field.type);
    const returnType = type + (optional ? '?' : '');
    if (field.args.length === 0) {
      lines.push(`public typealias ${aliasName} = () async throws -> ${returnType}`);
      return;
    }
    const params = field.args.map((arg) => {
      const { type: argType, optional: argOptional } = swiftTypeFor(arg.type);
      const finalType = argType + (argOptional ? '?' : '');
      return `_ ${escapeSwiftName(arg.name)}: ${finalType}`;
    }).join(', ');
    lines.push(`public typealias ${aliasName} = (${params}) async throws -> ${returnType}`);
  });

  const structName = `${rootName}Handlers`;
  lines.push('', `public struct ${structName} {`);
  fields.forEach((field) => {
    const aliasName = `${rootName}${capitalize(field.name)}Handler`;
    lines.push(`    public var ${escapeSwiftName(field.name)}: ${aliasName}?`);
  });
  lines.push('');
  const initParams = fields.map((field) => {
    const aliasName = `${rootName}${capitalize(field.name)}Handler`;
    return `${escapeSwiftName(field.name)}: ${aliasName}? = nil`;
  }).join(',\n        ');
  lines.push('    public init(' + (fields.length ? `\n        ${initParams}\n    ` : '') + ') {');
  fields.forEach((field) => {
    const propertyName = escapeSwiftName(field.name);
    lines.push(`        self.${propertyName} = ${propertyName}`);
  });
  lines.push('    }');
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

if (operations.length) {
  lines.push('// MARK: - Root Operation Helpers', '');
  operations.sort((a, b) => a.name.localeCompare(b.name)).forEach(printOperationHelpers);
}

const outputPath = resolve(__dirname, '../src/generated/Types.swift');
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, lines.join('\n'));

// eslint-disable-next-line no-console
console.log('[generate-swift-types] wrote', outputPath);
