# CHANGES for zodexy

## 0.27.1

- fix: use new `meta.title` over `description` for short annotations in own schema

## 0.27.0

- feat: accept `schema` string on `zerialize` to build new `$zodexySchema` property

## 0.26.1

- fix(types and schema): add index signature and `id`, `title`, `description`, `deprecated` for metadata

## 0.26.0

- fix(types): include schema extras on standalone `Sz*` types and expose their core shapes as `Sz*Base` types

## 0.25.0

- feat: ensure custom checks and errors are applied where supported

## 0.24.1

- fix(types): ensure allow all versions of uuid ("v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8")

## 0.24.0

- feat: implement `instanceof` type

## 0.23.0

- feat: implement `codec` type

## 0.22.0

- feat: allow checks on `unknown` and `any`

## 0.21.2

- fix(types): ensure `cidr` version is required and `unknownKeys` is dropped from object

## 0.21.1

- fix: point go-semantic-release update-file at lib/package.json

Breaking changes:

- fix: for literals, `value` is removed in favor of `values`, to reflect Zod's new support for arrays.
- fix: require `version` for `cidr` string
- fix: drop `finite` (numbers no longer allow infinite values in Zod) and `int` (uses `format` instead)
- fix: drop `effects`, `preprocesses`, and `superRefinements` in favor of `checks` property and `transform` and `pipe` types; `transforms` expects new Zod 4 function format
- fix: remove object's `unknownKeys`
- fix: remove nativeEnum type
- fix: represent `enum` type as object instead of array, with number as well as string keys and values
- fix: disallow other properties with JSON references (per spec)
- feat: adds `exports`

Other changes:

- feat: support zod 4.3 min/max on maps
- feat: support xor and looseRecord for zod 4.2.1
- feat: support metadata
- fix: use preferred (equivalent) method for descriptive metadata
- fix: make properties of file optional
- feat: for number and bigInt types, add `format`
- feat: adds serialization for template literals (with `parts`)
- feat: add serialization for `File` (with `min`, `max`, and `mime`)
- feat: serializes custom errors
- feat: add email `pattern` and `flags` properties
- feat: add string types: jwt (with `alg` property), e164, xid, guid, ksuid
- feat: add `version` property for `uuid`
- feat: add to literals: bigInt, boolean, null, and undefined types
- feat: bump `type-fest` and `zod` dependencies
- fix: allow any type as Map key
- docs: mention other Zodex-related projects
- chore: update deps
