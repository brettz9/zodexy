import fs from "fs";
import { expect, expectTypeOf, test } from "vitest";
import { z } from "zod";
import {
  SzCatch,
  SzEnum,
  SzExtras,
  SzLiteral,
  SzLiteralBase,
} from "./types.js";
import { ZodTypes } from "./zod-types.js";

import { dezerialize, SzType, zerialize, Zerialize } from "./index.js";

const zodexySchemaJSON = JSON.parse(
  fs.readFileSync("./schema.zodexy.json", "utf-8"),
);
const zodexySchema = dezerialize(zodexySchemaJSON);

const p = <Schema extends ZodTypes, Shape extends SzType = Zerialize<Schema>>(
  schema: Schema,
  shape: Shape,
): [Schema, Shape] => [schema, shape];

test("standalone schema types include extras", () => {
  const literal: SzLiteral<"value"> = {
    type: "literal",
    values: "value",
    description: "A literal value",
  };
  const literalBase: SzLiteralBase<"value"> = {
    type: "literal",
    values: "value",
  };

  expect(literal.description).toBe("A literal value");
  expectTypeOf<SzType>().toExtend<SzExtras>();
  expectTypeOf<Zerialize<z.ZodString>>().toExtend<SzExtras>();
  expectTypeOf(literalBase).not.toHaveProperty("description");
});

enum Fruits {
  Apple,
  Banana,
  Cherries = "Cherries",
}

const baseCategorySchema = z.object({
  name: z.string(),
});
const categorySchema: any = baseCategorySchema.extend({
  subcategories: z.lazy(() => categorySchema.array()),
});

const baseCategorySchemaNested = z.object({
  name: z.string(),
});
const categorySchemaNested: any = baseCategorySchemaNested.extend({
  subcategory: z.lazy(() => categorySchemaNested),
});

