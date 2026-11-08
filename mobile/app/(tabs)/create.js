// Вкладка «Создать» — новая тренировка (create.html на сайте). Сама форма — components/WorkoutForm.js
import { router } from "expo-router";

import WorkoutForm from "../../components/WorkoutForm";
import { Screen } from "../../components/ui";

export default function Create() {
  return (
    <Screen>
      <WorkoutForm onSaved={(id) => router.push(`/workout/${id}`)} />
    </Screen>
  );
}
