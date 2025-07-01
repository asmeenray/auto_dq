/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Futuristic Color Palette
        primary: {
          50: '#e6f2ff',
          100: '#b3d9ff',
          200: '#80c1ff', 
          300: '#4da8ff',
          400: '#1a8fff',
          500: '#0066ff', // Electric Blue
          600: '#0052cc',
          700: '#003d99',
          800: '#002966',
          900: '#001533',
        },
        accent: {
          cyan: '#00d4ff', // Cyber Teal
          green: '#00ff88', // Neon Green
          orange: '#ff6b00', // Plasma Orange
          red: '#ff0055', // Crimson Red
          blue: '#88ddff', // Arctic Blue
        },
        neutral: {
          void: '#000000', // Pure black
          'dark-matter': '#0f0f14', // Card backgrounds
          quantum: '#1a1a24', // Surface backgrounds
          nebula: '#2a2a3a', // Border colors
          stardust: '#8892b0', // Secondary text
          moonlight: '#ccd6f6', // Primary text
          supernova: '#ffffff', // High contrast text
        },
        space: {
          900: '#000000',
          800: '#0f0f14',
          700: '#1a1a24',
          600: '#2a2a3a',
          500: '#3a3a4a',
          400: '#4a4a5a',
          300: '#6a6a7a',
          200: '#8892b0',
          100: '#ccd6f6',
          50: '#ffffff',
        }
      },
      fontFamily: {
        'display': ['Orbitron', 'monospace'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
      },
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      borderRadius: {
        'neural': '12px',
        'pill': '50px',
      },
      boxShadow: {
        'neural': '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'neural-hover': '0 12px 48px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 212, 255, 0.1)',
        'glow': '0 0 20px rgba(0, 102, 255, 0.3)',
        'glow-strong': '0 0 30px rgba(0, 102, 255, 0.5)',
        'neon-green': '0 0 20px rgba(0, 255, 136, 0.4)',
        'neon-red': '0 0 20px rgba(255, 0, 85, 0.4)',
        'neon-cyan': '0 0 20px rgba(0, 212, 255, 0.4)',
      },
      animation: {
        'pulse-blue': 'pulse-blue 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-green': 'pulse-green 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-red': 'pulse-red 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-blue': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 102, 255, 0.3)' },
          '50%': { boxShadow: '0 0 15px rgba(0, 102, 255, 0.6)' },
        },
        'pulse-green': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 255, 136, 0.3)' },
          '50%': { boxShadow: '0 0 15px rgba(0, 255, 136, 0.6)' },
        },
        'pulse-red': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(255, 0, 85, 0.3)' },
          '50%': { boxShadow: '0 0 15px rgba(255, 0, 85, 0.6)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { opacity: '0.5' },
          '100%': { opacity: '1' },
        },
      },
      backdropBlur: {
        'neural': '20px',
      },
      backgroundImage: {
        'neural-gradient': 'linear-gradient(135deg, #0066ff, #00d4ff)',
        'space-gradient': 'linear-gradient(180deg, #000000, #0f0f14)',
        'card-gradient': 'linear-gradient(145deg, rgba(15, 15, 20, 0.9), rgba(26, 26, 36, 0.9))',
      }
    },
  },
  plugins: [],
}
