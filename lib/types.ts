import { ValueOf } from "type-fest";

export type SzNumberBase = {
  type: "number";
  coerce?: boolean;
  min?: number;
  max?: number;
  minInclusive?: boolean;
  maxInclusive?: boolean;
  multipleOf?: number;
  format?: typeof NUMBER_FORMATS extends Set<infer T> ? T : never;
};
export type SzNumber = SzNumberBase & SzExtras;

export type SzBigIntBase = {
  type: "bigInt";
  coerce?: boolean;
  min?: string;
  max?: string;
  minInclusive?: boolean;
  maxInclusive?: boolean;
  multipleOf?: string;
  format?: "int64" | "uint64";
};
export type SzBigInt = SzBigIntBase & SzExtras;

export const NUMBER_FORMATS = new Set([
  "int32",
  "uint32",
  "float32",
  "float64",
  "safeint",
] as const);

export const STRING_KINDS = new Set([
  "url",
  "emoji",
  "nanoid",
  "cuid",
  "cuid2",
  "ulid",
  "date",
  "duration",
  "base64",
  "base64url",
  "guid",
  "xid",
  "ksuid",
  "json_string",
  "e164",
  "jwt",
  "credit_card",

  "ipv4",
  "ipv6",
  "cidrv4",
  "cidrv6",
  "e164",
  // "uuidv8", // In docs only
  // "ascii", // In docs only
  // "utf8", // In docs only
  // "lowercase", // Doesn't appear to have enough data to serialize
  // "uppercase", // Doesn't appear to have enough data to serialize
] as const);

export type SzStringBase = {
  type: "string";
  coerce?: boolean;
  min?: number;
  max?: number;
  length?: number;
  startsWith?: string;
  endsWith?: string;
  toLowerCase?: boolean;
  toUpperCase?: boolean;
  trim?: boolean;
} & (
  | object
  | {
      includes: string;
      position?: number;
    }
) &
  (
    | object
    | { kind: "ip"; version?: "v4" | "v6" }
    | { kind: "cidr"; version: "v4" | "v6" }
    | {
        kind: "uuid";
        version?: "v1" | "v2" | "v3" | "v4" | "v5" | "v6" | "v7" | "v8";
      }
    | { regex: string; flags?: string }
    | {
        kind: "time";
        precision?: number;
      }
    | {
        kind: "datetime";
        offset?: true;
        local?: true;
        precision?: number;
      }
    | {
        kind: "email";
        pattern?: string;
        flags?: string;
      }
    | {
        kind: "jwt";
        algorithm?: string;
      }
    | {
        kind: typeof STRING_KINDS extends Set<infer T> ? T : never;
      }
  );
export type SzString = SzStringBase & SzExtras;

export type SzDateBase = {
  type: "date";
  coerce?: boolean;
  min?: number;
  max?: number;
  minInclusive?: boolean;
  maxInclusive?: boolean;
};
export type SzDate = SzDateBase & SzExtras;

export type SzTemplateLiteralBase = {
  type: "templateLiteral";
  parts: (string | SzType)[];
  format?: string;
};
export type SzTemplateLiteral = SzTemplateLiteralBase & SzExtras;

export type SzFileBase = {
  type: "file";
  min?: number;
  max?: number;
  mime?: string[];
};
export type SzFile = SzFileBase & SzExtras;

export type SzBooleanBase = { type: "boolean"; coerce?: boolean };
export type SzBoolean = SzBooleanBase & SzExtras;
export type SzNaNBase = { type: "nan" };
export type SzNaN = SzNaNBase & SzExtras;
export type SzUndefinedBase = { type: "undefined" };
export type SzUndefined = SzUndefinedBase & SzExtras;
export type SzNullBase = { type: "null" };
export type SzNull = SzNullBase & SzExtras;
export type SzAnyBase = { type: "any" };
export type SzAny = SzAnyBase & SzExtras;
export type SzUnknownBase = { type: "unknown" };
export type SzUnknown = SzUnknownBase & SzExtras;
export type SzNeverBase = { type: "never" };
export type SzNever = SzNeverBase & SzExtras;
export type SzVoidBase = { type: "void" };
export type SzVoid = SzVoidBase & SzExtras;
export type SzSymbolBase = { type: "symbol" };
export type SzSymbol = SzSymbolBase & SzExtras;

export type SzPrimitive =
  | SzBoolean
  | SzNumber
  | SzBigInt
  | SzString
  | SzNaN
  | SzDate
  | SzFile
  | SzUndefined
  | SzNull
  | SzAny
  | SzUnknown
  | SzNever
  | SzVoid
  | SzSymbol;

