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
  const normalized = tokens.map((token) => (token === 'ios' ? 'IOS' : token));
  const [first, ...rest] = normalized;
  const formatFirst = () => {
    if (first === 'IOS') {
      return upper ? 'IOS' : 'ios';
    }
    return upper ? first.charAt(0).toUpperCase() + first.slice(1) : first;
  };
  const firstToken = formatFirst();
  const restTokens = rest.map((token) => (token === 'IOS' ? 'IOS' : token.charAt(0).toUpperCase() + token.slice(1)));
  return [firstToken, ...restTokens].join('');
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

const enumNames = new Set(enums.map((value) => value.name));
const interfaceNames = new Set(interfaces.map((value) => value.name));
const objectNames = new Set(objects.map((value) => value.name));
const inputNames = new Set(inputs.map((value) => value.name));
const unionNames = new Set(unions.map((value) => value.name));

const singleFieldObjects = new Map();
for (const objectType of objects) {
  const fields = Object.values(objectType.getFields());
  if (fields.length === 1) {
    singleFieldObjects.set(objectType.name, fields[0].type);
  }
}

const getTypeMetadata = (graphqlType) => {
  if (graphqlType instanceof GraphQLNonNull) {
    const inner = getTypeMetadata(graphqlType.ofType);
    return { ...inner, nullable: false };
  }
  if (graphqlType instanceof GraphQLList) {
    const inner = getTypeMetadata(graphqlType.ofType);
    const innerType = inner.dartType + (inner.nullable ? '?' : '');
    return {
      kind: 'list',
      nullable: true,
      elementType: inner,
      dartType: `List<${innerType}>`,
    };
  }
  const typeName = graphqlType.name;
  let kind = 'object';
  if (scalarMap.has(typeName)) {
    kind = 'scalar';
  } else if (enumNames.has(typeName)) {
    kind = 'enum';
  } else if (interfaceNames.has(typeName)) {
    kind = 'interface';
  } else if (inputNames.has(typeName)) {
    kind = 'input';
  } else if (unionNames.has(typeName)) {
    kind = 'union';
  } else if (objectNames.has(typeName)) {
    kind = 'object';
  }
  const dartType = scalarMap.get(typeName) ?? typeName;
  return {
    kind,
    name: typeName,
    nullable: true,
    dartType,
  };
};

const getDartType = (graphqlType) => {
  const metadata = getTypeMetadata(graphqlType);
  return { type: metadata.dartType, nullable: metadata.nullable, metadata };
};

const isNullableGraphQLType = (graphqlType) => !(graphqlType instanceof GraphQLNonNull);

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
  const base = getDartType(graphqlType);
  if (base.metadata.kind === 'list') {
    return base;
  }
  const namedType = getNamedGraphQLType(graphqlType);
  if (!namedType) {
    return base;
  }
  const singleFieldType = singleFieldObjects.get(namedType.name);
  if (!singleFieldType) {
    return base;
  }
  const fieldInfo = getDartType(singleFieldType);
  const finalNullable = base.nullable || fieldInfo.nullable || isNullableGraphQLType(graphqlType);
  return {
    type: fieldInfo.type,
    nullable: finalNullable,
    metadata: fieldInfo.metadata,
  };
};

const buildFromJsonExpression = (metadata, sourceExpression) => {
  if (metadata.kind === 'list') {
    const listCast = `(${sourceExpression} as List<dynamic>${metadata.nullable ? '?' : ''})`;
    const elementExpression = buildFromJsonExpression(metadata.elementType, 'e');
    const mapCall = (target) => `${target}.map((e) => ${elementExpression}).toList()`;
    if (metadata.nullable) {
      return `${listCast} == null ? null : ${mapCall(`${listCast}!`)}`;
    }
    return mapCall(listCast);
  }
  if (metadata.kind === 'scalar') {
    switch (metadata.name) {
      case 'Float':
        return metadata.nullable
          ? `(${sourceExpression} as num?)?.toDouble()`
          : `(${sourceExpression} as num).toDouble()`;
      case 'Int':
        return metadata.nullable
          ? `${sourceExpression} as int?`
          : `${sourceExpression} as int`;
      case 'Boolean':
        return metadata.nullable
          ? `${sourceExpression} as bool?`
          : `${sourceExpression} as bool`;
      case 'ID':
      case 'String':
        return metadata.nullable
          ? `${sourceExpression} as String?`
          : `${sourceExpression} as String`;
      default:
        return metadata.nullable ? `${sourceExpression}` : `${sourceExpression}`;
    }
  }
  if (metadata.kind === 'enum') {
    return metadata.nullable
      ? `${sourceExpression} != null ? ${metadata.name}.fromJson(${sourceExpression} as String) : null`
      : `${metadata.name}.fromJson(${sourceExpression} as String)`;
  }
  if (['object', 'input', 'interface', 'union'].includes(metadata.kind)) {
    return metadata.nullable
      ? `${sourceExpression} != null ? ${metadata.dartType}.fromJson(${sourceExpression} as Map<String, dynamic>) : null`
      : `${metadata.dartType}.fromJson(${sourceExpression} as Map<String, dynamic>)`;
  }
  return metadata.nullable ? `${sourceExpression}` : `${sourceExpression}`;
};

