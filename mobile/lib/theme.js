// Цвета и шрифты — те же, что на сайте (frontend/css/style.css)

export const colors = {
  background: "#F3EEE4", // кремовый фон
  surface: "#FFFFFF", // карточки
  muted: "#EDE5D6", // плашки
  input: "#F2EADB", // поля внутри карточек
  primary: "#123F30", // тёмно-зелёный
  accent: "#B48A57", // золотой
  text: "#14261F",
  textMuted: "#8A8377",
  textFaint: "#C8BEAD",
  border: "#E4DACA",
  danger: "#A9473A",
};

// Шрифты загружаются в app/_layout.js
export const fonts = {
  serif: "CormorantGaramond_500Medium",
  regular: "Inter_400Regular",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
};

// Мягкая тень карточек
export const shadow = {
  shadowColor: "#5B4A2E",
  shadowOpacity: 0.18,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 10 },
  elevation: 4,
};
