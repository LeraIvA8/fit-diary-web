// Календарь месяца (экраны «Главная» и «Конструктор»), как на сайте:
// дни с тренировками — зелёные, выбранный день обведён золотым. Нажатие на день → onSelect("2026-11-16").
// refreshKey — изменился, значит, тренировки могли поменяться: календарь заново спрашивает сервер.
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { api } from "../lib/api";
import { MONTHS, toIso, todayIso } from "../lib/dates";
import { colors, fonts } from "../lib/theme";
import Icon from "./Icon";

const WEEKDAYS = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

export default function MonthCalendar({ selected, onSelect, refreshKey, mini }) {
  // Какой месяц показан: первое число месяца выбранного дня
  const [shown, setShown] = useState(() => new Date(Number(selected.slice(0, 4)), Number(selected.slice(5, 7)) - 1, 1));
  const [daysWithWorkout, setDaysWithWorkout] = useState(new Set());

  // Если выбранный день поменяли снаружи (открыли тренировку на изменение) — показать его месяц
  useEffect(() => {
    setShown(new Date(Number(selected.slice(0, 4)), Number(selected.slice(5, 7)) - 1, 1));
  }, [selected.slice(0, 7)]);

  const year = shown.getFullYear();
  const month = shown.getMonth();

  // Неделя начинается с понедельника: сколько дней прошлого месяца показать в первой строке
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - ((first.getDay() + 6) % 7));
  const lastDay = new Date(year, month + 1, 0);

  // Спрашиваем у бэкенда, в какие дни есть тренировки
  useEffect(() => {
    let active = true;
    api("GET", `/api/home/calendar?from=${toIso(start)}&to=${toIso(lastDay)}`)
      .then((rows) => active && setDaysWithWorkout(new Set(rows.map((w) => w.date))))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [year, month, refreshKey]);

  const days = [];
  for (let day = new Date(start); day <= lastDay; day.setDate(day.getDate() + 1)) {
    days.push({ iso: toIso(day), number: day.getDate(), other: day.getMonth() !== month });
  }

  const size = mini ? 38 : 42;
  const moveMonth = (delta) => setShown(new Date(year, month + delta, 1));

  return (
    <View>
      <View style={st.nav}>
        <Text style={[st.month, mini && { fontSize: 22 }]}>
          {MONTHS[month]} <Text style={{ color: colors.textMuted }}>{year}</Text>
        </Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable style={[st.round, mini && st.roundMini]} onPress={() => moveMonth(-1)} hitSlop={6}>
            <Icon name="left" size={mini ? 18 : 20} />
          </Pressable>
          <Pressable style={[st.round, mini && st.roundMini]} onPress={() => moveMonth(1)} hitSlop={6}>
            <Icon name="right" size={mini ? 18 : 20} />
          </Pressable>
        </View>
      </View>

      <View style={st.grid}>
        {WEEKDAYS.map((d) => (
          <Text key={d} style={st.weekday}>{d.toUpperCase()}</Text>
        ))}
        {days.map(({ iso, number, other }) => {
          const has = daysWithWorkout.has(iso);
          const today = iso === todayIso();
          return (
            <View key={iso} style={st.cell}>
              <Pressable
                onPress={() => onSelect(iso)}
                style={[
                  st.day,
                  { width: size, height: size, borderRadius: size / 2 },
                  today && st.today,
                  has && !today && st.has,
                  iso === selected && st.selected,
                ]}
              >
                <Text style={[st.dayText, other && st.other, (today || has) && st.bold, has && !today && { color: "#fff" }]}>{number}</Text>
                {has && <View style={st.dot} />}
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  nav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  month: { fontFamily: fonts.serif, fontSize: 28, color: colors.text },
  round: {
    width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center",
    backgroundColor: colors.muted, borderWidth: 1, borderColor: colors.border,
  },
  roundMini: { width: 36, height: 36, borderRadius: 18 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  weekday: { width: `${100 / 7}%`, paddingBottom: 8, textAlign: "center", fontFamily: fonts.bold, fontSize: 11, color: colors.textMuted },
  cell: { width: `${100 / 7}%`, alignItems: "center", paddingVertical: 3 },
  day: { alignItems: "center", justifyContent: "center" },
  dayText: { fontFamily: fonts.regular, fontSize: 16, color: colors.text },
  other: { color: colors.textFaint },
  bold: { fontFamily: fonts.bold },
  today: { backgroundColor: colors.muted },
  has: { backgroundColor: colors.primary },
  selected: { borderWidth: 2.5, borderColor: colors.accent },
  dot: { position: "absolute", bottom: 5, width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.accent },
});
