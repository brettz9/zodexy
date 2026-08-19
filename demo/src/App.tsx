import { useEffect, useMemo, useRef, useState } from "react";
import z from "zod";
import { dezerialize, SzType, zerialize } from "zodexy";

const DEFAULT_ZOD_VALUE = `z.object({
  n: z.number().min(42),
  d: z.date().nullable()
})`;
const DEFAULT_OBJ_VALUE = `{
  "n": 32,
  "d": null
}`;

export function App() {
  const [zodValue, setZodValue] = useState(DEFAULT_ZOD_VALUE);
  const [objValue, setObjValue] = useState(DEFAULT_OBJ_VALUE);
  const zodCodeInputRef = useRef<HTMLCodeInputElement | null>(null);
  const objCodeInputRef = useRef<HTMLCodeInputElement | null>(null);
  const zodexyCodeRef = useRef<HTMLElement | null>(null);
  const resultCodeRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const codeInputElement = zodCodeInputRef.current;
    if (!codeInputElement) {
      return;
    }
    const handleInput = () => setZodValue(codeInputElement.value);
    codeInputElement.addEventListener("input", handleInput);
    return () => codeInputElement.removeEventListener("input", handleInput);
  }, []);

  useEffect(() => {
    const codeInputElement = objCodeInputRef.current;
    if (!codeInputElement) {
      return;
    }
    const handleInput = () => setObjValue(codeInputElement.value);
    codeInputElement.addEventListener("input", handleInput);
    return () => codeInputElement.removeEventListener("input", handleInput);
  }, []);

  const zodexyValue = useMemo<SzType | null>(() => {
    try {
      return zerialize(new Function("z", `return ${zodValue}`)(z));
    } catch (error) {
      return null;
    }
  }, [zodValue]);

  const dezodSchema = useMemo(
    () => zodexyValue && dezerialize(zodexyValue),
    [zodexyValue],
  );
  const result = useMemo(() => {
    try {
      return dezodSchema?.safeParse(JSON.parse(objValue));
    } catch (error) {
      return null;
    }
  }, [dezodSchema, objValue]);

  console.log(result);

  useEffect(() => {
    if (zodexyCodeRef.current) {
      Prism.highlightElement(zodexyCodeRef.current);
    }
  }, [zodexyValue]);

  useEffect(() => {
    if (resultCodeRef.current) {
      Prism.highlightElement(resultCodeRef.current);
    }
  }, [result]);

  return (
    <div className="app">
      <p>
        <a href="https://github.com/brettz9/zodexy" target="_blank">
          zodexy
        </a>{" "}
        is a type-safe (de)serialization library for zod. It both serializes and
        simplifies types into JSON, as you can see in the example below.
        <br />
        <br />
        You can edit the zod schema below to see how the corresponding
        serialized zodexy schema looks like.
      </p>
      <div className="playground">
        <label>zod schema</label>
        <code-input language="javascript" ref={zodCodeInputRef}>
          <textarea
            data-code-input-fallback=""
            cols={120}
            rows={10}
            defaultValue={zodValue}
          />
        </code-input>
        {zodexyValue && (
          <pre className="language-json">
            <code
              className="language-json"
              key={JSON.stringify(zodexyValue)}
              ref={zodexyCodeRef}
            >
              {JSON.stringify(zodexyValue, null, 2)}
            </code>
          </pre>
        )}

        <p>
          You can enter a JSON value below and see how the deserialized schema
          parses it, like the original zod schema would have:
        </p>

        <label>value to validate</label>
        <code-input language="json" ref={objCodeInputRef}>
          <textarea
            data-code-input-fallback=""
            cols={120}
            rows={10}
            defaultValue={objValue}
          />
        </code-input>
        {result && (
          <pre className="language-json">
            <code
              className="language-json"
              key={JSON.stringify(result)}
              ref={resultCodeRef}
            >
              {JSON.stringify(result, null, 2)}
            </code>
          </pre>
        )}
      </div>
    </div>
  );
}
