// Изменить тренировку (?id=15) или запланировать новую на день (?date=2026-11-16).
// Открывается кнопкой «Изменить» и ссылкой «+ Запланировать». Сама форма — components/WorkoutForm.js
import { router, useLocalSearchParams } from "expo-router";

import WorkoutForm from "../components/WorkoutForm";
import { Back, Screen } from "../components/ui";

export default function WorkoutFormScreen() {
  const { id, date } = useLocalSearchParams();
  return (
    <Screen>
      <Back onPress={() => router.back()} />
      {/* После сохранения — экран тренировки вместо формы: «Назад» с него ведёт туда, откуда открыли форму */}
      <WorkoutForm id={id} date={date} onSaved={(savedId) => router.replace(`/workout/${savedId}`)} />
    </Screen>
  );
}
