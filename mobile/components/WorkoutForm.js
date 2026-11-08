// Конструктор тренировки — как create.html на сайте. Бэкенд: backend/routes/create.py
//   <WorkoutForm />                 — новая тренировка на сегодня (вкладка «Создать»)
//   <WorkoutForm date="2026-11-16"/> — новая тренировка на этот день («+ Запланировать»)
//   <WorkoutForm id="15" />          — изменить тренировку 15
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { api } from "../lib/api";
import { formatDayMonth, todayIso } from "../lib/dates";
import { colors, fonts } from "../lib/theme";
import Icon from "./Icon";
import MonthCalendar from "./MonthCalendar";
import { Button, Card, ErrorText, Eyebrow, Field, Label, LinkText, Muted, Section, Title, s } from "./ui";

let nextKey = 1; // ключ карточки упражнения, чтобы React не путал карточки при удалении

const emptyExercise = () => ({ key: nextKey++, name: "", sets: "4", reps: "10", note: "" });

export default function WorkoutForm({ id, date: initialDate, onSaved }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(initialDate || todayIso());
  const [exercises, setExercises] = useState(() => (id ? [] : [emptyExercise(), emptyExercise()]));
  const [errors, setErrors] = useState({});
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);

  // Изменение: заполняем форму данными тренировки
  useEffect(() => {
    if (!id) return;
    api("GET", `/api/workout/${id}`)
      .then((workout) => {
        setTitle(workout.title);
        setDate(workout.date);
        setExercises(workout.exercises.map((e) => ({ key: nextKey++, name: e.name, sets: String(e.sets), reps: String(e.reps), note: e.note ?? "" })));
      })
      .catch((error) => setLoadError(error.message));
  }, [id]);

  if (loadError) {
    return (
      <View style={s.stack}>
        <Muted>{loadError}</Muted>
        <LinkText title="На главную" onPress={() => router.replace("/")} />
      </View>
    );
  }

  const change = (key, field, value) => setExercises((list) => list.map((e) => (e.key === key ? { ...e, [field]: value } : e)));
  const remove = (key) => setExercises((list) => list.filter((e) => e.key !== key));

  async function save() {
    // Собрать данные формы в объект для бэкенда
    const body = {
      title,
      date,
      exercises: exercises.map((e) => ({ name: e.name, sets: Number(e.sets), reps: Number(e.reps), note: e.note })),
    };
    setSaving(true);
    try {
      const { id: savedId } = id ? await api("PUT", `/api/create/${id}`, body) : await api("POST", "/api/create", body);
      setErrors({});
      if (!id) {
        // Новая тренировка: форма снова пустая — на случай, если вернутся на вкладку «Создать»
        setTitle("");
        setExercises([emptyExercise(), emptyExercise()]);
      }
      onSaved(savedId);
    } catch (error) {
      setErrors({ ...error.fields, form: error.status === 400 ? "" : error.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <View>
      <View style={s.head}>
        <View>
          <Eyebrow>Конструктор</Eyebrow>
          <Title>{id ? "Изменить тренировку" : "Новая тренировка"}</Title>
        </View>
      </View>

      {/* Название и день */}
      <Card style={{ gap: 20 }}>
        <View>
          <Label>Название тренировки</Label>
          <Field value={title} onChangeText={setTitle} placeholder="Например: Силовая — верх тела" />
          <ErrorText>{errors.title}</ErrorText>
        </View>
        <View>
          <Label>День</Label>
          {/* Нажатие на день ставит тренировку на него. Зелёные дни — уже есть тренировки */}
          <MonthCalendar mini selected={date} onSelect={setDate} />
          <Muted style={{ marginTop: 12 }}>
            Выбран день: <Text style={{ color: colors.text, fontFamily: fonts.bold }}>{formatDayMonth(date)} {date.slice(0, 4)}</Text>
          </Muted>
          <ErrorText>{errors.date}</ErrorText>
        </View>
      </Card>

      {/* Упражнения */}
      <Section
        title="Упражнения"
        right={<LinkText title="Очистить" onPress={() => setExercises([emptyExercise()])} />}
      />
      <View style={{ gap: 18 }}>
        {exercises.map((e, i) => (
          <Card key={e.key} style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Eyebrow style={{ marginBottom: 0 }}>Упражнение {String(i + 1).padStart(2, "0")}</Eyebrow>
              <Pressable onPress={() => remove(e.key)} hitSlop={10}>
                <Icon name="trash" size={22} color={colors.accent} />
              </Pressable>
            </View>
            <View>
              <Field soft value={e.name} onChangeText={(v) => change(e.key, "name", v)} placeholder="Название упражнения" />
              <ErrorText>{errors[`exercises.${i}.name`]}</ErrorText>
            </View>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Label>Подходы</Label>
                <Field soft value={e.sets} onChangeText={(v) => change(e.key, "sets", v)} keyboardType="number-pad" />
                <ErrorText>{errors[`exercises.${i}.sets`]}</ErrorText>
              </View>
              <View style={{ flex: 1 }}>
                <Label>Повторения</Label>
                <Field soft value={e.reps} onChangeText={(v) => change(e.key, "reps", v)} keyboardType="number-pad" />
                <ErrorText>{errors[`exercises.${i}.reps`]}</ErrorText>
              </View>
            </View>
            <Field soft value={e.note} onChangeText={(v) => change(e.key, "note", v)} placeholder="Заметка: техника, вес, самочувствие" />
          </Card>
        ))}
      </View>
      <Button kind="gold" title="+ Добавить упражнение" onPress={() => setExercises((list) => [...list, emptyExercise()])} style={{ marginTop: 20 }} />
      <ErrorText>{errors.exercises}</ErrorText>

      <ErrorText>{errors.form}</ErrorText>
      <Button title={id ? "Сохранить изменения" : "Сохранить тренировку"} onPress={save} disabled={saving} style={{ marginTop: 24 }} />
    </View>
  );
}