test.each([
  p(z.boolean(), { type: "boolean" }),
  p(
    z.boolean().meta({
      description: "Some boolean",
    }),
    { type: "boolean", description: "Some boolean" },
  ),
  p(
    z.any().meta({
      otherInfo: "Some boolean",
    }),
    { type: "any", meta: { otherInfo: "Some boolean" } },
  ),
  p(z.nan(), { type: "nan" }),
  p(z.null(), { type: "null" }),
  p(z.undefined(), { type: "undefined" }),
  p(z.any(), { type: "any" }),
  p(z.unknown(), { type: "unknown" }),
  p(z.never(), { type: "never" }),
  p(z.void(), { type: "void" }),
  p(z.enum(Fruits), {
    type: "enum",
    values: {
      0: "Apple",
      1: "Banana",
      Apple: 0,
      Banana: 1,
      Cherries: "Cherries",
    },
  }),
  p(z.object({ name: z.string() }).brand<"Cat">(), {
    type: "object",
    properties: {
      name: {
        type: "string",
      },
    },
  }),
  p(z.object({ name: z.string() }).catchall(z.number()), {
    type: "object",
    properties: {
      name: {
        type: "string",
      },
    },
    catchall: {
      type: "number",
    },
  }),
  p(z.string(), { type: "string" }),
  p(z.string({ error: "Not a string" }), {
    type: "string",
    error: "Not a string",
  }),

  p(z.string().regex(/sth/), { type: "string", regex: "sth" }),
  p(z.string().min(3).max(7).regex(/sth/u), {
    type: "string",
    min: 3,
    max: 7,
    regex: "sth",
    flags: "u",
  }),

  p(z.string().length(10).startsWith("a").endsWith("z").includes("rst"), {
    type: "string",
    length: 10,
    startsWith: "a",
    endsWith: "z",
    includes: "rst",
  }),

  p(z.string().includes("special word", { position: 5 }), {
    type: "string",
    includes: "special word",
    position: 5,
  }),

  p(z.string().toLowerCase(), { type: "string", toLowerCase: true }),
  p(z.string().toUpperCase(), { type: "string", toUpperCase: true }),
  p(z.string().trim(), { type: "string", trim: true }),

  p(z.uuidv4(), { type: "string", kind: "uuid", version: "v4" }),
  p(z.uuidv7(), { type: "string", kind: "uuid", version: "v7" }),
  p(z.ipv4(), { type: "string", kind: "ip", version: "v4" }),
  p(z.ipv6(), { type: "string", kind: "ip", version: "v6" }),
  p(z.cidrv4(), { type: "string", kind: "cidr", version: "v4" }),
  p(z.cidrv6(), { type: "string", kind: "cidr", version: "v6" }),
  p(z.e164(), { type: "string", kind: "e164" }),

  p(z.guid(), { type: "string", kind: "guid" }),
  p(z.ksuid(), { type: "string", kind: "ksuid" }),
  // p(z.json_string(), { type: "string", kind: "json_string" }),

  p(z.jwt(), { type: "string", kind: "jwt" }),
  p(z.jwt({ alg: "RS512" }), {
    type: "string",
    kind: "jwt",
    algorithm: "RS512",
  }),
  // p(z.lowercase(), { type: "string", kind: "lowercase" }),
  // p(z.uppercase(), { type: "string", kind: "uppercase" }),

  p(z.templateLiteral(["email: ", z.string()]), {
    type: "templateLiteral",
    parts: [
      "email: ",
      {
        type: "string",
      },
    ],
  }),

  p(z.templateLiteral(["email: ", z.string()], { format: "typeid" }), {
    type: "templateLiteral",
    format: "typeid",
    parts: [
      "email: ",
      {
        type: "string",
      },
    ],
  }),

  p(
    z.function({
      input: [z.any()],
      output: z.string(),
    }),
    {
      type: "function",
      input: {
        type: "tuple",
        items: [
          {
            type: "any",
          },
        ],
      },
      output: {
        type: "string",
      },
    },
  ),

  p(z.file().min(10_000).max(1_000_000).mime(["image/png"]), {
    type: "file",
    min: 10000,
    max: 1000000,
    mime: ["image/png"],
  }),
  p(z.file(), {
    type: "file",
  }),
  p(z.email(), { type: "string", kind: "email" }),
  p(
    z.email({
      pattern: /abc@example\.com/u,
    }),
    {
      type: "string",
      kind: "email",
      pattern: "abc@example\\.com",
      flags: "u",
    },
  ),
  p(z.url(), { type: "string", kind: "url" }),
  p(z.emoji(), { type: "string", kind: "emoji" }),
  p(z.uuid(), { type: "string", kind: "uuid" }),
  p(z.nanoid(), { type: "string", kind: "nanoid" }),
  p(z.cuid(), { type: "string", kind: "cuid" }),
  p(z.cuid2(), { type: "string", kind: "cuid2" }),
  p(z.ulid(), { type: "string", kind: "ulid" }),
  p(z.iso.datetime(), { type: "string", kind: "datetime" }),
  p(z.iso.datetime({ local: true }), {
    type: "string",
    kind: "datetime",
    local: true,
  }),

  p(z.iso.date(), { type: "string", kind: "date" }),
  p(z.iso.duration(), { type: "string", kind: "duration" }),
  p(z.cidrv4(), { type: "string", kind: "cidr", version: "v4" }),
  p(z.base64(), { type: "string", kind: "base64" }),
  p(z.base64url(), { type: "string", kind: "base64url" }),

  p(z.ipv4(), {
    type: "string",
    kind: "ip",
    version: "v4",
  }),
  p(z.xid(), {
    type: "string",
    kind: "xid",
  }),
  p(z.ipv6(), {
    type: "string",
    kind: "ip",
    version: "v6",
  }),
  p(z.cidrv6(), {
    type: "string",
    kind: "cidr",
    version: "v6",
  }),

  p(z.iso.datetime({ offset: true, precision: 3 }), {
    type: "string",
    kind: "datetime",
    offset: true,
    precision: 3,
  }),

  p(z.iso.time(), {
    type: "string",
    kind: "time",
  }),
  p(z.iso.time({ precision: 3 }), {
    type: "string",
    kind: "time",
    precision: 3,
  }),

  p(z.number(), { type: "number" }),

  p(z.string().optional(), { type: "string", isOptional: true }),
  p(z.string().nullable(), { type: "string", isNullable: true }),

  p(
    z.string().default(() => "foo"),
    { type: "string", defaultValue: "foo" },
  ),
  p(z.string().default("foo"), { type: "string", defaultValue: "foo" }),
  p(z.bigint().default(123n), { type: "bigInt", defaultValue: "123" }),
  p(z.boolean().default(true), { type: "boolean", defaultValue: true }),
  p(z.date().default(new Date("1999-01-01")), {
    type: "date",
    defaultValue: new Date("1999-01-01").getTime(),
  }),
  p(z.string().optional().default("foo"), {
    type: "string",
    isOptional: true,
    defaultValue: "foo",
  }),

  p(z.number().default(42), { type: "number", defaultValue: 42 }),

  p(z.number().min(23).max(42).multipleOf(5), {
    type: "number",
    min: 23,
    minInclusive: true,
    max: 42,
    maxInclusive: true,
    multipleOf: 5,
  }),

  p(z.number().gt(14).lt(20), {
    type: "number",
    min: 14,
    max: 20,
  }),

  p(z.number().gte(14).lte(20), {
    type: "number",
    min: 14,
    minInclusive: true,
    max: 20,
    maxInclusive: true,
  }),

  p(z.number().positive(), {
    type: "number",
    min: 0,
  }),

  p(z.number().negative(), {
    type: "number",
    max: 0,
  }),

  p(z.number().nonnegative(), {
    type: "number",
    min: 0,
    minInclusive: true,
  }),

  p(z.number().nonpositive(), {
    type: "number",
    max: 0,
    maxInclusive: true,
  }),

  p(z.int(), {
    type: "number",
    format: "safeint",
  }),

  p(z.int32(), {
    type: "number",
    format: "int32",
  }),

  p(z.uint64(), {
    type: "bigInt",
    format: "uint64",
  }),

  p(z.bigint().min(BigInt(23)).max(BigInt(42)).multipleOf(BigInt(5)), {
    type: "bigInt",
    min: "23",
    minInclusive: true,
    max: "42",
    maxInclusive: true,
    multipleOf: "5",
  } as any),

  p(z.bigint().gt(14n).lt(20n), {
    type: "bigInt",
    min: "14",
    max: "20",
  }),

  p(z.bigint().gte(14n).lte(20n), {
    type: "bigInt",
    min: "14",
    minInclusive: true,
    max: "20",
    maxInclusive: true,
  }),

  p(z.bigint().positive(), {
    type: "bigInt",
    min: "0",
  }),

  p(z.bigint().negative(), {
    type: "bigInt",
    max: "0",
  }),

  p(z.bigint().nonnegative(), {
    type: "bigInt",
    min: "0",
    minInclusive: true,
  }),

  p(z.bigint().nonpositive(), {
    type: "bigInt",
    max: "0",
    maxInclusive: true,
  }),

  p(z.date().min(new Date("1999-01-01")).max(new Date("2001-12-31")), {
    type: "date",
    min: 915148800000,
    max: 1009756800000,
    // maxInclusive: true,
    // minInclusive: true
  }),

  p(z.object({ foo: z.string() }), {
    type: "object",
    properties: { foo: { type: "string" } },
  }),

  p(z.object({}).readonly(), {
    type: "object",
    readonly: true,
    properties: {},
  }),

  p(z.literal("Gregor"), { type: "literal", values: ["Gregor"] }),

  p(z.literal(["Gregor", "Brett"]), {
    type: "literal",
    values: ["Gregor", "Brett"],
  }),

  p(z.symbol(), { type: "symbol" }),

  p(z.array(z.number()), {
    type: "array",
    element: { type: "number" },
  }),

  p(z.array(z.number()).min(3).max(10), {
    type: "array",
    element: { type: "number" },
    minLength: 3,
    maxLength: 10,
  }),

  p(z.array(z.number()).length(10), {
    type: "array",
    element: { type: "number" },
    minLength: 10,
    maxLength: 10,
  }),

  p(z.union([z.string(), z.number()]), {
    type: "union",
    options: [{ type: "string" }, { type: "number" }],
  }),

  p(z.intersection(z.string(), z.number()), {
    type: "intersection",
    left: { type: "string" },
    right: { type: "number" },
  }),

  p(z.tuple([z.string(), z.number()]), {
    type: "tuple",
    items: [{ type: "string" }, { type: "number" }],
  }),

  p(z.tuple([z.string(), z.number()]).rest(z.bigint()), {
    type: "tuple",
    items: [{ type: "string" }, { type: "number" }],
    rest: {
      type: "bigInt",
    },
  }),

  p(z.set(z.string()), { type: "set", value: { type: "string" } }),

  p(z.set(z.string()).min(5).max(10), {
    type: "set",
    value: { type: "string" },
    minSize: 5,
    maxSize: 10,
  }),

  p(z.set(z.string()).size(5), {
    type: "set",
    value: { type: "string" },
    minSize: 5,
    maxSize: 5,
  }),

  p(z.record(z.string(), z.literal(42)), {
    type: "record",
    key: { type: "string" },
    value: { type: "literal", values: [42] },
  }),
  p(
    z.xor([
      z.object({ type: z.literal("user"), name: z.string() }),
      z.object({ type: z.literal("admin"), role: z.string() }),
    ]),
    {
      type: "xor",
      options: [
        {
          type: "object",
          properties: {
            type: {
              type: "literal",
              values: ["user"],
            },
            name: {
              type: "string",
            },
          },
        },
        {
          type: "object",
          properties: {
            type: {
              type: "literal",
              values: ["admin"],
            },
            role: {
              type: "string",
            },
          },
        },
      ],
    },
  ),
  p(z.looseRecord(z.string(), z.number()), {
    type: "looseRecord",
    key: {
      type: "string",
    },
    value: {
      type: "number",
    },
  }),
  p(z.map(z.number(), z.string()), {
    type: "map",
    key: { type: "number" },
    value: { type: "string" },
  }),
  p(z.map(z.object(), z.string()), {
    type: "map",
    key: { type: "object", properties: {} },
    value: { type: "string" },
  }),
  p(z.map(z.number(), z.string()).size(10), {
    type: "map",
    key: { type: "number" },
    value: { type: "string" },
    min: 10,
    max: 10,
  }),
  p(z.map(z.number(), z.string()).min(5).max(7), {
    type: "map",
    key: { type: "number" },
    value: { type: "string" },
    min: 5,
    max: 7,
  }),
  p(z.map(z.number(), z.string()).nonempty(), {
    type: "map",
    key: { type: "number" },
    value: { type: "string" },
    min: 1,
  }),

  p(z.enum(["foo", "bar"]), {
    type: "enum",
    values: {
      foo: "foo",
      bar: "bar",
    },
  } as SzEnum),

  p(z.union([z.string(), z.number()]), {
    type: "union",
    options: [{ type: "string" }, { type: "number" }],
  }),
  p(z.intersection(z.string(), z.number()), {
    type: "intersection",
    left: { type: "string" },
    right: { type: "number" },
  }),

  p(
    z.strictObject({
      a: z.string(),
    }),
    {
      type: "object",
      catchall: {
        type: "never",
      },
      properties: {
        a: {
          type: "string",
        },
      },
    },
  ),

  p(
    z.looseObject({
      a: z.string(),
    }),
    {
      type: "object",
      catchall: {
        type: "unknown",
      },
      properties: {
        a: {
          type: "string",
        },
      },
    },
  ),

  p(z.promise(z.string()), { type: "promise", value: { type: "string" } }),

  p(
    z.lazy(() => z.string().refine(() => true)),
    { type: "string" },
  ),

  p(z.number().catch(23).pipe(z.literal(42)), {
    type: "literal",
    values: [42],
  }),
] as const)("zerialize %#", (schema, shape) => {
  const zer = zerialize(schema);
  expect(zer).toEqual(shape);
  const dezer = dezerialize(shape) as any;
  const rezer = zerialize(dezer);
  expect(rezer).toEqual(zerialize(schema));
  const parsed = zodexySchema.safeParse(shape);
  if (!parsed.success) {
    console.log(parsed);
  }
  expect(parsed.success).to.equal(true);
});

