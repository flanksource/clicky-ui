import { Icon } from "../data/Icon";
import { UiChevronDown, UiClose } from "../icons";

export function ComboboxActions({
  disabled,
  loading,
  onClear,
  onToggle,
  showClear,
}: {
  disabled: boolean | undefined;
  loading: boolean | undefined;
  onClear: () => void;
  onToggle: () => void;
  showClear: boolean;
}) {
  return (
    <>
      {showClear && (
        <button
          type="button"
          tabIndex={-1}
          aria-label="Clear"
          onClick={onClear}
          className="absolute right-7 flex h-full items-center px-1 text-muted-foreground hover:text-foreground"
        >
          <Icon icon={UiClose} className="text-xs" />
        </button>
      )}
      {loading ? (
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
          <svg
            className="h-3.5 w-3.5 animate-spin text-muted-foreground"
            viewBox="0 0 16 16"
            fill="none"
          >
            <circle
              cx="8"
              cy="8"
              r="6.5"
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.25"
            />
            <path
              d="M14.5 8a6.5 6.5 0 0 0-6.5-6.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
      ) : (
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          aria-label="Toggle options"
          onClick={onToggle}
          className="pointer-events-auto absolute right-0 flex h-full items-center px-2 text-muted-foreground"
        >
          <Icon icon={UiChevronDown} className="text-xs" />
        </button>
      )}
    </>
  );
}
