/** @type {import('tailwindcss').Config} */
const defaultConfig = require("shadcn/ui/tailwind.config")

module.exports = {
  ...defaultConfig,
  content: ["./src/**/*.{html,ts}", "*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    ...defaultConfig.theme,
    extend: {
      ...defaultConfig.theme.extend,
      colors: {
        ...defaultConfig.theme.extend.colors,
        primary: {
          ...defaultConfig.theme.extend.colors.primary,
          50: "#e6f7ff",
          100: "#bae7ff",
          200: "#91d5ff",
          300: "#69c0ff",
          400: "#40a9ff",
          500: "#1890ff",
          600: "#096dd9",
          700: "#0050b3",
          800: "#003a8c",
          900: "#002766",
        },
        success: {
          50: "#f6ffed",
          100: "#d9f7be",
          200: "#b7eb8f",
          300: "#95de64",
          400: "#73d13d",
          500: "#52c41a",
          600: "#389e0d",
          700: "#237804",
          800: "#135200",
          900: "#092b00",
        },
        warning: {
          50: "#fffbe6",
          100: "#fff1b8",
          200: "#ffe58f",
          300: "#ffd666",
          400: "#ffc53d",
          500: "#faad14",
          600: "#d48806",
          700: "#ad6800",
          800: "#874d00",
          900: "#613400",
        },
        error: {
          50: "#fff2f0",
          100: "#ffccc7",
          200: "#ffa39e",
          300: "#ff7875",
          400: "#ff4d4f",
          500: "#f5222d",
          600: "#cf1322",
          700: "#a8071a",
          800: "#820014",
          900: "#5c0011",
        },
        fontFamily: {
          sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [...defaultConfig.plugins, require("tailwindcss-animate")],
  corePlugins: {
    preflight: false,
  },
}
