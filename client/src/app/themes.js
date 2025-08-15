/** @file themes.js
 * @description the themes :) (view this in vscode to see color previews)
 */

export const themes = [
  {
    name: "tanos's pink",
    bg: "#1a121a",
    card: "#251a25",
    cardInner: "#351f35",
    accent: "#ff80bf",
    border: "#4a2d4a",
    emoji: "🌸",
    backgroundImage: "/images/puresakura.png",
    backgroundBlur: "25px",
  },
  {
    name: "Dark",
    bg: "#0a0a0a",
    card: "#111111",
    cardInner: "#161616",
    accent: "#f83858",
    border: "#333333",
    emoji: "🌸",
    backgroundImage: "hero-bg.jpg",
    backgroundBlur: "25px",
  },
  {
    name: "Purple",
    bg: "#1a0c1a",
    card: "#2f1a2f",
    cardInner: "#472e47",
    accent: "#e07fff",
    border: "#543954",
    emoji: "💜",
    backgroundImage: "/images/purple.png",
    backgroundBlur: "10px",
  },
  {
    name: "Turquoise",
    bg: "#0a2a2f",
    card: "#0e3339",
    cardInner: "#124045",
    accent: "#40e0d0",
    border: "#1a5761",
    emoji: "🌊",
    backgroundImage: "/images/puresakura.png",
    backgroundBlur: "25px",
  },
  {
    name: "Forest",
    bg: "#0c1a0f",
    card: "#1a2f1d",
    cardInner: "#2a472e",
    accent: "#7fff7f",
    border: "#345439",
    emoji: "🌿",
    backgroundImage: "./images/puresakura.png",
    backgroundBlur: "40px",
  },
];

export const getSelectionStyles = (theme) => `
  ::selection {
    background-color: ${theme.accent}33;
    color: ${theme.accent};
  }
  ::-moz-selection {
    background-color: ${theme.accent}33;
    color: ${theme.accent};
  }
`;
