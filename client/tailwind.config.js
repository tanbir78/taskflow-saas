import daisyui from 'daisyui';
export default {
  // Files to scan for Tailwind CSS classes
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],

  // Dark mode configuration
  darkMode: ['class', '[data-theme="taskflow-dark"]'],

  // Theme customization
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },

  // DaisyUI plugin
  plugins: [daisyui],

  // DaisyUI theme configuration
  daisyui: {
    themes: [
      {
        'taskflow-light': {
          primary: '#00B894',
          secondary: '#A7F3D0',
          accent: '#A78BFA',
          neutral: '#1F2937',
          'base-100': '#F8FFFC',
          'base-content': '#1F2937',
          info: '#A78BFA',
          success: '#00B894',
        },
      },

      {
        'taskflow-dark': {
          primary: '#00B894',
          secondary: '#A7F3D0',
          accent: '#A78BFA',
          neutral: '#1F2937',
          'base-100': '#111827',
          'base-content': '#E5E7EB',
        },
      },
    ],
  },
};
