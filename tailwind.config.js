import { palette } from './src/theme/palette';

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Map MUI palette colors to Tailwind color names
        primary: palette.primary,     
        secondary: palette.secondary, 
        error: palette.error.main,   
        warning: palette.warning.main,
        info: palette.info.main,
        success: palette.success.main,
      },
    },
  },
  plugins: [],
}