/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./src/**/*.{html, js, ts, vue}",
      "./src/**/*"
    ],
    theme: {
      extend: {
        gridTemplateColumns: {
          '20': 'repeat(20, minmax(0, 1fr))'
        }
      }
    },
    plugins: [],
  }
  
  