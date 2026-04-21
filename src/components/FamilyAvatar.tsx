interface FamilyAvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
}

export default function FamilyAvatar({ name, size = 'md' }: FamilyAvatarProps) {
  const initials = name.slice(0, 2).toUpperCase()

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
  }

  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-yellow-500',
    'bg-pink-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-red-500',
  ]

  const colorIndex = name.charCodeAt(0) % colors.length

  return (
    <div className={`${sizes[size]} ${colors[colorIndex]} rounded-full flex items-center justify-center text-white font-semibold`}>
      {initials}
    </div>
  )
}