test.each([
  p(z.string(), { type: "string", isOptional: false }),
  p(z.string(), { type: "string", isNullable: false }),
  p(z.object({}), {
    type: "object",
    readonly: false,
    properties: {},
  }),
])("isOptional/isNullable/readonly", (schema, shape) => {
  expect(zerialize(dezerialize(shape) as any)).toEqual(zerialize(schema));
  const parsed = zodexySchema.safeParse(shape);
  expect(parsed.success).to.equal(true);
});

test("custom errors", () => {
  const errors = {
    someKey: () => {
      return "Bad value";
    },
  };
  const schema = z.string({ error: errors.someKey });

  const expectedShape = {
    type: "string",
    error: {
      key: "someKey",
    },
  };

  const shape = zerialize(schema, { errors });
  expect(shape).toEqual(expectedShape);

  const dezSchema = dezerialize(shape, { errors });

  const dezParsed = dezSchema.safeParse(3);
  expect(dezParsed.success).to.equal(false);
  expect(dezParsed?.error?.issues[0].message).to.equal("Bad value");

  const reserialized = zerialize(dezSchema, { errors });
  expect(reserialized).toEqual(expectedShape);

  const parsed = zodexySchema.safeParse(expectedShape);
  expect(parsed.success).to.equal(true);
});

test("custom checks and errors on all supported types", () => {
  const errors = {
    customError: () => "Bad value",
  };
  const checks = {
    customCheck: (_ctx: z.core.ParsePayload<unknown>) => {},
  };
  const options = { checks, errors };
  const customCheck = checks.customCheck;
  const customError = errors.customError;

  const cases: [ZodTypes, SzType][] = [
    [z.boolean({ error: customError }).check(customCheck), { type: "boolean" }],
    [z.nan({ error: customError }).check(customCheck), { type: "nan" }],
    [
      z.undefined({ error: customError }).check(customCheck),
      { type: "undefined" },
    ],
    [z.null({ error: customError }).check(customCheck), { type: "null" }],
    [z.never({ error: customError }).check(customCheck), { type: "never" }],
    [z.void({ error: customError }).check(customCheck), { type: "void" }],
    [z.symbol({ error: customError }).check(customCheck), { type: "symbol" }],
    [
      z.literal("value", { error: customError }).check(customCheck),
      { type: "literal", values: ["value"] },
    ],
    [
      z.templateLiteral(["value"], { error: customError }).check(customCheck),
      { type: "templateLiteral", parts: ["value"] },
    ],
    [
      z.enum(["value"], { error: customError }).check(customCheck),
      { type: "enum", values: { value: "value" } },
    ],
  ];

  for (const [schema, baseShape] of cases) {
    const expectedShape = {
      ...baseShape,
      checks: [{ name: "customCheck" }],
      error: { key: "customError" },
    } as SzType;
    const shape = zerialize(schema, options);
    expect(shape).toEqual(expectedShape);
    expect(zerialize(dezerialize(shape, options), options)).toEqual(
      expectedShape,
    );
  }
});

