# Zodexy

**This is a fork of [zodex](https://github.com/commonbaseapp/zodex) updated to work with the latest Zod.**

Type-safe (de)serialization library for [zod](https://zod.dev/) (v4 format). It both serializes and simplifies types into a JSON format, in the following ways:

- optional, nullable and default types are inlined into any given types itself

```json
{ "type": "string", "defaultValue": "hi" }
```

- number checks are also inlined into the type itself

```json
{ "type": "number", "min": 23, "max": 42 }
```

## Installation

```sh
pnpm add zodexy
# or
yarn add zodexy
# or
npm install zodexy
```

## Usage

```ts
import { z } from "zod";
import { zerialize } from "zodexy";

const someZodType = z.discriminatedUnion("id", [
  z.object({ id: z.literal("a"), count: z.number().optional() }),
  z.object({ id: z.literal("b") }),
]);
const shape = zerialize(someZodType);
```

Now `typeof shape` will be

```ts
type Shape = {
  type: "discriminatedUnion";
  discriminator: "id";
  options: [
    {
      type: "object";
      properties: {
        id: { type: "literal"; values: ["a"] };
        count: { type: "number"; isOptional: true };
      };
    },
    { type: "object"; properties: { id: { type: "literal"; values: ["b"] } } },
  ];
};
```

which is exactly equal to its runtime value (shown in YAML for brevity, [you probably shouldn't use YAML](https://ruudvanasseldonk.com/2023/01/11/the-yaml-document-from-hell)):

```yaml
type: "discriminatedUnion"
discriminator: "id"
options:
  - type: "object"
    properties:
      id:
        type: "literal"
        values:
          - "a"
      count:
        type: "number"
        isOptional: true
  - type: "object"
    properties:
      id:
        type: "literal"
        values:
          - "b"
```

## Options

Both `zerialize` and `dezerialize` accept an options object with the
same `errors`, `checks`, `transforms`, `codecs`, and `instances` properties.

Since Zod does not allow the specification of the names of errors, checks and
transforms (and preprocesses), we allow you to supply
as options maps of names to errors/checks/transforms so that these can be part
of serialization and deserialization. If none of these options are
supplied, the errors/checks/transforms will be omitted.

Properties:

- `errors` - Map of name to `.someType({error: fn})` functions
- `checks` - Map of name to `.checks()` functions
- `transforms` - Map of name to `.transform()` (and `.preprocess`) functions
- `codecs` - Map of name to the `{ decode, encode }` functions passed to
  `z.codec()`
- `instances` - Map of name to constructors used to serialize and restore
  `z.instanceof()` schemas

Codec implementations remain consumer-owned and are matched by function
identity during serialization:

```ts
const isoDate = {
  decode: (value: string) => new Date(value),
  encode: (value: Date) => value.toISOString(),
};
const codecs = { isoDate };
const schema = z.codec(z.iso.datetime(), z.date(), isoDate);

const shape = zerialize(schema, { codecs });
const restored = dezerialize(shape, { codecs });
```

The serialized codec contains its registry name and its fully serialized
`input` and `output` schemas. No Zod metadata key is reserved.

Zod exposes the constructor supplied to `z.instanceof()` as
`schema._zod.bag.Class`. Zodexy matches it by identity against `instances`:

```ts
class Example {}

const instances = { Example };
const schema = z.instanceof(Example);
const shape = zerialize(schema, { instances });
const restored = dezerialize(shape, { instances });
```

This serializes as `{ "type": "instanceof", "name": "Example" }`. Ordinary
`z.custom()` predicates remain unsupported because they provide no equivalent
introspectable runtime definition.

## Use of JSON References

JSON references are used to represent local references. If you wish to use
JSON references for remote (non-cyclic) references, you may do so, but you
will need to use a library like
[`json-refs`](https://github.com/whitlockjc/json-refs) (with `resolveRefs`)
to first resolve such references and then supply the object to `dezerialize`.

Zodexy will serialize local references, including handling recursive ones. As
with JSON Schema, the `$defs` property may be a reasonable top-level property
to use as storage for local references, but it receives no special treatment
by this library (any property could be targeted by one's references).

Note that if you wish to use additional properties with an item containing a
reference, e.g., `isOptional`, you will first need to wrap the JSON reference
within a single-item union such as in the following (JSON reference objects may not have other properties):

```json
{
  "type": "union",
  "options": [
    {
      "$ref": "#/properties/id"
    }
  ]
}
```

Note that due to technical limitations with Zod, we are unable to allow a
JSON reference in place of an object `properties` object. You can either
resolve this first with another library (if it is a non-cyclic reference),
or target the whole object or individual properties.

## Caveats

- `brand` is not supportable and omitted
- `lazy` type is unwrapped; `pipe` is unwrapped when no transforms are supplied
- `catch` with a function can have its then-value serialized but it
  cannot then be deserialized back into using the original function
- Due to technical limitations, we cannot support the regular
  `refine()` and `custom()` methods (and they will be
  ignored), but these are really just implementations of `check()`
  which is supported

## Other projects

- [json-schema-to-zodex](https://github.com/brettz9/json-schema-to-zodex)
- [zod-to-json-schema](https://github.com/StefanTerdell/zod-to-json-schema)
