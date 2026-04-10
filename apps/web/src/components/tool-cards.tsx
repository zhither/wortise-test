import { Icon } from "./icons";

function weekNumber(d: Date): number {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - y.getTime()) / 86400000 + 1) / 7);
}

function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
}

type DateCardProps = { isoDate: string; timezone: string };

export function DateToolCard({ isoDate, timezone }: DateCardProps) {
  const [y, m, day] = isoDate.split("-").map(Number);
  const d = y && m && day ? new Date(y, m - 1, day, 12) : new Date(isoDate);
  const weekday = new Intl.DateTimeFormat("es-AR", { weekday: "long" }).format(d);
  const longDate = new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);

  return (
    <div
      className="fade-in flex min-w-[200px] max-w-full flex-col gap-2.5 rounded-[14px] border border-[#818cf8]/20 px-4 py-3.5"
      style={{ background: "rgba(129,140,248,0.06)" }}
    >
      <div className="flex items-center gap-2">
        <div
          className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-md"
          style={{ background: "rgba(129,140,248,0.15)" }}
        >
          <Icon name="calendar" size={13} color="#818cf8" />
        </div>
        <span className="font-mono text-[11px] font-medium uppercase tracking-wide text-[#818cf8]">
          current_date
        </span>
      </div>
      <div>
        <div className="text-[22px] font-bold capitalize leading-tight tracking-tight text-[#f0f0f5]">
          {weekday}
        </div>
        <div className="mt-0.5 text-[13px] text-[#9090a8]">{longDate}</div>
      </div>
      <div className="flex gap-1.5 text-[11px] text-[#5a5a70]">
        <span>Semana {weekNumber(d)}</span>
        <span>·</span>
        <span>Día {dayOfYear(d)} del año</span>
      </div>
      <div className="truncate font-mono text-[10px] text-[#5a5a70]">{timezone}</div>
    </div>
  );
}

type TimeCardProps = { isoTime: string; timezone: string };

export function TimeToolCard({ isoTime, timezone }: TimeCardProps) {
  const parts = isoTime.split(":");
  const hhmm = parts.length >= 2 ? `${parts[0]}:${parts[1]}` : isoTime;

  return (
    <div
      className="fade-in flex min-w-[180px] max-w-full flex-col gap-2.5 rounded-[14px] border border-emerald-400/20 px-4 py-3.5"
      style={{ background: "rgba(52,211,153,0.06)" }}
    >
      <div className="flex items-center gap-2">
        <div
          className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-md"
          style={{ background: "rgba(52,211,153,0.12)" }}
        >
          <Icon name="clock" size={13} color="#34d399" />
        </div>
        <span className="font-mono text-[11px] font-medium uppercase tracking-wide text-emerald-400">
          current_time
        </span>
      </div>
      <div>
        <div className="font-mono text-[28px] font-bold leading-none tracking-tight text-[#f0f0f5]">
          {hhmm}
        </div>
        <div className="mt-0.5 truncate text-xs text-[#9090a8]">{timezone}</div>
      </div>
      <div
        className="flex w-fit items-center gap-1 rounded-md px-2 py-1"
        style={{ background: "rgba(52,211,153,0.08)" }}
      >
        <div
          className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400"
          style={{ animation: "helios-pulse 2s infinite" }}
        />
        <span className="text-[11px] text-emerald-400">En vivo</span>
      </div>
    </div>
  );
}

type WeatherCardProps = {
  location: string;
  tempC: number;
  condition: string;
  humidity?: number;
};

export function WeatherToolCard({ location, tempC, condition, humidity }: WeatherCardProps) {
  const sens = Math.round((tempC - 2) * 10) / 10;
  const hum = humidity != null ? `${Math.round(humidity)}%` : "—";

  return (
    <div
      className="fade-in flex min-w-[240px] max-w-full flex-col gap-3 rounded-[14px] border border-sky-400/20 px-4 py-3.5"
      style={{ background: "rgba(96,165,250,0.06)" }}
    >
      <div className="flex items-center gap-2">
        <div
          className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-md"
          style={{ background: "rgba(96,165,250,0.12)" }}
        >
          <Icon name="cloud" size={13} color="#60a5fa" />
        </div>
        <span className="font-mono text-[11px] font-medium uppercase tracking-wide text-sky-400">
          current_weather
        </span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <div className="text-4xl font-bold leading-none tracking-tight text-[#f0f0f5]">
            {Math.round(tempC)}°
          </div>
          <div className="mt-1 text-[13px] text-[#9090a8]">{condition}</div>
          <div className="mt-0.5 truncate text-xs text-[#5a5a70]">{location}</div>
        </div>
        <div className="text-4xl leading-none" aria-hidden>
          ⛅
        </div>
      </div>
      <div className="flex gap-3 border-t border-sky-400/15 pt-2">
        <div className="flex-1 text-center">
          <div className="mb-0.5 flex items-center justify-center gap-0.5 text-[11px] text-[#5a5a70]">
            <Icon name="thermometer" size={10} color="#5a5a70" />
            Sens.
          </div>
          <div className="text-[13px] font-semibold text-[#9090a8]">{sens}°</div>
        </div>
        <div className="flex-1 text-center">
          <div className="mb-0.5 flex items-center justify-center gap-0.5 text-[11px] text-[#5a5a70]">
            <Icon name="droplets" size={10} color="#5a5a70" />
            Hum.
          </div>
          <div className="text-[13px] font-semibold text-[#9090a8]">{hum}</div>
        </div>
        <div className="flex-1 text-center">
          <div className="mb-0.5 flex items-center justify-center gap-0.5 text-[11px] text-[#5a5a70]">
            <Icon name="wind" size={10} color="#5a5a70" />
            Viento
          </div>
          <div className="text-[13px] font-semibold text-[#9090a8]">—</div>
        </div>
      </div>
    </div>
  );
}
