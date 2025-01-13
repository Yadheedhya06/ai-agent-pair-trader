/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}", // Scans pages directory
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}", // Scans components directory
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}