/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
        aslam: ["aslam", "serif"],
        jameel: ["noori", "sans-serif"],
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".no-scrollbar": {
          //  For Chrome, Safari, and Opera
          "&::-webkit-scrollbar": {
            display: "none",
          },
          // For Firefox
          scrollbarWidth: "none",
          //  For IE/Edge
          "-ms-overflow-style": "none",
        },
      });
    },
  ],
};
