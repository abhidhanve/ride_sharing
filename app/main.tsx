import React from "react";
import { createRoot } from "react-dom/client";
import AppProvider from "./AppProvider";
import PrivyAuthDemo from "./PrivyAuthDemo";

const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <AppProvider>
      <PrivyAuthDemo />
    </AppProvider>
  </React.StrictMode>
);
