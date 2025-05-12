import colors from 'tailwindcss/colors';

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    colors: {
      ...colors,
      primary: palette.primary,     
      secondary: palette.secondary, 
      error: palette.error.main,   
      warning: palette.warning.main,
      info: palette.info.main,
      success: palette.success.main,
    },
  },
}