const buildToJsonExpression = (metadata, accessorExpression) => {
  if (metadata.kind === 'list') {
    const inner = buildToJsonExpression(metadata.elementType, 'e');
    if (metadata.nullable) {
      return `${accessorExpression} == null ? null : ${accessorExpression}!.map((e) => ${inner}).toList()`;
    }
    return `${accessorExpression}.map((e) => ${inner}).toList()`;
  }
  if (metadata.kind === 'enum') {
    return metadata.nullable
      ? `${accessorExpression}?.toJson()`
      : `${accessorExpression}.toJson()`;
  }
  if (['object', 'input', 'interface', 'union'].includes(metadata.kind)) {
    return metadata.nullable
      ? `${accessorExpression}?.toJson()`
      : `${accessorExpression}.toJson()`;
  }
  return accessorExpression;
};

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
    const name = escapeDartName(toPascalCase(value.name));
    const rawValue = toConstantCase(value.name);
    const suffix = index === values.length - 1 ? ';' : ',';
    lines.push(`  ${name}('${rawValue}')${suffix}`);
  });
  lines.push(
    '',
    `  const ${enumType.name}(this.value);`,
    '  final String value;',
    '',
    `  factory ${enumType.name}.fromJson(String value) {`,
    '    switch (value) {'
  );
  values.forEach((value) => {
    const name = escapeDartName(toPascalCase(value.name));
    const rawValue = toConstantCase(value.name);
    const schemaValue = value.name;
    lines.push(`      case '${rawValue}':`, `        return ${enumType.name}.${name};`);
    if (schemaValue !== rawValue) {
      lines.push(`      case '${schemaValue}':`, `        return ${enumType.name}.${name};`);
    }
  });
  lines.push(
    '    }',
    `    throw ArgumentError('Unknown ${enumType.name} value: $value');`,
    '  }',
    '',
    '  String toJson() => value;',
    '}',
    ''
  );
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
  const unionsForObject = unionMembership.has(objectType.name)
    ? Array.from(unionMembership.get(objectType.name)).sort()
    : [];
  const baseUnion = unionsForObject.shift() ?? null;
  const extendsClause = baseUnion ? ` extends ${baseUnion}` : '';
  const implementsTargets = [...interfacesForObject, ...unionsForObject];
  const implementsClause = implementsTargets.length ? ` implements ${implementsTargets.join(', ')}` : '';
  lines.push(`class ${objectType.name}${extendsClause}${implementsClause} {`);
  lines.push(`  const ${objectType.name}({`);
  const fields = Object.values(objectType.getFields()).sort((a, b) => a.name.localeCompare(b.name));
  const fieldInfos = fields.map((field) => {
    const { type, nullable, metadata } = getDartType(field.type);
    const fieldName = escapeDartName(field.name);
    return { field, fieldName, type, nullable, metadata };
  });
  fieldInfos.forEach(({ field, nullable, fieldName }) => {
    addDocComment(lines, field.description, '    ');
    const line = `    ${nullable ? '' : 'required '}this.${fieldName},`;
    lines.push(line);
  });
  lines.push('  });', '');
  fieldInfos.forEach(({ field, type, nullable, fieldName }) => {
    addDocComment(lines, field.description, '  ');
    const fieldType = `${type}${nullable ? '?' : ''}`;
    lines.push(`  final ${fieldType} ${fieldName};`);
  });
  lines.push('');
  lines.push(`  factory ${objectType.name}.fromJson(Map<String, dynamic> json) {`);
  lines.push(`    return ${objectType.name}(`);
  fieldInfos.forEach(({ field, fieldName, metadata }) => {
    const jsonExpression = buildFromJsonExpression(metadata, `json['${field.name}']`);
    lines.push(`      ${fieldName}: ${jsonExpression},`);
  });
  lines.push('    );');
  lines.push('  }', '');
  if (baseUnion) {
    lines.push('  @override');
  }
  lines.push('  Map<String, dynamic> toJson() {');
  lines.push('    return {');
  lines.push(`      '__typename': '${objectType.name}',`);
  fieldInfos.forEach(({ field, fieldName, metadata }) => {
    const toJsonExpression = buildToJsonExpression(metadata, fieldName);
    lines.push(`      '${field.name}': ${toJsonExpression},`);
  });
  lines.push('    };');
  lines.push('  }');
  lines.push('}', '');
};