test("custom checks on supported special types", () => {
  const checks = {
    customCheck: (_ctx: z.core.ParsePayload<unknown>) => {},
  };
  const transforms = {
    identity: (ctx: z.core.ParsePayload) => ctx.value,
  };
  const codecs = {
    identity: {
      decode: (value: string) => value,
      encode: (value: string) => value,
    },
  };
  const instances = { Date };
  const errors = { customError: () => "Bad value" };
  const options = { checks, transforms, codecs, instances, errors };
  const customCheck = checks.customCheck;

  const cases: [ZodTypes, SzType][] = [
    [
      z.promise(z.string()).check(customCheck),
      { type: "promise", value: { type: "string" } },
    ],
    [
      z.string().catch("").check(customCheck),
      { type: "catch", value: "", innerType: { type: "string" } },
    ],
    [
      z.transform(transforms.identity).check(customCheck),
      { type: "transform", name: "identity" },
    ],
    [
      z.codec(z.string(), z.string(), codecs.identity).check(customCheck),
      {
        type: "codec",
        name: "identity",
        input: { type: "string" },
        output: { type: "string" },
      },
    ],
  ];

  for (const [schema, baseShape] of cases) {
    const expectedShape = {
      ...baseShape,
      checks: [{ name: "customCheck" }],
    } as SzType;
    const shape = zerialize(schema, options);
    expect(shape).toEqual(expectedShape);
    expect(zerialize(dezerialize(shape, options), options)).toEqual(
      expectedShape,
    );
  }

  const instanceShape = {
    type: "instanceof",
    name: "Date",
    error: { key: "customError" },
  } as const;
  const instanceSchema = z.instanceof(Date, { error: errors.customError });
  expect(zerialize(instanceSchema, options)).toEqual(instanceShape);
  expect(zerialize(dezerialize(instanceShape, options), options)).toEqual(
    instanceShape,
  );
});

test("discriminated union", () => {
  const schema = z
    .discriminatedUnion("name", [
      z.object({ name: z.literal("Gregor"), age: z.number().optional() }),
      z.object({ name: z.literal("Lea"), reach: z.number() }),
    ])
    .default({ name: "Lea", reach: 42 });

  const shape = zerialize(schema);

  // type InfType = z.infer<Dezerialize<typeof shape>>;
  // ({}) as InfType satisfies
  //   | { name: "Gregor"; age?: number }
  //   | { name: "Lea"; reach: number };

  // ({ name: "Gregor" }) satisfies InfType;

  expect(shape).toEqual({
    type: "discriminatedUnion",
    discriminator: "name",
    options: [
      {
        type: "object",
        properties: {
          name: { type: "literal", values: ["Gregor"] },
          age: { type: "number", isOptional: true },
        },
      },
      {
        type: "object",
        properties: {
          name: { type: "literal", values: ["Lea"] },
          reach: { type: "number" },
        },
      },
    ],
    defaultValue: { name: "Lea", reach: 42 },
  });

  // expectTypeOf(shape).toMatchTypeOf<{
  //   type: "discriminatedUnion";
  //   discriminator: "name";
  //   options: [
  //     {
  //       type: "object";
  //       properties: {
  //         name: { type: "literal"; values: ["Gregor"] };
  //         age: { type: "number"; isOptional: true };
  //       };
  //     },
  //     {
  //       type: "object";
  //       properties: {
  //         name: { type: "literal"; values: ["Lea"] };
  //         reach: { type: "number" };
  //       };
  //     }
  //   ];
  // }>();

  expect(
    (dezerialize(shape as SzType) as z.ZodDefault<any>).def.defaultValue,
  ).toEqual({
    name: "Lea",
    reach: 42,
  });

  const parsed = zodexySchema.safeParse(shape);
  expect(parsed.success).to.equal(true);
});

// Can't seem to detect type to implement stringbool
// test("stringbool", () => {
//   const schema = z.stringbool();
//   expect(schema.parse("yes")).toEqual(true);
//   const shape = zerialize(schema);
//   expect(shape).toEqual({
//     type: "boolean"
//   });
//   expect(dezerialize(shape as SzType).parse("yes")).toEqual(true);

//   const parsed = zodexySchema.safeParse(shape);
//   expect(parsed.success).to.equal(true);
// });

test("coerce (number)", () => {
  const schema = z.coerce.number();
  expect(schema.parse("42")).toEqual(42);
  const shape = zerialize(schema);
  expect(shape).toEqual({
    type: "number",
    coerce: true,
  });
  expect(dezerialize(shape as SzType).parse("42")).toEqual(42);

  const parsed = zodexySchema.safeParse(shape);
  expect(parsed.success).to.equal(true);
});

test("coerce (bigint)", () => {
  const schema = z.coerce.bigint();
  expect(schema.parse("42")).toEqual(42n);
  const shape = zerialize(schema);
  expect(shape).toEqual({
    type: "bigInt",
    coerce: true,
  });
  expect(dezerialize(shape as SzType).parse("42")).toEqual(42n);

  const parsed = zodexySchema.safeParse(shape);
  expect(parsed.success).to.equal(true);
});

test("coerce (date)", () => {
  const schema = z.coerce.date();
  expect(schema.parse("1999-01-01")).toEqual(new Date("1999-01-01"));
  const shape = zerialize(schema);
  expect(shape).toEqual({
    type: "date",
    coerce: true,
  });
  expect(dezerialize(shape as SzType).parse("1999-01-01")).toEqual(
    new Date("1999-01-01"),
  );
  const parsed = zodexySchema.safeParse(shape);
  expect(parsed.success).to.equal(true);
});

test("coerce (string)", () => {
  const schema = z.coerce.string();
  expect(schema.parse(42)).toEqual("42");
  const shape = zerialize(schema);
  expect(shape).toEqual({
    type: "string",
    coerce: true,
  });
  expect(dezerialize(shape as SzType).parse(42)).toEqual("42");

  const parsed = zodexySchema.safeParse(shape);
  expect(parsed.success).to.equal(true);
});

test("coerce (boolean)", () => {
  const schema = z.coerce.boolean();
  expect(schema.parse(0)).toEqual(false);
  const shape = zerialize(schema);
  expect(shape).toEqual({
    type: "boolean",
    coerce: true,
  });
  expect(dezerialize(shape as SzType).parse(0)).toEqual(false);
  const parsed = zodexySchema.safeParse(shape);
  expect(parsed.success).to.equal(true);
});

test("codecs", () => {
  const isoDate = {
    decode: (value: string) => new Date(value),
    encode: (value: Date) => value.toISOString(),
  };
  const codecs = { isoDate };
  const schema = z.codec(z.iso.datetime(), z.date(), isoDate);
  const expectedShape = {
    type: "codec",
    name: "isoDate",
    input: { type: "string", kind: "datetime" },
    output: { type: "date" },
  } as const;

  const serialized = zerialize(schema, { codecs });
  expect(serialized).toEqual(expectedShape);

  const restored = dezerialize(serialized, { codecs });
  const value = "2024-01-15T10:30:00.000Z";
  expect(z.decode(restored, value)).toEqual(new Date(value));
  expect(z.encode(restored, new Date(value))).toBe(value);
  expect(zerialize(restored, { codecs })).toEqual(expectedShape);
  expect(zodexySchema.safeParse(expectedShape).success).toBe(true);

  expect(() => zerialize(schema)).toThrow(
    "Codec must be registered before it can be serialized",
  );
  expect(() => dezerialize(expectedShape)).toThrow(
    "Must supply a codec for the given codec name, isoDate",
  );
});

