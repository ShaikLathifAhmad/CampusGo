/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:         'var(--color-primary)',
        'primary-dark':  'var(--color-primary-dark)',
        'primary-light': 'var(--color-primary-light)',
        secondary:       'var(--color-secondary)',
        accent:          'var(--color-accent)',
        'accent-dark':   'var(--color-accent-dark)',
        'accent-glow':   'var(--color-accent-glow)',
        surface:         'var(--color-surface)',
        'surface-2':     'var(--color-surface-2)',
        border:          'var(--color-border)',
        glass:           'var(--color-glass)',
        'text-primary':  'var(--color-text-primary)',
        'text-secondary':'var(--color-text-secondary)',
        'text-muted':    'var(--color-text-muted)',
        bg:              'var(--color-bg)',
        'bg-section':    'var(--color-bg-section)',
        success:         'var(--color-success)',
        error:           'var(--color-error)',
        warning:         'var(--color-warning)',
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        nav:  'var(--shadow-nav)',
        btn:  'var(--shadow-btn)',
        glow: 'var(--shadow-glow)',
      },
      borderRadius: {
        sm:  'var(--radius-sm)',
        md:  'var(--radius-md)',
        lg2: 'var(--radius-lg)',
        xl2: 'var(--radius-xl)',
      },
      transitionTimingFunction: {
        fast:   'cubic-bezier(0.4,0,0.2,1)',
        smooth: 'cubic-bezier(0.4,0,0.2,1)',
      }
    }
  },
  plugins: []
}
