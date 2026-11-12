import "./build-builder.ts";
import { buildStatic } from "./build-static.ts";

const unknown = process.argv.slice(2).filter(arg => arg !== "--dev");
if (unknown.length) throw new Error(`Unknown build arguments ${unknown.join(" ")}; the only flag is --dev`);
await buildStatic({ dev: process.argv.includes("--dev") });