test("instanceof", () => {
  class Example {}
  const instances = { Example };
  const schema = z.instanceof(Example);
  const expectedShape = {
    type: "instanceof",
    name: "Example",
  } as const;

  const serialized = zerialize(schema, { instances });
  expect(serialized).toEqual(expectedShape);

  const restored = dezerialize(serialized, { instances });
  expect(restored.safeParse(new Example()).success).toBe(true);
  expect(restored.safeParse({}).success).toBe(false);
  expect(zerialize(restored, { instances })).toEqual(expectedShape);
  expect(zodexySchema.safeParse(expectedShape).success).toBe(true);

  expect(() => zerialize(schema)).toThrow(
    "Instance constructor must be registered before it can be serialized",
  );
  expect(() => dezerialize(expectedShape)).toThrow(
    "Must supply an instance constructor for the given name, Example",
  );
  expect(() => zerialize(z.custom(() => true))).toThrow(
    "Only instanceof custom schemas can be serialized",
  );
});

test("preprocess", () => {
  const transforms = {
    addFive: (val: any) => val + 5,
    addTwo: (val: any) => val + 2,
  };

  const schema = z.preprocess(transforms.addFive, z.number());

  const expectedShape = {
    inner: {
      type: "transform",
      name: "addFive",
    },
    outer: {
      type: "number",
    },
    type: "pipe",
  };

  const serialized = zerialize(schema, { transforms });
  expect(serialized).toEqual(expectedShape);

  const dezSchema = dezerialize(serialized, { transforms });
  const res1 = dezSchema.safeParse(3);
  expect(res1.data).to.equal(8);

  const parsed = zodexySchema.safeParse(expectedShape);
  expect(parsed.success).to.equal(true);
});

test("bad transform", () => {
  const transforms = {
    addFive: (val: any) => val + 5,
    addTwo: (val: any) => val + 2,
  };

  const schema = z.number().transform(transforms.addFive);

  const expectedShape = {
    inner: {
      type: "number",
    },
    outer: {
      type: "transform",
      name: "addFive",
    },
    type: "pipe",
  };

  const serialized = zerialize(schema, { transforms });
  expect(serialized).toEqual(expectedShape);

  const schema2 = z.number().pipe(z.transform(transforms.addFive));

  const serialized2 = zerialize(schema2, { transforms });
  expect(serialized2).toEqual(expectedShape);

  expect(() => {
    dezerialize(serialized);
  }).to.throw();
});

test("transforms", () => {
  const transforms = {
    addFive: (val: any) => val + 5,
    addTwo: (val: any) => val + 2,
  };

  const schema = z.number().transform(transforms.addFive);

  const expectedShape = {
    inner: {
      type: "number",
    },
    outer: {
      type: "transform",
      name: "addFive",
    },
    type: "pipe",
  };

  const serialized = zerialize(schema, { transforms });
  expect(serialized).toEqual(expectedShape);

  const schema2 = z.number().pipe(z.transform(transforms.addFive));

  const serialized2 = zerialize(schema2, { transforms });
  expect(serialized2).toEqual(expectedShape);

  const dezSchema = dezerialize(serialized, { transforms });
  const res1 = dezSchema.safeParse(3);
  expect(res1.data).to.equal(8);

  const schema3 = z
    .number()
    .transform(transforms.addFive)
    .transform(transforms.addTwo);

  const expectedShape3 = {
    inner: {
      inner: {
        type: "number",
      },
      outer: {
        type: "transform",
        name: "addFive",
      },
      type: "pipe",
    },
    outer: {
      type: "transform",
      name: "addTwo",
    },
    type: "pipe",
  };

  const serialized3 = zerialize(schema3, { transforms });
  expect(serialized3).toEqual(expectedShape3);

  const dezSchema3 = dezerialize(serialized3, { transforms });
  const res3 = dezSchema3.safeParse(3);
  expect(res3.data).to.equal(10);

  const parsed = zodexySchema.safeParse(expectedShape);
  expect(parsed.success).to.equal(true);
});

test("named checks and transforms", () => {
  const checks = {
    "not in future": (ctx: z.core.ParsePayload<Date>) => {
      if (ctx.value > new Date()) {
        ctx.issues.push({
          code: "too_big",
          origin: "date",
          maximum: new Date().getTime(),
          message: "Not into the future",
          inclusive: false,
          type: "date",
          input: ctx.value,
        });
      }
    },
    "far too old": (ctx: z.core.ParsePayload<Date>) => {
      if (ctx.value < new Date("1970-01-01")) {
        ctx.issues.push({
          code: "too_small",
          origin: "date",
          minimum: new Date("1970-01-01").getTime(),
          message: "Too old",
          inclusive: false,
          type: "date",
          input: ctx.value,
        });
      }
    },
    "far too young": (ctx: z.core.ParsePayload<Date>) => {
      if (ctx.value > new Date("2030-01-01")) {
        ctx.issues.push({
          code: "too_big",
          origin: "date",
          maximum: new Date("2030-01-01").getTime(),
          message: "Too young",
          inclusive: false,
          type: "date",
          input: ctx.value,
        });
      }
    },
    /* c8 ignore next -- Unused */
    BCE: (arg: Date) => arg < new Date("0001-01-01"),
  };

  const transforms = {
    earlier: (val: any) => new Date(new Date().getTime() - 60000),
  };

  const schema = z
    .date()
    .check(checks["not in future"])
    .refine(checks["BCE"]) // Ignored by our serialization
    .check(checks["far too old"])
    .transform(transforms.earlier)
    .check(checks["far too young"]);

  const expectedShape = {
    checks: [{ name: "far too young" }],
    inner: {
      checks: [{ name: "not in future" }, { name: "far too old" }],
      type: "date",
    },
    outer: {
      name: "earlier",
      type: "transform",
    },
    type: "pipe",
  };

  // @ts-expect-error BCE arg is deliberately bad
  const serialized = zerialize(schema, { checks, transforms });
  expect(serialized).toEqual(expectedShape);

  // @ts-expect-error BCE arg is deliberately bad
  const dezSchema = dezerialize(serialized, { checks, transforms });
  const res1 = dezSchema.safeParse(
    new Date(new Date().getTime() + 10000000),
  ) as z.ZodSafeParseError<Date>;

  expect(res1.success).to.equal(false);

  const res2 = dezSchema.safeParse(
    new Date("1969-01-01"),
  ) as z.ZodSafeParseError<Date>;

  expect(res2.success).to.equal(false);

  const res3 = dezSchema.safeParse(
    new Date("2050-01-01"),
  ) as z.ZodSafeParseError<Date>;

  expect(res3.success).to.equal(false);

  const res4 = dezSchema.safeParse(new Date()) as z.ZodSafeParseSuccess<Date>;

  expect(res4.success).to.equal(true);
  // Will be transformed down
  expect(res4.data.getTime()).toBeLessThan(new Date().getTime());

  const parsed = zodexySchema.safeParse(expectedShape);
  expect(parsed.success).to.equal(true);
});