export type SzLiteralBase<T> = { type: "literal"; values: T };
export type SzLiteral<T> = SzLiteralBase<T> & SzExtras;
export type SzArrayBase<T extends SzType = SzType> = {
  type: "array";
  element: T;
  minLength?: number;
  maxLength?: number;
};
export type SzArray<T extends SzType = SzType> = SzArrayBase<T> & SzExtras;
export type SzObjectBase<
  T extends Record<string, SzType> = Record<string, SzType>,
  U extends SzType = SzType,
> = {
  type: "object";
  properties: T;
  symbols?: T;
  catchall?: U;
};
export type SzObject<
  T extends Record<string, SzType> = Record<string, SzType>,
  U extends SzType = SzType,
> = SzObjectBase<T, U> & SzExtras;

export type SzUnionBase<Options extends [SzType, ...SzType[]] = [SzType]> = {
  type: "union";
  options: Options;
};
export type SzUnion<Options extends [SzType, ...SzType[]] = [SzType]> =
  SzUnionBase<Options> & SzExtras;
export type SzDiscriminatedUnionOption<Discriminator extends string> = SzObject<
  Record<string, SzType>
>;
export type SzDiscriminatedUnionBase<
  Discriminator extends string = string,
  Options extends readonly SzType[] = readonly SzType[],
> = {
  type: "discriminatedUnion";
  discriminator: Discriminator;
  options: Options;
};
export type SzDiscriminatedUnion<
  Discriminator extends string = string,
  Options extends readonly SzType[] = readonly SzType[],
> = SzDiscriminatedUnionBase<Discriminator, Options> & SzExtras;
export type SzIntersectionBase<
  Left extends SzType = SzType,
  Right extends SzType = SzType,
> = {
  type: "intersection";
  left: Left;
  right: Right;
};
export type SzIntersection<
  Left extends SzType = SzType,
  Right extends SzType = SzType,
> = SzIntersectionBase<Left, Right> & SzExtras;
export type SzXorBase<Options extends [SzType, ...SzType[]] = [SzType]> = {
  type: "xor";
  options: Options;
};
export type SzXor<Options extends [SzType, ...SzType[]] = [SzType]> =
  SzXorBase<Options> & SzExtras;
export type SzTupleBase<
  Items extends [SzType, ...SzType[]] | [] = [SzType, ...SzType[]] | [],
> = {
  type: "tuple";
  items: Items;
  rest?: SzType;
};
export type SzTuple<
  Items extends [SzType, ...SzType[]] | [] = [SzType, ...SzType[]] | [],
> = SzTupleBase<Items> & SzExtras;
export type SzRecordBase<
  Key extends SzKey = SzKey,
  Value extends SzType = SzType,
> = {
  type: "record";
  key: Key;
  value: Value;
};
export type SzRecord<
  Key extends SzKey = SzKey,
  Value extends SzType = SzType,
> = SzRecordBase<Key, Value> & SzExtras;
export type SzLooseRecordBase<
  Key extends SzKey = SzKey,
  Value extends SzType = SzType,
> = {
  type: "looseRecord";
  key: Key;
  value: Value;
};
export type SzLooseRecord<
  Key extends SzKey = SzKey,
  Value extends SzType = SzType,
> = SzLooseRecordBase<Key, Value> & SzExtras;
export type SzMapBase<Key extends SzType, Value extends SzType> = {
  type: "map";
  key: Key;
  value: Value;
  min?: number;
  max?: number;
};
export type SzMap<Key extends SzType, Value extends SzType> = SzMapBase<
  Key,
  Value
> &
  SzExtras;
export type SzSetBase<T extends SzType = SzType> = {
  type: "set";
  value: T;
  minSize?: number;
  maxSize?: number;
};
export type SzSet<T extends SzType = SzType> = SzSetBase<T> & SzExtras;
export type SzEnumBase<
  Values extends Readonly<
    Record<string, import("zod/v4/core").util.EnumValue>
  > = Readonly<Record<string, import("zod/v4/core").util.EnumValue>>,
> = {
  type: "enum";
  values: Values;
};
export type SzEnum<
  Values extends Readonly<
    Record<string, import("zod/v4/core").util.EnumValue>
  > = Readonly<Record<string, import("zod/v4/core").util.EnumValue>>,
> = SzEnumBase<Values> & SzExtras;

export type SzPromiseBase<T extends SzType = SzType> = {
  type: "promise";
  value: T;
};
export type SzPromise<T extends SzType = SzType> = SzPromiseBase<T> & SzExtras;

export type SzFunctionBase<T extends SzTuple, U extends SzType> = {
  type: "function";
  input: T;
  output: U;
};
export type SzFunction<T extends SzTuple, U extends SzType> = SzFunctionBase<
  T,
  U