const printInput = (inputType) => {
  if (inputType.name === 'RequestPurchaseProps') {
    addDocComment(lines, inputType.description);
    lines.push('class RequestPurchaseProps {');
    lines.push('  RequestPurchaseProps({');
    lines.push('    required this.request,');
    lines.push('    ProductQueryType? type,');
    lines.push('  }) : type = type ?? (request is RequestPurchasePropsRequestPurchase');
    lines.push('          ? ProductQueryType.InApp');
    lines.push('          : ProductQueryType.Subs) {');
    lines.push('    if (request is RequestPurchasePropsRequestPurchase && this.type != ProductQueryType.InApp) {');
    lines.push("      throw ArgumentError('type must be IN_APP when requestPurchase is provided');");
    lines.push('    }');
    lines.push('    if (request is RequestPurchasePropsRequestSubscription && this.type != ProductQueryType.Subs) {');
    lines.push("      throw ArgumentError('type must be SUBS when requestSubscription is provided');");
    lines.push('    }');
    lines.push('  }');
    lines.push('');
    lines.push('  final RequestPurchasePropsRequest request;');
    lines.push('  final ProductQueryType type;');
    lines.push('');
    lines.push('  factory RequestPurchaseProps.fromJson(Map<String, dynamic> json) {');
    lines.push("    final typeValue = json['type'] as String?;");
    lines.push('    final parsedType = typeValue != null ? ProductQueryType.fromJson(typeValue) : null;');
    lines.push("    final purchaseJson = json['requestPurchase'] as Map<String, dynamic>?;");
    lines.push('    if (purchaseJson != null) {');
    lines.push('      final request = RequestPurchasePropsRequestPurchase(RequestPurchasePropsByPlatforms.fromJson(purchaseJson));');
    lines.push('      final finalType = parsedType ?? ProductQueryType.InApp;');
    lines.push('      if (finalType != ProductQueryType.InApp) {');
    lines.push("        throw ArgumentError('type must be IN_APP when requestPurchase is provided');");
    lines.push('      }');
    lines.push('      return RequestPurchaseProps(request: request, type: finalType);');
    lines.push('    }');
    lines.push("    final subscriptionJson = json['requestSubscription'] as Map<String, dynamic>?;");
    lines.push('    if (subscriptionJson != null) {');
    lines.push('      final request = RequestPurchasePropsRequestSubscription(RequestSubscriptionPropsByPlatforms.fromJson(subscriptionJson));');
    lines.push('      final finalType = parsedType ?? ProductQueryType.Subs;');
    lines.push('      if (finalType != ProductQueryType.Subs) {');
    lines.push("        throw ArgumentError('type must be SUBS when requestSubscription is provided');");
    lines.push('      }');
    lines.push('      return RequestPurchaseProps(request: request, type: finalType);');
    lines.push('    }');
    lines.push("    throw ArgumentError('RequestPurchaseProps requires requestPurchase or requestSubscription');");
    lines.push('  }');
    lines.push('');
    lines.push('  Map<String, dynamic> toJson() {');
    lines.push('    if (request is RequestPurchasePropsRequestPurchase) {');
    lines.push('      return {');
    lines.push("        'requestPurchase': (request as RequestPurchasePropsRequestPurchase).value.toJson(),");
    lines.push("        'type': type.toJson(),");
    lines.push('      };');
    lines.push('    }');
    lines.push('    if (request is RequestPurchasePropsRequestSubscription) {');
    lines.push('      return {');
    lines.push("        'requestSubscription': (request as RequestPurchasePropsRequestSubscription).value.toJson(),");
    lines.push("        'type': type.toJson(),");
    lines.push('      };');
    lines.push('    }');
    lines.push("    throw StateError('Unsupported RequestPurchaseProps request variant');");
    lines.push('  }');
    lines.push('');
    lines.push('  static RequestPurchaseProps inApp({required RequestPurchasePropsByPlatforms request}) {');
    lines.push('    return RequestPurchaseProps(request: RequestPurchasePropsRequestPurchase(request), type: ProductQueryType.InApp);');
    lines.push('  }');
    lines.push('');
    lines.push('  static RequestPurchaseProps subs({required RequestSubscriptionPropsByPlatforms request}) {');
    lines.push('    return RequestPurchaseProps(request: RequestPurchasePropsRequestSubscription(request), type: ProductQueryType.Subs);');
    lines.push('  }');
    lines.push('}');
    lines.push('');
    lines.push('sealed class RequestPurchasePropsRequest {');
    lines.push('  const RequestPurchasePropsRequest();');
    lines.push('}');
    lines.push('');
    lines.push('class RequestPurchasePropsRequestPurchase extends RequestPurchasePropsRequest {');
    lines.push('  const RequestPurchasePropsRequestPurchase(this.value);');
    lines.push('  final RequestPurchasePropsByPlatforms value;');
    lines.push('}');
    lines.push('');
    lines.push('class RequestPurchasePropsRequestSubscription extends RequestPurchasePropsRequest {');
    lines.push('  const RequestPurchasePropsRequestSubscription(this.value);');
    lines.push('  final RequestSubscriptionPropsByPlatforms value;');
    lines.push('}');
    lines.push('');
    return;
  }
  addDocComment(lines, inputType.description);
  lines.push(`class ${inputType.name} {`);
  lines.push(`  const ${inputType.name}({`);
  const fields = Object.values(inputType.getFields()).sort((a, b) => a.name.localeCompare(b.name));
  const fieldInfos = fields.map((field) => {
    const { type, nullable, metadata } = getDartType(field.type);
    const fieldName = escapeDartName(field.name);
    return { field, fieldName, type, nullable, metadata };
  });
  fieldInfos.forEach(({ field, nullable, fieldName }) => {
    addDocComment(lines, field.description, '    ');
    const line = `    ${nullable ? '' : 'required '}this.${fieldName},`;
    lines.push(line);
  });
  lines.push('  });', '');
  fieldInfos.forEach(({ field, type, nullable, fieldName }) => {
    addDocComment(lines, field.description, '  ');
    const fieldType = `${type}${nullable ? '?' : ''}`;
    lines.push(`  final ${fieldType} ${fieldName};`);
  });
  lines.push('');
  lines.push(`  factory ${inputType.name}.fromJson(Map<String, dynamic> json) {`);
  lines.push(`    return ${inputType.name}(`);
  fieldInfos.forEach(({ field, fieldName, metadata }) => {
    const jsonExpression = buildFromJsonExpression(metadata, `json['${field.name}']`);
    lines.push(`      ${fieldName}: ${jsonExpression},`);
  });
  lines.push('    );');
  lines.push('  }', '');
  lines.push('  Map<String, dynamic> toJson() {');
  lines.push('    return {');
  fieldInfos.forEach(({ field, fieldName, metadata }) => {
    const toJsonExpression = buildToJsonExpression(metadata, fieldName);
    lines.push(`      '${field.name}': ${toJsonExpression},`);
  });
  lines.push('    };');
  lines.push('  }');
  lines.push('}', '');
};

