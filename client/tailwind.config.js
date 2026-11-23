
import daisyui from 'daisyui';

export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],

  darkMode: ['class', '[data-theme="taskflow-dark"]'],

  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      boxShadow: {
        soft: '0 4px 20px rgba(15, 23, 42, 0.06)',
        glow: '0 0 20px rgba(0, 184, 148, 0.15)',
      },
    },
  },

  plugins: [daisyui],

  daisyui: {
    themes: [
      {
        'taskflow-light': {
          primary: '#00B894',
          'primary-content': '#FFFFFF',

          secondary: '#D1FAE5',
          'secondary-content': '#065F46',

          accent: '#8B5CF6',
          'accent-content': '#FFFFFF',

          neutral: '#1F2937',
          'neutral-content': '#F9FAFB',

          'base-100': '#F0FDF8',
          'base-200': '#FFFFFF',
          'base-300': '#E2E8F0',
          'base-content': '#1F2937',

          info: '#3B82F6',
          success: '#059669',
          warning: '#F59E0B',
          error: '#EF4444',

          '--rounded-box': '1rem',
          '--rounded-btn': '0.75rem',
          '--rounded-badge': '1rem',
        },
      },

      {
        'taskflow-dark': {
          primary: '#34D399',
          'primary-content': '#052E22',

          secondary: '#243449',
          'secondary-content': '#D1FAE5',

          accent: '#A78BFA',
          'accent-content': '#1E1B4B',

          neutral: '#243449',
          'neutral-content': '#F8FAFC',

          'base-100': '#0B1220',
          'base-200': '#151F30',
          'base-300': '#334155',
          'base-content': '#E5E7EB',

          info: '#60A5FA',
          success: '#34D399',
          warning: '#FBBF24',
          error: '#F87171',

          '--rounded-box': '1rem',
          '--rounded-btn': '0.75rem',
          '--rounded-badge': '1rem',
        },
      },
    ],
  },
};