test("dezerialize checks without options", () => {
  const checks = {
    /* c8 ignore next 11 -- Unused */
    "not in future": (ctx: z.core.ParsePayload<Date>) => {
      if (ctx.value > new Date()) {
        ctx.issues.push({
          code: "too_big",
          origin: "date",
          maximum: new Date().getTime(),
          message: "Not into the future",
          inclusive: false,
          type: "date",
          input: ctx.value,
        });
      }
    },
  };
  const schema = z.date().check(checks["not in future"]);

  const expectedShape = {
    checks: [{ name: "not in future" }],
    type: "date",
  };

  const serialized = zerialize(schema, { checks });
  expect(serialized).toEqual(expectedShape);

  const dezSchema = dezerialize(serialized);

  const res1 = dezSchema.safeParse(
    new Date(new Date().getTime() + 10000000),
  ) as z.ZodSafeParseSuccess<Date>;

  expect(res1.success).to.equal(true);

  const parsed = zodexySchema.safeParse(expectedShape);
  expect(parsed.success).to.equal(true);
});

test("describe", () => {
  const myRegistry = z.registry<{ description: string }>();

  const schema = z.date();

  myRegistry.add(schema, { description: "Some description" });

  const expectedShape = {
    description: "Some description",
  };

  const serialized = myRegistry.get(schema);
  expect(serialized).toEqual(expectedShape);
});

test("recursive schemas (nested)", () => {
  const baseCategorySchema = z.object({
    name: z.string(),
  });

  const categorySchema: any = baseCategorySchema.extend({
    subcategories: z.lazy(() => categorySchema.array()),
  });

  const mainCategorySchema = z.object({
    nested: z.object({
      deeplyNested: categorySchema,
    }),
  });

  const expectedShape = {
    type: "object",
    properties: {
      nested: {
        type: "object",
        properties: {
          deeplyNested: {
            properties: {
              name: {
                type: "string",
              },
              subcategories: {
                type: "array",
                element: {
                  $ref: "#/properties/nested/properties/deeplyNested",
                },
              },
            },
            type: "object",
          },
        },
      },
    },
  };

  const serialized = zerialize(mainCategorySchema);
  expect(serialized).toEqual(expectedShape);

  const dezSchema = dezerialize(serialized);

  const reserialized = zerialize(dezSchema as any);
  expect(reserialized).toEqual(expectedShape);

  const parsed = zodexySchema.safeParse(expectedShape);
  expect(parsed.success).to.equal(true);
});

test("recursive schemas", () => {
  const baseCategorySchema = z.object({
    name: z.string(),
  });

  // type Category = z.infer<typeof baseCategorySchema> & {
  //   subcategories: Category[];
  // };

  const categorySchema: any /* : z.ZodType<Category> */ =
    baseCategorySchema.extend({
      subcategories: z.lazy(() => categorySchema.array()),
    });

  // categorySchema.parse({
  //   name: "People",
  //   subcategories: [
  //     {
  //       name: "Politicians",
  //       subcategories: [
  //         {
  //           name: "Presidents",
  //           subcategories: [],
  //         },
  //       ],
  //     },
  //   ],
  // }); // passes

  const expectedShape = {
    type: "object",
    properties: {
      name: {
        type: "string",
      },
      subcategories: {
        type: "array",
        element: {
          $ref: "#",
        },
      },
    },
  };

  const serialized = zerialize(categorySchema);
  expect(serialized).toEqual(expectedShape);

  const dezSchema = dezerialize(serialized);
  const reserialized = zerialize(dezSchema as any);
  expect(reserialized).toEqual(expectedShape);

  const parsed = zodexySchema.safeParse(expectedShape);
  expect(parsed.success).to.equal(true);
});

test("recursive tuple schema", () => {
  const schema = z.tuple([
    z.string(),
    z.number(),
    z.tuple([z.string()]).rest(categorySchemaNested),
  ]);

  const expectedShape = {
    items: [
      {
        type: "string",
      },
      {
        type: "number",
      },
      {
        type: "tuple",
        items: [
          {
            type: "string",
          },
        ],
        rest: {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
            subcategory: {
              $ref: "#/items/2/rest",
            },
          },
        },
      },
    ],
    type: "tuple",
  };

  const serialized = zerialize(schema);
  expect(serialized).toEqual(expectedShape);

  const dezSchema = dezerialize(serialized);
  const reserialized = zerialize(dezSchema as any);
  expect(reserialized).toEqual(expectedShape);

  const parsed = zodexySchema.safeParse(expectedShape);
  expect(parsed.success).to.equal(true);
});

test("Object with inner $ref", () => {
  const schema = z.promise(z.array(categorySchemaNested));
  const shape = {
    type: "promise",
    value: {
      type: "array",
      element: {
        properties: {
          name: {
            type: "string",
          },
          subcategory: {
            $ref: "#/value/element",
          },
        },
        type: "object",
      },
    },
  };

  const zer = zerialize(schema);
  expect(zer).toEqual(shape);
  expect(zerialize(dezerialize(shape as any) as any)).toEqual(
    zerialize(schema),
  );
  const parsed = zodexySchema.safeParse(shape);
  expect(parsed.success).to.equal(true);
});

