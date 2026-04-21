interface BadgeProps {
  label: string
  status: 'pendiente' | 'activo' | 'completado' | 'rechazado'
}

export default function Badge({ label, status }: BadgeProps) {
  const styles = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    activo: 'bg-green-100 text-green-800',
    completado: 'bg-blue-100 text-blue-800',
    rechazado: 'bg-red-100 text-red-800',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {label}
    </span>
  )
}