import type { ComponentType, CSSProperties } from "react";

export type DiagramIcon = ComponentType<{ className?: string; style?: CSSProperties }>;

const captainSymbol = new URL("./captain-symbol-small.svg", import.meta.url).href;

export const Captain: DiagramIcon = ({ className, style }) => <img src={captainSymbol} alt="" className={className} style={style} />;