test("Large object with inner $ref", () => {
  const schema = z.tuple([
    z.string(),
    z.number(),
    z.tuple([z.string()]).rest(
      z.set(
        z.record(
          z.string(),
          z.record(
            z.string(),
            z.map(
              z.string(),
              z.map(
                z.string(),
                z.union([
                  z.string(),
                  z.discriminatedUnion("status", [
                    z.object({
                      status: z.literal("success"),
                      data: z.string(),
                    }),
                    z.object({
                      status: z.literal("failed"),
                      name: z.intersection(
                        z.object({}),
                        z.intersection(
                          z.promise(categorySchemaNested),
                          z.object({}),
                        ),
                      ),
                    }),
                  ]),
                  z.number(),
                ]),
              ),
            ),
          ),
        ),
      ),
    ),
  ]);
  const shape = {
    items: [
      {
        type: "string",
      },
      {
        type: "number",
      },
      {
        items: [
          {
            type: "string",
          },
        ],
        rest: {
          type: "set",
          value: {
            value: {
              key: {
                type: "string",
              },
              type: "record",
              value: {
                value: {
                  key: {
                    type: "string",
                  },
                  type: "map",
                  value: {
                    options: [
                      {
                        type: "string",
                      },
                      {
                        discriminator: "status",
                        options: [
                          {
                            properties: {
                              data: {
                                type: "string",
                              },
                              status: {
                                type: "literal",
                                values: ["success"],
                              },
                            },
                            type: "object",
                          },
                          {
                            properties: {
                              name: {
                                left: {
                                  properties: {},
                                  type: "object",
                                },
                                right: {
                                  left: {
                                    type: "promise",
                                    value: {
                                      properties: {
                                        name: {
                                          type: "string",
                                        },
                                        subcategory: {
                                          $ref: "#/items/2/rest/value/value/value/value/value/options/1/options/1/properties/name/right/left/value",
                                        },
                                      },
                                      type: "object",
                                    },
                                  },
                                  right: {
                                    properties: {},
                                    type: "object",
                                  },
                                  type: "intersection",
                                },
                                type: "intersection",
                              },
                              status: {
                                type: "literal",
                                values: ["failed"],
                              },
                            },
                            type: "object",
                          },
                        ],
                        type: "discriminatedUnion",
                      },
                      {
                        type: "number",
                      },
                    ],
                    type: "union",
                  },
                },
                type: "map",
                key: {
                  type: "string",
                },
              },
            },
            type: "record",
            key: {
              type: "string",
            },
          },
        },
        type: "tuple",
      },
    ],
    type: "tuple",
  };
  const zer = zerialize(schema);
  expect(zer).toEqual(shape);
  expect(zerialize(dezerialize(shape as any) as any)).toEqual(
    zerialize(schema),
  );
  const parsed = zodexySchema.safeParse(shape);
  expect(parsed.success).to.equal(true);
});

test("Nested recursion", () => {
  const recursiveSchema: z.ZodType<any> = z.lazy(() =>
    z.object({
      id: idSchema.optional(),
      test: idSchema.optional(),
      file: idSchema.optional(),
      file2: idSchema.optional(),
      profileContact: idSchema.optional(),
      and: z.array(recursiveSchema).optional(),
      or: z.array(recursiveSchema).optional(),
    }),
  );

  const idSchema = z
    .object({
      isNull: z.coerce.boolean().optional(),
      isNotNull: z.coerce.boolean().optional(),
      eq: z.coerce.string().optional(),
      ne: z.coerce.string().optional(),
      gt: z.coerce.string().optional(),
      gte: z.coerce.string().optional(),
      lt: z.coerce.string().optional(),
      lte: z.coerce.string().optional(),
      like: z.coerce.string().optional(),
      notLike: z.coerce.string().optional(),
      ilike: z.coerce.string().optional(),
      notIlike: z.coerce.string().optional(),
      between: z
        .object({
          lower: z.coerce.string(),
          upper: z.coerce.string(),
        })
        .optional(),
      notBetween: z
        .object({
          lower: z.coerce.string(),
          upper: z.coerce.string(),
        })
        .optional(),
    })
    .optional()
    .meta({ description: '{"json":{"type":"string"}}' });

  const orderBySchema: any = z.object({
    id: z
      .object({
        isAsc: z.coerce.boolean().optional(),
        isDesc: z.coerce.boolean().optional(),
      })
      .optional(),
    test: z.lazy(() => orderBySchema.shape.id).optional(),
    file: z.lazy(() => orderBySchema.shape.id).optional(),
    file2: z.lazy(() => orderBySchema.shape.id).optional(),
    profileContact: z.lazy(() => orderBySchema.shape.id).optional(),
  });

  const mainSchema = z.object({
    limit: z.coerce.number().optional(),
    offset: z.coerce.number().optional(),
    orderBy: z.array(orderBySchema).optional(),
    id: idSchema,
    test: idSchema,
    file: idSchema,
    file2: idSchema,
    profileContact: idSchema,
    and: z.array(recursiveSchema).optional(),
    or: z.array(recursiveSchema).optional(),
  });

  const expectedShape = {
    type: "object",
    properties: {
      limit: {
        type: "number",
        coerce: true,
        isOptional: true,
      },
      offset: {
        type: "number",
        coerce: true,
        isOptional: true,
      },
      orderBy: {
        type: "array",
        element: {
          type: "object",
          properties: {
            id: {
              type: "object",
              properties: {
                isAsc: {
                  type: "boolean",
                  coerce: true,
                  isOptional: true,
                },
                isDesc: {
                  type: "boolean",
                  coerce: true,
                  isOptional: true,
                },
              },
              isOptional: true,
            },
            test: {
              type: "union",
              options: [
                {
                  $ref: "#/properties/orderBy/element/properties/id",
                },
              ],
              isOptional: true,
            },
            file: {
              type: "union",
              options: [
                {
                  $ref: "#/properties/orderBy/element/properties/id",
                },
              ],
              isOptional: true,
            },
            file2: {
              type: "union",
              options: [
                {
                  $ref: "#/properties/orderBy/element/properties/id",
                },
              ],
              isOptional: true,
            },
            profileContact: {
              type: "union",
              options: [
                {
                  $ref: "#/properties/orderBy/element/properties/id",
                },
              ],
              isOptional: true,
            },
          },
        },
        isOptional: true,
      },
      id: {
        type: "object",
        properties: {
          isNull: {
            type: "boolean",
            coerce: true,
            isOptional: true,
          },
          isNotNull: {
            type: "boolean",
            coerce: true,
            isOptional: true,
          },
          eq: {
            type: "string",
            coerce: true,
            isOptional: true,
          },
          ne: {
            type: "string",
            coerce: true,
            isOptional: true,
          },
          gt: {
            type: "string",
            coerce: true,
            isOptional: true,
          },
          gte: {
            type: "string",
            coerce: true,
            isOptional: true,
          },
          lt: {
            type: "string",
            coerce: true,
            isOptional: true,
          },
          lte: {
            type: "string",
            coerce: true,
            isOptional: true,
          },
          like: {
            type: "string",
            coerce: true,
            isOptional: true,
          },
          notLike: {
            type: "string",
            coerce: true,
            isOptional: true,
          },
          ilike: {
            type: "string",
            coerce: true,
            isOptional: true,
          },
          notIlike: {
            type: "string",
            coerce: true,
            isOptional: true,
          },
          between: {
            type: "object",
            properties: {
              lower: {
                type: "string",
                coerce: true,
              },
              upper: {
                type: "string",
                coerce: true,
              },
            },
            isOptional: true,
          },
          notBetween: {
            type: "object",
            properties: {
              lower: {
                type: "string",
                coerce: true,
              },
              upper: {
                type: "string",
                coerce: true,
              },
            },
            isOptional: true,
          },
        },
        isOptional: true,
        description: '{"json":{"type":"string"}}',
      },
      test: {
        $ref: "#/properties/id",
      },
      file: {
        $ref: "#/properties/id",
      },
      file2: {
        $ref: "#/properties/id",
      },
      profileContact: {
        $ref: "#/properties/id",
      },
      and: {
        type: "array",
        element: {
          type: "object",
          properties: {
            id: {
              type: "union",
              description: '{"json":{"type":"string"}}',
              options: [
                {
                  $ref: "#/properties/id",
                },
              ],
              isOptional: true,
            },
            test: {
              type: "union",
              options: [
                {
                  $ref: "#/properties/id",
                },
              ],
              isOptional: true,
              description: '{"json":{"type":"string"}}',
            },
            file: {
              type: "union",
              options: [
                {
                  $ref: "#/properties/id",
                },
              ],
              isOptional: true,
              description: '{"json":{"type":"string"}}',
            },
            file2: {
              type: "union",
              options: [
                {
                  $ref: "#/properties/id",
                },
              ],
              isOptional: true,
              description: '{"json":{"type":"string"}}',
            },
            profileContact: {
              type: "union",
              options: [
                {
                  $ref: "#/properties/id",
                },
              ],
              isOptional: true,
              description: '{"json":{"type":"string"}}',
            },
            and: {
              type: "array",
              element: {
                $ref: "#/properties/and/element",
              },
              isOptional: true,
            },
            or: {
              type: "array",
              element: {
                $ref: "#/properties/and/element",
              },
              isOptional: true,
            },
          },
        },
        isOptional: true,
      },
      or: {
        type: "array",
        element: {
          $ref: "#/properties/and/element",
        },
        isOptional: true,
      },
    },
  };

  const zer = zerialize(mainSchema);
  console.log(JSON.stringify(zer, null, 2));
  expect(zer).toEqual(expectedShape);
  const dezer = dezerialize(zer);

  // expect(dezer.shape.profileContact._def.getter()._def.typeName).toEqual(z.ZodFirstPartyTypeKind.ZodOptional)
  // expect(dezer.shape.profileContact._def.getter()._def.innerType._def.typeName).toEqual(z.ZodFirstPartyTypeKind.ZodObject)
  // expect(dezer.shape.profileContact._def.getter().isOptional()).to.be.true;

  // const rezer = zerialize(dezer as any);
  // expect(rezer).toEqual(expectedShape);
});

