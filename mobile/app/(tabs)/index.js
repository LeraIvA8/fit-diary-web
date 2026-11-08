// Экран «Главная» — как index.html на сайте: календарь, тренировки выбранного дня и «Ближайшие».
// Бэкенд: backend/routes/home.py
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import Icon from "../../components/Icon";
import MonthCalendar from "../../components/MonthCalendar";
import { Button, Card, DateBadge, Eyebrow, LinkText, Muted, Screen, Section, Title, s } from "../../components/ui";
import { api } from "../../lib/api";
import { formatDayMonth, shortMonth, todayIso, workoutMeta } from "../../lib/dates";
import { colors } from "../../lib/theme";

export default function Home() {
  const [user, setUser] = useState(null);
  const [selected, setSelected] = useState(todayIso());
  const [day, setDay] = useState(null); // тренировки выбранного дня
  const [upcoming, setUpcoming] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Каждый раз, когда экран снова виден (вернулись с тренировки или из конструктора), — свежие данные
  useFocusEffect(
    useCallback(() => {
      api("GET", "/api/me").then(setUser);
      api("GET", `/api/home/upcoming?from=${todayIso()}`).then(setUpcoming);
      setRefreshKey((k) => k + 1); // календарь и список дня тоже обновятся
    }, []),
  );

  // Тренировки выбранного дня: при нажатии на день в календаре и при возвращении на экран
  useEffect(() => {
    let active = true;
    setDay(null);
    api("GET", `/api/home/day?date=${selected}`).then((rows) => active && setDay(rows));
    return () => {
      active = false;
    };
  }, [selected, refreshKey]);

  return (
    <Screen>
      <View style={s.head}>
        <View>
          <Eyebrow>Дневник тренировок</Eyebrow>
          <Title>{user?.name.split(" ")[0] ?? ""}</Title>
        </View>
        <Pressable style={s.avatar} onPress={() => router.navigate("/profile")}>
          <Text style={s.avatarText}>{user?.name[0] ?? ""}</Text>
        </Pressable>
      </View>

      {/* Календарь */}
      <Card style={{ paddingHorizontal: 12 }}>
        <MonthCalendar selected={selected} onSelect={setSelected} refreshKey={refreshKey} />
      </Card>

      {/* Тренировки выбранного дня */}
      <Section title={selected === todayIso() ? `Сегодня, ${formatDayMonth(selected)}` : formatDayMonth(selected)} />
      <View style={s.stack}>
        {day?.length === 0 && (
          <>
            <Muted>В этот день тренировок нет</Muted>
            <LinkText title="+ Запланировать" onPress={() => router.push({ pathname: "/workout-form", params: { date: selected } })} />
          </>
        )}
        {day?.map((w) => (
          <View key={w.id} style={[s.row, { flexWrap: "wrap" }]}>
            <View style={{ flex: 1, minWidth: 150 }}>
              <Text style={s.rowTitle}>{w.title}</Text>
              <Muted>{workoutMeta(w.exercises, w.minutes)}{w.completed ? " · выполнена" : ""}</Muted>
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Button small title="Открыть" onPress={() => router.push(`/workout/${w.id}`)} />
              <Button small kind="outline" title="Изменить" onPress={() => router.push({ pathname: "/workout-form", params: { id: w.id } })} />
            </View>
          </View>
        ))}
      </View>

      {/* Ближайшие */}
      <Section title="Ближайшие" right={<LinkText title="+ Создать" onPress={() => router.navigate("/create")} />} />
      <View style={s.stack}>
        {upcoming?.length === 0 && <Muted>Запланированных тренировок нет.</Muted>}
        {upcoming?.map((w) => (
          <Pressable key={w.id} style={s.row} onPress={() => router.push(`/workout/${w.id}`)}>
            <DateBadge day={Number(w.date.slice(8, 10))} month={shortMonth(w.date)} />
            <View style={{ flex: 1 }}>
              <Text style={s.rowTitle}>{w.title}</Text>
              <Muted>{workoutMeta(w.exercises, w.minutes)}</Muted>
            </View>
            <Icon name="right" color={colors.textMuted} />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
