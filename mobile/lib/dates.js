// Даты и подписи — те же, что на сайте (frontend/js/common.js)

export const MONTHS = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
export const MONTHS_OF = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

// Date → "2026-11-16"
export function toIso(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export const todayIso = () => toIso(new Date());

// "2026-11-16" → «16 ноября»
export function formatDayMonth(iso) {
  return `${Number(iso.slice(8, 10))} ${MONTHS_OF[Number(iso.slice(5, 7)) - 1]}`;
}

// "2026-11-16" → «ноя»
export function shortMonth(iso) {
  return MONTHS_OF[Number(iso.slice(5, 7)) - 1].slice(0, 3);
}

// plural(5, ["упражнение", "упражнения", "упражнений"]) → «упражнений»
export function plural(n, [one, few, many]) {
  if (n % 10 === 1 && n % 100 !== 11) return one;
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return few;
  return many;
}

// 70 → «1 ч 10 мин»
export function formatMinutes(total) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (!h) return `${m} мин`;
  return m ? `${h} ч ${m} мин` : `${h} ч`;
}

// «5 упражнений · 1 ч 10 мин»
export function workoutMeta(exercises, minutes) {
  return `${exercises} ${plural(exercises, ["упражнение", "упражнения", "упражнений"])} · ${formatMinutes(minutes)}`;
}
