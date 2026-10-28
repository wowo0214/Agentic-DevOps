import { UsersThreeIcon } from '@phosphor-icons/react'
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/avatar'

// Telegram's peer colors: every person or group gets one of these gradients, picked from its name.
const GRADIENTS = [
  ['#ff885e', '#ff516a'],
  ['#ffcd6a', '#ffa85c'],
  ['#82b1ff', '#665fff'],
  ['#a0de7e', '#54cb68'],
  ['#53edd6', '#28c9b7'],
  ['#72d5fd', '#2a9ef1'],
  ['#e0a2f3', '#d669ed'],
]

function gradientOf(name: string) {
  let sum = 0
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i)
  const [from, to] = GRADIENTS[sum % GRADIENTS.length]
  return `linear-gradient(${from}, ${to})`
}

// A person shows their picture or first letter; a group shows a group icon. `xl` is the 54px size of Telegram's chat list.
export function ChatAvatar({
  name,
  image,
  group = false,
  size,
}: {
  name: string
  image?: string | null
  group?: boolean
  size?: 'default' | 'sm' | 'lg' | 'xl'
}) {
  const xl = size === 'xl'
  return (
    <Avatar size={xl ? undefined : size} className={xl ? 'size-[54px]' : ''}>
      {image && <AvatarImage src={image} alt="" />}
      <AvatarFallback
        className={`font-medium text-white ${xl ? 'text-xl' : ''}`}
        style={{ background: gradientOf(name) }}
      >
        {group ? <UsersThreeIcon /> : name.slice(0, 1)}
      </AvatarFallback>
    </Avatar>
  )
}
