/** Semantic colors backed by CSS variables in src/index.css, so every token adapts to light and dark mode. */
const token = name => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: token('canvas'),
        surface: { DEFAULT: token('surface'), muted: token('surface-muted') },
        line: { DEFAULT: token('line'), strong: token('line-strong') },
        fg: { DEFAULT: token('fg'), muted: token('fg-muted'), subtle: token('fg-subtle') },
        primary: { DEFAULT: token('primary'), fg: token('primary-fg'), soft: token('primary-soft') },
        accent: token('accent'),
        success: { DEFAULT: token('success'), fg: token('success-fg'), soft: token('success-soft') },
        danger: { DEFAULT: token('danger'), fg: token('danger-fg'), soft: token('danger-soft') },
        warning: token('warning'),
      },
    },
  },
  plugins: [],
}
