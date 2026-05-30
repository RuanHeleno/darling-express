/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#4a154b",
          dark: "#300033",
          light: "#6b2070",
        },
        rose: {
          soft: "#f4c2c2",
          medium: "#b76e79",
        },
        surface: "#ffffff",
        muted: "#f6faff",
        border: "#dbe4ed",
        text: {
          DEFAULT: "#141d23",
          muted: "#4f434c",
          inverse: "#ffffff",
        },
        status: {
          success: "#1f7a3a",
          warning: "#b36b00",
          danger: "#ba1a1a",
        },
      },
      fontFamily: {
        sans: ["System"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },
    },
  },
  plugins: [],
};
