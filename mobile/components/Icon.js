// Иконки — те же контуры, что на сайте (frontend/js/common.js)
import Svg, { Path } from "react-native-svg";

import { colors } from "../lib/theme";

const paths = {
  calendar: "M7 3v3M17 3v3M4 9.5h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z",
  plus: "M12 5v14M5 12h14",
  user: "M12 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8zM4.5 20c1.4-3.3 4.2-5 7.5-5s6.1 1.7 7.5 5",
  star: "M12 3.6l2.6 5.2 5.8.9-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.9z",
  trash: "M4.5 7h15M9.5 7V4.5h5V7M6.5 7l.9 12.5h9.2L17.5 7M10.2 11v5.5M13.8 11v5.5",
  left: "M14.5 5.5L8 12l6.5 6.5",
  right: "M9.5 5.5L16 12l-6.5 6.5",
};

// <Icon name="trash" size={22} color="#000" />
export default function Icon({ name, size = 24, color = colors.text }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <Path d={paths[name]} />
    </Svg>
  );
}
