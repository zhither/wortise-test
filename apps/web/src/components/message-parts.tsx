import type { MessagePart as MP } from "@wortise/shared";

import { Icon } from "./icons";
import { DateToolCard, TimeToolCard, WeatherToolCard } from "./tool-cards";

type MessagePartsViewProps = {
  parts: MP[];
  /** Tarjetas de tools fuera de la burbuja; el texto va dentro de la burbuja (mock asistente). */
  assistantLayout?: boolean;
};

export function MessagePartsView({ parts, assistantLayout }: MessagePartsViewProps) {
  const textParts = parts.filter((p): p is Extract<MP, { type: "text" }> => p.type === "text");
  const toolParts = parts.filter((p): p is Extract<MP, { type: "tool_invocation" }> => p.type === "tool_invocation");
  const hasMultipleTools = toolParts.filter((t) => t.state === "result").length > 1;

  const textInner = textParts.map((part, i) => (
    <p
      key={`t-${i}`}
      className="whitespace-pre-wrap text-sm leading-relaxed text-[#f0f0f5] first:mt-0"
    >
      {part.text}
    </p>
  ));

  return (
    <div className="flex flex-col gap-3">
      {toolParts.length > 0 && (
        <>
          {hasMultipleTools && (
            <div className="flex items-center gap-2 px-0.5">
              <div className="h-px flex-1 bg-[var(--border)]" />
              <span className="whitespace-nowrap font-mono text-[10px] text-[#5a5a70]">
                herramientas utilizadas
              </span>
              <div className="h-px flex-1 bg-[var(--border)]" />
            </div>
          )}
          <div className="-mx-1 flex flex-wrap gap-2.5 overflow-x-auto pb-1 sm:mx-0">
            {toolParts.map((part) => (
              <ToolInvocationBlock key={part.id} part={part} />
            ))}
          </div>
        </>
      )}

      {textParts.length > 0 &&
        (assistantLayout ? (
          <div className="rounded-2xl rounded-bl-md border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3">
            {textInner}
          </div>
        ) : (
          textInner
        ))}
    </div>
  );
}

function ToolInvocationBlock({
  part,
}: {
  part: Extract<MP, { type: "tool_invocation" }>;
}) {
  const badge =
    part.name === "currentDate"
      ? { l: "fecha", border: "border-[#818cf8]/25", bg: "bg-[#818cf8]/10", fg: "text-[#818cf8]" }
      : part.name === "currentTime"
        ? {
            l: "hora",
            border: "border-emerald-400/25",
            bg: "bg-emerald-400/10",
            fg: "text-emerald-400",
          }
        : {
            l: "clima",
            border: "border-sky-400/25",
            bg: "bg-sky-400/10",
            fg: "text-sky-400",
          };

  if (part.state === "error") {
    return (
      <div
        className="min-w-[200px] max-w-full rounded-[14px] border border-red-500/25 p-3"
        style={{ background: "rgba(239,68,68,0.06)" }}
      >
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide ${badge.bg} ${badge.fg} ${badge.border}`}
          >
            {badge.l}
          </span>
          <span className="text-xs text-red-300">Error</span>
        </div>
        <p className="mt-2 text-xs text-red-200/90">{part.error?.message}</p>
      </div>
    );
  }

  if (part.state === "result" && part.output) {
    const out = part.output;
    if (out.tool === "currentDate") {
      return <DateToolCard isoDate={out.data.isoDate} timezone={out.data.timezone} />;
    }
    if (out.tool === "currentTime") {
      return <TimeToolCard isoTime={out.data.isoTime} timezone={out.data.timezone} />;
    }
    if (out.tool === "currentWeather") {
      return (
        <WeatherToolCard
          location={out.data.location}
          tempC={out.data.tempC}
          condition={out.data.condition}
          humidity={out.data.humidity}
        />
      );
    }
  }

  const iconName =
    part.name === "currentDate" ? "calendar" : part.name === "currentTime" ? "clock" : "cloud";

  return (
    <div className="flex min-h-[52px] min-w-[160px] items-center gap-2 rounded-[14px] border border-white/10 bg-[#18181f]/80 px-3 py-2">
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide ${badge.bg} ${badge.fg} ${badge.border}`}
      >
        <Icon name={iconName} size={10} color="currentColor" />
        {badge.l}
      </span>
      <span className="text-xs text-[#5a5a70]">Ejecutando…</span>
    </div>
  );
}
