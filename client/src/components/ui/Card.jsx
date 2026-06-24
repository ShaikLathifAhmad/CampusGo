export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-surface rounded-xl2 border border-border shadow-card card-hover overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

export function CardImage({ src, alt }) {
  return (
    <div className="h-44 overflow-hidden">
      <img src={src} alt={alt} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
    </div>
  )
}

export function CardBody({ children, className = '' }) {
  return <div className={`p-5 ${className}`}>{children}</div>
}

export function CardTag({ children }) {
  return (
    <span className="inline-block mt-3 text-xs font-semibold px-3 py-1 rounded-full bg-surface-2 text-secondary border border-border">
      {children}
    </span>
  )
}