const printUnion = (unionType) => {
  addDocComment(lines, unionType.description);
  const memberTypes = unionType.getTypes();
  const members = memberTypes.map((member) => member.name).sort();

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

  const implementsClause = sharedInterfaceNames.length ? ` implements ${sharedInterfaceNames.join(', ')}` : '';

  lines.push(`sealed class ${unionType.name}${implementsClause} {`);
  lines.push(`  const ${unionType.name}();`, '');
  lines.push(`  factory ${unionType.name}.fromJson(Map<String, dynamic> json) {`);
  lines.push(`    final typeName = json['__typename'] as String?;`);
  lines.push('    switch (typeName) {');
  members.forEach((member) => {
    lines.push(`      case '${member}':`, `        return ${member}.fromJson(json);`);
  });
  lines.push('    }');
  lines.push(`    throw ArgumentError('Unknown __typename for ${unionType.name}: $typeName');`);
  lines.push('  }', '');

  if (sharedInterfaceNames.length) {
    const interfaceFieldMap = new Map();
    for (const interfaceName of sharedInterfaceNames) {
      const interfaceType = schema.getType(interfaceName);
      if (!interfaceType || !isInterfaceType(interfaceType)) continue;
      const fields = Object.values(interfaceType.getFields()).sort((a, b) => a.name.localeCompare(b.name));
      for (const field of fields) {
        if (interfaceFieldMap.has(field.name)) continue;
        const { type, nullable } = getDartType(field.type);
        interfaceFieldMap.set(field.name, { field, type, nullable });
      }
    }

    const interfaceFields = Array.from(interfaceFieldMap.values()).sort((a, b) => a.field.name.localeCompare(b.field.name));
    interfaceFields.forEach(({ field, type, nullable }) => {
      addDocComment(lines, field.description, '  ');
      const fieldType = `${type}${nullable ? '?' : ''}`;
      const fieldName = escapeDartName(field.name);
      lines.push('  @override');
      lines.push(`  ${fieldType} get ${fieldName};`);
    });
    if (interfaceFields.length) {
      lines.push('');
    }
  }

  lines.push('  Map<String, dynamic> toJson();');
  lines.push('}', '');
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
    const { type, nullable } = getOperationReturnType(field.type);
    const returnType = `${type}${nullable ? '?' : ''}`;
    if (field.args.length === 0) {
      lines.push(`  Future<${returnType}> ${escapeDartName(field.name)}();`);
      continue;
    }
    if (field.args.length === 1) {
      const arg = field.args[0];
      const { type: argType, nullable: argNullable } = getDartType(arg.type);
      const finalType = `${argType}${argNullable ? '?' : ''}`;
      const argName = escapeDartName(arg.name);
      const open = argNullable ? '[' : '';
      const close = argNullable ? ']' : '';
      lines.push(`  Future<${returnType}> ${escapeDartName(field.name)}(${open}${finalType} ${argName}${close});`);
      continue;
    }
    lines.push('  Future<' + returnType + `> ${escapeDartName(field.name)}({`);
    field.args.forEach((arg) => {
      const { type: argType, nullable: argNullable } = getDartType(arg.type);
      const finalType = `${argType}${argNullable ? '?' : ''}`;
      const argName = escapeDartName(arg.name);
      const prefix = argNullable ? '' : 'required ';
      lines.push(`    ${prefix}${finalType} ${argName},`);
    });
    lines.push('  });');
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
    const pascalField = toPascalCase(field.name);
    const aliasName = `${rootName}${pascalField}Handler`;
    const { type, nullable } = getOperationReturnType(field.type);
    const returnType = `${type}${nullable ? '?' : ''}`;
    if (field.args.length === 0) {
      lines.push(`typedef ${aliasName} = Future<${returnType}> Function();`);
      return;
    }
    if (field.args.length === 1) {
      const arg = field.args[0];
      const { type: argType, nullable: argNullable } = getDartType(arg.type);
      const finalType = `${argType}${argNullable ? '?' : ''}`;
      const argName = escapeDartName(arg.name);
      if (argNullable) {
        lines.push(`typedef ${aliasName} = Future<${returnType}> Function([${finalType} ${argName}]);`);
      } else {
        lines.push(`typedef ${aliasName} = Future<${returnType}> Function(${finalType} ${argName});`);
      }
      return;
    }
    lines.push(`typedef ${aliasName} = Future<${returnType}> Function({`);
    field.args.forEach((arg) => {
      const { type: argType, nullable: argNullable } = getDartType(arg.type);
      const finalType = `${argType}${argNullable ? '?' : ''}`;
      const prefix = argNullable ? '' : 'required ';
      lines.push(`  ${prefix}${finalType} ${escapeDartName(arg.name)},`);
    });
    lines.push('});');
  });

  const helperClass = `${rootName}Handlers`;
  lines.push('', `class ${helperClass} {`);
  lines.push(`  const ${helperClass}({`);
  fields.forEach((field) => {
    lines.push(`    this.${escapeDartName(field.name)},`);
  });
  lines.push('  });', '');
  fields.forEach((field) => {
    const pascalField = toPascalCase(field.name);
    const aliasName = `${rootName}${pascalField}Handler`;
    const propertyName = escapeDartName(field.name);
    lines.push(`  final ${aliasName}? ${propertyName};`);
  });
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

if (operationTypes.length) {
  lines.push('// MARK: - Root Operation Helpers', '');
  operationTypes.sort((a, b) => a.name.localeCompare(b.name)).forEach(printOperationHelpers);
}

const outputPath = resolve(__dirname, '../src/generated/types.dart');
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, lines.join('\n'));

// eslint-disable-next-line no-console
console.log('[generate-dart-types] wrote', outputPath);
