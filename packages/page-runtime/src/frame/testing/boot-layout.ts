import { createElement, type ReactNode } from "react";
export const meta = { tailwind: "dynamic" };
export default function Layout({ children }: { children: ReactNode }) { return createElement("section", { "data-layout": "true" }, children); }