> &
  SzExtras;

export type SzCatchBase<T extends SzType = SzType> = {
  type: "catch";
  value: any;
  innerType: T;
};
export type SzCatch<T extends SzType = SzType> = SzCatchBase<T> & SzExtras;

export type SzPipeBase<T extends SzType = SzType, U extends SzType = SzType> = {
  type: "pipe";
  inner: T;
  outer: U;
};
export type SzPipe<
  T extends SzType = SzType,
  U extends SzType = SzType,
> = SzPipeBase<T, U> & SzExtras;

export type SzStringbool<
  T extends SzType = SzType,
  U extends SzType = SzType,
> = SzPipe<T, U> & {
  truthy: string[];
  falsy: string[];
};

export type SzCodecBase<
  T extends SzType = SzType,
  U extends SzType = SzType,
> = {
  type: "codec";
  name: string;
  input: T;
  output: U;
};
export type SzCodec<
  T extends SzType = SzType,
  U extends SzType = SzType,
> = SzCodecBase<T, U> & SzExtras;

export type SzInstanceOfBase = {
  type: "instanceof";
  name: string;
};
export type SzInstanceOf = SzInstanceOfBase & SzExtras;

export type InstanceConstructor = new (...args: any[]) => any;

export type SzTransformBase = {
  type: "transform";
  name: string;
};
export type SzTransform = SzTransformBase & SzExtras;

// Modifiers
export type SzNullable = { isNullable: boolean };
export type SzOptional = { isOptional: boolean };
export type SzDefault<T> = { defaultValue: T };
export type SzDescription = { description: string };
export type SzMeta = {
  meta: {
    [x: string]: unknown;
    id?: string | undefined;
    title?: string | undefined;
    description?: string | undefined;
    deprecated?: boolean | undefined;
  };
};
export type SzReadonly = { readonly: boolean };

export type SzRef = { $ref: string };

export type SzError = {
  error: string | { key: string };
};

export type SzChecks = {
  checks: { name: string }[];
};

export type SzExtras = Partial<
  SzNullable &
    SzOptional &
    SzDefault<any> &
    SzDescription &
    SzMeta &
    SzReadonly &
    SzError &
    SzChecks
>;

// Conjunctions
export type SzKey =
  | SzString
  | SzNumber
  | SzSymbol
  | SzLiteral<string | number | bigint | boolean | null | undefined>
  | SzEnum<any>;
export type SzDefaultOrNullable = SzDefault<any> | SzNullable;

export type SzType =
  | SzPrimitive
  | SzLiteral<any>
  | SzTemplateLiteral
  | SzArray<any>
  | SzObject<any, any>
  | SzUnion<any>
  | SzDiscriminatedUnion<any, any>
  | SzIntersection<any, any>
  | SzXor<any>
  | SzTuple<any>
  | SzRecord<any, any>
  | SzLooseRecord<any, any>
  | SzMap<any, any>
  | SzSet<any>
  | SzEnum<any>
  | SzPromise<any>
  | SzFunction<any, any>
  | SzCatch<any>
  | SzPipe<any, any>
  | SzCodec<any, any>
  | SzInstanceOf
  | SzTransform;

export type SzDocument<T extends SzType = SzType> = T & {
  $zodexySchema?: string;
};

export type SzUnionize<T extends SzType | SzRef> =
  | T
  | (T extends SzArray<infer T>
      ? SzUnionize<T>
      : T extends SzObject<infer Properties>
        ? SzUnionize<ValueOf<Properties>>
        : T extends SzUnion<infer Options>
          ? SzUnionize<Options[number]>
          : T extends SzDiscriminatedUnion<infer _D, infer Options>
            ? SzUnionize<Options[number]>
            : T extends SzIntersection<infer L, infer R>
              ? SzUnionize<L | R>
              : T extends SzXor<infer Options>
                ? SzUnionize<Options[number]>
                : T extends SzTuple<infer Items>
                  ? SzUnionize<Items[number]>
                  : T extends SzRecord<infer _Key, infer Value>
                    ? SzUnionize<Value>
                    : T extends SzLooseRecord<infer _Key, infer Value>
                      ? SzUnionize<Value>
                      : T extends SzMap<infer _Key, infer Value>
                        ? SzUnionize<Value>
                        : T extends SzSet<infer T>
                          ? SzUnionize<T>
                          : T extends SzPromise<infer Value>
                            ? SzUnionize<Value>
                            : T extends SzCodec<infer Input, infer Output>
                              ? SzUnionize<Input | Output>
                              : never);
