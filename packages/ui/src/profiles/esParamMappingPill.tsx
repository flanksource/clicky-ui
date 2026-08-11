/**
 * The chip showing which parameter an operand is bound to.
 *
 * Split from esParamOperandExtension.tsx: that module exports the operand
 * extension, which is not a component, and a module may not export both
 * (react/only-export-components).
 */


export function ParamMappingPill({
  name,
  label,
  onClear
}: {
  name: string;
  label: string;
  onClear: () => void;
}) {
  return (
    <span className="es-param-chip inline-flex items-center gap-1 rounded border border-primary/40 bg-primary/5 px-1.5 py-0.5 font-mono text-xs">
      {name}
      <button
        type="button"
        aria-label={`Unbind ${label}`}
        className="opacity-60 hover:opacity-100"
        onClick={onClear}
      >
        ×
      </button>
    </span>
  );
}
