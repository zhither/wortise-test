import { useState } from "react";

import { Icon } from "./icons";

type Props = {
  value: string;
  onValueChange: (v: string) => void;
  placeholder: string;
  "aria-label"?: string;
  className?: string;
};

/** Mismo lenguaje visual que AuthInputField: borde/sombra índigo al foco, sin “flash” blanco del theme HeroUI. */
export function ChatSearchField({
  value,
  onValueChange,
  placeholder,
  "aria-label": ariaLabel,
  className,
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={`flex h-10 w-full min-h-10 shrink-0 items-center gap-2 rounded-[10px] px-3 transition-[background,border-color,box-shadow] duration-150 ${className ?? ""}`}
      style={{
        background: focused ? "var(--bg-elevated)" : "var(--bg-surface)",
        border: `1.5px solid ${focused ? "var(--accent)" : "var(--border-strong)"}`,
        boxShadow: focused ? "0 0 0 3px rgba(99,102,241,0.1)" : "none",
      }}
    >
      <span className="shrink-0">
        <Icon name="search" size={14} color={focused ? "#6366f1" : "#5a5a70"} />
      </span>
      <input
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="min-w-0 flex-1 border-0 bg-transparent py-0 text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
      />
      {value ? (
        <button
          type="button"
          tabIndex={-1}
          className="flex shrink-0 text-[#5a5a70] transition-colors hover:text-[#9090a8]"
          onClick={() => onValueChange("")}
          aria-label="Limpiar búsqueda"
        >
          <Icon name="x" size={14} color="currentColor" />
        </button>
      ) : null}
    </div>
  );
}
