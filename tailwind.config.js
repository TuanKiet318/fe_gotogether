/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Đảm bảo bao gồm tất cả file trong src
  ],
  theme: {
    extend: {}, // Có thể thêm custom styles nếu cần
  },
  plugins: [],
};
