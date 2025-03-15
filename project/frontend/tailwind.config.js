/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html",
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            light: '#4dabf7',
            DEFAULT: '#228be6',
            dark: '#1971c2',
          },
          secondary: {
            light: '#fab005',
            DEFAULT: '#e67700',
            dark: '#cc5de8',
          },
          success: {
            light: '#69db7c',
            DEFAULT: '#40c057',
            dark: '#2b8a3e',
          },
          danger: {
            light: '#ff8787',
            DEFAULT: '#fa5252',
            dark: '#e03131',
          },
          gray: {
            100: '#f8f9fa',
            200: '#e9ecef',
            300: '#dee2e6',
            400: '#ced4da',
            500: '#adb5bd',
            600: '#868e96',
            700: '#495057',
            800: '#343a40',
            900: '#212529',
          },
        },
        fontFamily: {
          sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        },
        boxShadow: {
          card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
        borderRadius: {
          'sm': '0.25rem',
          DEFAULT: '0.375rem',
          'md': '0.5rem',
          'lg': '0.75rem',
          'xl': '1rem',
        },
        spacing: {
          '72': '18rem',
          '84': '21rem',
          '96': '24rem',
        },
      },
    },
    plugins: [
      require('@tailwindcss/forms'),
    ],
  }