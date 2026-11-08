
-- Пользователи
CREATE TABLE users (
  id            serial PRIMARY KEY,
  name          text NOT NULL,
  email         text NOT NULL UNIQUE,      
  password_hash text NOT NULL,            
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Тренировки в календаре
CREATE TABLE workouts (
  id        serial PRIMARY KEY,
  user_id   integer NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  title     text NOT NULL,
  date      date NOT NULL,
  minutes   integer NOT NULL CHECK (minutes > 0),
  completed boolean NOT NULL DEFAULT false
);

-- Упражнения тренировки 
CREATE TABLE workout_exercises (
  id         serial PRIMARY KEY,
  workout_id integer NOT NULL REFERENCES workouts (id) ON DELETE CASCADE,
  name       text NOT NULL,
  sets       integer NOT NULL CHECK (sets BETWEEN 1 AND 20),
  reps       integer NOT NULL CHECK (reps BETWEEN 1 AND 100),
  note       text NOT NULL DEFAULT ''
);
