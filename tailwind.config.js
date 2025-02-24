/** @type {import('tailwindcss').Config} */
import animate from "tailwindcss-animate"

export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
        'gradient-xy': {
          '0%, 100%': {
            'background-position': '0% 0%'
          },
          '50%': {
            'background-position': '100% 100%'
          }
        },
        'grid-movement': {
          '0%': {
            transform: 'translateX(0) translateY(0)'
          },
          '100%': {
            transform: 'translateX(-75%) translateY(-75%)'
          }
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0) rotate(var(--tw-rotate))',
          },
          '50%': {
            transform: 'translateY(-20px) rotate(var(--tw-rotate))',
          },
        },
        'float-diagonal': {
          '0%, 100%': {
            transform: 'translate(0, 0) rotate(var(--tw-rotate))',
          },
          '50%': {
            transform: 'translate(20px, -20px) rotate(var(--tw-rotate))',
          }
        },
        'float-diagonal-reverse': {
          '0%, 100%': {
            transform: 'translate(0, 0) rotate(var(--tw-rotate))',
          },
          '50%': {
            transform: 'translate(-20px, 20px) rotate(var(--tw-rotate))',
          }
        },
        'float-horizontal': {
          '0%, 100%': {
            transform: 'translateX(0) rotate(var(--tw-rotate))',
          },
          '50%': {
            transform: 'translateX(20px) rotate(var(--tw-rotate))',
          }
        },
        'float-horizontal-reverse': {
          '0%, 100%': {
            transform: 'translateX(0) rotate(var(--tw-rotate))',
          },
          '50%': {
            transform: 'translateX(-20px) rotate(var(--tw-rotate))',
          }
        },
        'float-circular': {
          '0%': {
            transform: 'rotate(var(--tw-rotate)) translate(0)',
          },
          '25%': {
            transform: 'rotate(var(--tw-rotate)) translate(10px, -10px)',
          },
          '50%': {
            transform: 'rotate(var(--tw-rotate)) translate(20px, 0)',
          },
          '75%': {
            transform: 'rotate(var(--tw-rotate)) translate(10px, 10px)',
          },
          '100%': {
            transform: 'rotate(var(--tw-rotate)) translate(0)',
          }
        },
        'float-circular-reverse': {
          '0%': {
            transform: 'rotate(var(--tw-rotate)) translate(0)',
          },
          '25%': {
            transform: 'rotate(var(--tw-rotate)) translate(-10px, 10px)',
          },
          '50%': {
            transform: 'rotate(var(--tw-rotate)) translate(-20px, 0)',
          },
          '75%': {
            transform: 'rotate(var(--tw-rotate)) translate(-10px, -10px)',
          },
          '100%': {
            transform: 'rotate(var(--tw-rotate)) translate(0)',
          }
        },
        slideInRight: {
          '0%': {
            opacity: '0',
            transform: 'translateX(-100px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        slideOutLeft: {
          '0%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
          '100%': {
            opacity: '0',
            transform: 'translateX(-100px)',
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'fade-in-up-delay': 'fadeInUp 0.5s ease-out 0.2s',
        'fade-in-up-delay-2': 'fadeInUp 0.5s ease-out 0.4s',
        'fade-in-up-delay-0': 'fadeInUp 0.8s ease-out forwards',
        'fade-in-up-delay-1': 'fadeInUp 0.8s ease-out 0.2s forwards',
        'fade-in-up-delay-2': 'fadeInUp 0.8s ease-out 0.4s forwards',
        'blob': 'blob 4s infinite',
        'gradient-xy': 'gradient-xy 8s ease infinite',
        'grid-movement': 'grid-movement 12s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delay': 'float 6s ease-in-out infinite 2s',
        'float-delay-2': 'float 6s ease-in-out infinite 4s',
        'float-diagonal': 'float-diagonal 8s ease-in-out infinite',
        'float-diagonal-reverse': 'float-diagonal-reverse 8s ease-in-out infinite 1s',
        'float-horizontal': 'float-horizontal 7s ease-in-out infinite 2s',
        'float-horizontal-reverse': 'float-horizontal-reverse 7s ease-in-out infinite',
        'float-circular': 'float-circular 10s linear infinite',
        'float-circular-reverse': 'float-circular-reverse 10s linear infinite 2s',
        'slide-in-right': 'slideInRight 0.8s ease-out forwards',
        'slide-out-left': 'slideOutLeft 0.5s ease-out forwards',
      },
      backgroundImage: {
        'grid-white': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='0.1' fill-rule='evenodd'%3E%3Ccircle cx='1' cy='1' r='1'/%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [animate],
}