/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}", // adjust to your project files
  ],
  theme: {
    extend: {
      colors: {
        surface: "rgb(var(--bg-surface) / <alpha-value>)",
        primary: "rgb(var(--text-primary) / <alpha-value>)",
        border: "rgb(var(--border-color) / <alpha-value>)",
      },
    },
  },
  plugins: [],
}
