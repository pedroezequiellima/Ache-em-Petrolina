"use client";

import { useSyncExternalStore } from "react";
import { DAY_LABELS, formatHour } from "@/lib/format";
import type { DayHours } from "@/lib/types";

const recifeClock = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Recife",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
}
const currentMinute = () => Math.floor(Date.now() / 60_000);
const noMinuteOnServer = () => null;

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function nowInPetrolina(minute: number) {
  const parts = recifeClock.formatToParts(new Date(minute * 60_000));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    day: WEEKDAYS_EN.indexOf(get("weekday")),
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

function nextOpening(hours: (DayHours | null)[], day: number, minutes: number): string | null {
  for (let offset = 0; offset < 7; offset++) {
    const d = (day + offset) % 7;
    const h = hours[d];
    if (!h || (offset === 0 && minutes >= toMinutes(h.open))) continue;
    const when = offset === 0 ? "hoje" : offset === 1 ? "amanhã" : DAY_LABELS[d].toLowerCase();
    return `abre ${when} às ${formatHour(h.open)}`;
  }
  return null;
}

export function OpenStatus({ hours }: { hours: (DayHours | null)[] }) {
  const minute = useSyncExternalStore(subscribe, currentMinute, noMinuteOnServer);
  if (minute === null) return null;

  const { day, minutes } = nowInPetrolina(minute);
  const today = hours[day];

  if (today && minutes >= toMinutes(today.open) && minutes < toMinutes(today.close)) {
    return (
      <p className="text-sm font-semibold text-emerald-700">
        Aberto agora{" "}
        <span className="font-normal text-stone-600">· fecha às {formatHour(today.close)}</span>
      </p>
    );
  }

  const next = nextOpening(hours, day, minutes);
  return (
    <p className="text-sm font-semibold text-red-700">
      Fechado agora {next && <span className="font-normal text-stone-600">· {next}</span>}
    </p>
  );
}
