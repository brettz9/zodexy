/* globals Prism -- Not available as ESM */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import {registerTemplate, Template} from '@webcoder49/code-input';

import Indent from '@webcoder49/code-input/plugins/indent.mjs';

import 'prismjs/themes/prism.min.css';
import'@webcoder49/code-input/code-input.min.css';

import { App } from "./App";
import "./index.css";

registerTemplate(
  'syntax-highlighted',
  new Template(Prism.highlightElement, false, true, false, [new Indent()])
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
