/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.text-xxs': {
          fontSize: '12px', /* 基準字體大小 */
          transform: 'scale(0.8333)', /* 縮放到 10px */
          transformOrigin: 'left', /* 縮放從左側開始 */
          display: 'inline-block', /* 保證縮放效果正確 */
        },
      });
    },
  ],
};
