import type React from "react";

declare global {
  interface HTMLCodeInputElement extends HTMLElement {
    value: string;
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "code-input": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLCodeInputElement> & { language?: string },
        HTMLCodeInputElement
      >;
    }
  }
}
