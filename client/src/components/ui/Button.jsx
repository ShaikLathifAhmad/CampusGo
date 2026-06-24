export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed'

  const variants = {
    primary:   'bg-secondary text-white hover:opacity-90 focus:ring-secondary shadow-btn px-6 py-3',
    outline:   'border-2 border-secondary text-secondary hover:bg-secondary hover:text-white focus:ring-secondary px-6 py-3',
    ghost:     'text-text-secondary hover:text-text-primary hover:bg-surface-2 px-4 py-2',
    danger:    'bg-error text-white hover:opacity-90 focus:ring-error px-6 py-3',
    hero:      'bg-accent text-primary-dark font-bold hover:bg-accent-dark focus:ring-accent px-8 py-4 text-base rounded-xl2 shadow-btn',
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