test("zod 4 recursion", () => {
  const Category = z.object({
    name: z.string(),
    get subcategories() {
      return z.array(Category);
    },
  });
  const expectedShape = {
    type: "object",
    properties: {
      name: {
        type: "string",
      },
      subcategories: {
        type: "array",
        element: {
          $ref: "#",
        },
      },
    },
  };
  const zer = zerialize(Category);
  // console.log(JSON.stringify(zer, null, 2));
  expect(zer).toEqual(expectedShape);
  dezerialize(zer);

  const User = z.object({
    email: z.email(),
    get posts() {
      return z.array(Post);
    },
  });

  const Post = z.object({
    title: z.string(),
    get author() {
      return User;
    },
  });

  const expectedShape2 = {
    properties: {
      author: {
        properties: {
          email: {
            kind: "email",
            type: "string",
          },
          posts: {
            element: {
              $ref: "#",
            },
            type: "array",
          },
        },
        type: "object",
      },
      title: {
        type: "string",
      },
    },
    type: "object",
  };

  const zer2 = zerialize(Post);
  // console.log(JSON.stringify(zer, null, 2));
  expect(zer2).toEqual(expectedShape2);
  dezerialize(zer);
});

test("catch", () => {
  const schema = z.number().catch(42);

  const expectedShape = {
    type: "catch",
    value: 42,
    innerType: {
      type: "number",
    },
  };

  const serialized = zerialize(schema as any);
  expect(serialized).toEqual(expectedShape);

  const dezSchema = dezerialize(serialized);
  const rezer = zerialize(dezSchema as any);
  expect(rezer).toEqual(expectedShape);

  const parsed = zodexySchema.safeParse(expectedShape);
  expect(parsed.success).to.equal(true);
});

test("catch (object)", () => {
  const schema = z.object({}).catch({
    // @ts-expect-error Zod bug?
    abc: true,
  });

  const expectedShape = {
    type: "catch",
    value: {
      abc: true,
    },
    innerType: {
      type: "object",
      properties: {},
    },
  };

  const serialized = zerialize(schema as any);
  expect(serialized).toEqual(expectedShape);

  const dezSchema = dezerialize(serialized);
  const rezer = zerialize(dezSchema as any);
  expect(rezer).toEqual(expectedShape);

  const parsed = zodexySchema.safeParse(expectedShape);
  expect(parsed.success).to.equal(true);
});

test("catch (function)", () => {
  const schema = z.number({}).catch(() => {
    return Math.random();
  });

  const expectedShape = {
    type: "catch",
    // value: 12345,
    innerType: {
      type: "number",
    },
  };

  const serialized = zerialize(schema as any) as unknown as SzCatch;
  expect(typeof serialized.value).to.equal("number");
  expect({
    ...serialized,
    value: undefined,
  }).toEqual(expectedShape);

  const dezSchema = dezerialize(serialized);
  const rezer = zerialize(dezSchema as any);
  expect({
    ...rezer,
    value: undefined,
  }).toEqual(expectedShape);

  const parsed = zodexySchema.safeParse({
    ...expectedShape,
    value: undefined,
  });
  expect(parsed.success).to.equal(true);
});

test("applies named checks to any schemas", () => {
  let calls = 0;

  const schema = dezerialize(
    {
      type: "any",
      checks: [{ name: "symbol" }],
    },
    {
      checks: {
        symbol(payload) {
          calls++;

          if (typeof payload.value !== "symbol") {
            payload.issues.push({
              code: "custom",
              input: payload.value,
              message: "Expected a symbol",
            });
          }
        },
      },
    },
  );

  expect(schema.safeParse(Symbol("abc")).success).toBe(true);
  expect(schema.safeParse("abc").success).toBe(false);
  expect(calls).toBe(2);
});
