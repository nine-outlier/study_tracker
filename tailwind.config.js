/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class", // Critical for theme switching
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        lexend: ["Lexend", "sans-serif"], // For accessible font toggle
      },
      colors: {
        // Semantic Colorblind-Safe Text Colors
        "cb-critical": "#dc2626",      // red-600
        "cb-weak": "#ea580c",          // orange-600
        "cb-developing": "#ca8a04",    // yellow-600
        "cb-strong": "#16a34a",        // green-600
        "cb-mastered": "#0891b2",      // cyan-600

        // Semantic Colorblind-Safe Light Backgrounds
        "cb-critical-light": "#fef2f2",     // red-50
        "cb-weak-light": "#fff7ed",        // orange-50
        "cb-developing-light": "#fefce8",  // yellow-50
      },
    },
  },
  plugins: [],
};