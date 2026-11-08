// Экран «Тренировка» — как workout.html?id=15: упражнения, «Выполнено», изменение, удаление.
// Бэкенд: backend/routes/workout.py
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Text, View } from "react-native";

import { Back, Button, Card, Eyebrow, Label, LinkText, Muted, Screen, Title, s } from "../../components/ui";
import { api, confirmAction } from "../../lib/api";
import { formatDayMonth, workoutMeta } from "../../lib/dates";

export default function Workout() {
  const { id } = useLocalSearchParams(); // номер тренировки из адреса
  const [workout, setWorkout] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api("GET", `/api/workout/${id}`).then(setWorkout).catch((e) => setError(e.message));
  }, [id]);

  // Загружаем при открытии и после возвращения из конструктора
  useFocusEffect(load);

  // Назад: туда, откуда пришли; если истории нет (открыли сразу после сохранения) — на главную
  const back = () => (router.canGoBack() ? router.back() : router.replace("/"));

  if (error) {
    return (
      <Screen>
        <Muted>{error}</Muted>
        <LinkText title="На главную" onPress={() => router.replace("/")} style={{ marginTop: 16 }} />
      </Screen>
    );
  }
  if (!workout) return <Screen />;

  async function toggleCompleted() {
    await api("PATCH", `/api/workout/${id}`, { completed: !workout.completed });
    load();
  }

  function remove() {
    confirmAction("Удалить тренировку?", async () => {
      await api("DELETE", `/api/workout/${id}`);
      router.replace("/");
    });
  }

  return (
    <Screen>
      <Back onPress={back} />
      <View style={s.head}>
        <View style={{ flex: 1 }}>
          <Eyebrow>{formatDayMonth(workout.date)}</Eyebrow>
          <Title>{workout.title}</Title>
        </View>
      </View>

      {/* Упражнения */}
      <View style={{ gap: 14 }}>
        {workout.exercises.map((e, i) => (
          <Card key={i}>
            <Eyebrow>Упражнение {String(i + 1).padStart(2, "0")}</Eyebrow>
            <Text style={s.rowTitle}>{e.name}</Text>
            <Muted>{e.sets} × {e.reps}{e.note ? ` · ${e.note}` : ""}</Muted>
          </Card>
        ))}
      </View>

      {/* Итог и действия */}
      <Card style={{ marginTop: 24, gap: 12 }}>
        <Label>Тренировка</Label>
        <Muted style={{ marginTop: -6, marginBottom: 6 }}>
          {workoutMeta(workout.exercises.length, workout.minutes)}{workout.completed ? " · выполнена" : ""}
        </Muted>
        <Button
          kind={workout.completed ? "outline" : "primary"}
          title={workout.completed ? "Снять отметку" : "Выполнено"}
          onPress={toggleCompleted}
        />
        <Button kind="outline" title="Изменить тренировку" onPress={() => router.push({ pathname: "/workout-form", params: { id } })} />
        <Button kind="danger" title="Удалить тренировку" onPress={remove} />
      </Card>
    </Screen>
  );
}
