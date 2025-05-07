import "./i18n";

import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { StoreProvider } from "./store/index";

import { createRoot } from 'react-dom/client';
import { LoadingComponent } from "./components/LoadingComponent";
import React from "react";
import { Buffer } from 'buffer';
const baseName = document.getElementsByTagName("base")[0].getAttribute("href") as string;

// @ts-ignore
window.Buffer = Buffer;

declare global {
  interface Window {
    safari: any;
  }
}

new Image().src = './images/loading.svg'

const container = document.getElementById('root') as Element;
const root = createRoot(container);

root.render(<React.Suspense fallback={ <LoadingComponent isTerminal/>}>
  <StoreProvider>
    <BrowserRouter basename={baseName}>
      <App />
    </BrowserRouter>
  </StoreProvider>
</React.Suspense>);


