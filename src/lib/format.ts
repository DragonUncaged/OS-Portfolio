const pad = (n: number) => String(n).padStart(2, "0");

export const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function time12(ts: number): string {
  const d = new Date(ts);
  return `${d.getHours() % 12 || 12}:${pad(d.getMinutes())}`;
}

function meridiem(ts: number): string {
  return new Date(ts).getHours() < 12 ? "AM" : "PM";
}

export function time12m(ts: number): string {
  return `${time12(ts)} ${meridiem(ts)}`;
}

export function time24(ts: number): string {
  const d = new Date(ts);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function dateShort(ts: number): string {
  const d = new Date(ts);
  return `${DAYS[d.getDay()].slice(0, 3)} ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
}

export function dateLong(ts: number): string {
  const d = new Date(ts);
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function dateNumeric(ts: number): string {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

export function dateMonthDay(ts: number): string {
  const d = new Date(ts);
  return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
}

export function span(start: string, end: string | null, now: number): string {
  const [sy, sm] = start.split("-").map(Number);
  const e = end ? end.split("-").map(Number) : [new Date(now).getFullYear(), new Date(now).getMonth() + 1];
  // +1 counts the last month too
  const months = Math.max(1, (e[0] - sy) * 12 + (e[1] - sm) + 1);
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y ? `${y} yr` : "", m ? `${m} mo` : ""].filter(Boolean).join(" ");
}

export function ago(at: number, now: number): string {
  const s = Math.max(0, Math.round((now - at) / 1000));
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}
