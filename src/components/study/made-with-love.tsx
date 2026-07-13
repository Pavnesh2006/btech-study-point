'use client'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

export function MadeWithLove() {
  return (
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span>Made with</span>
      <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }} className="inline-flex">
        <Heart className="size-3 fill-rose-500 text-rose-500" />
      </motion.span>
      <span>by</span>
      <motion.span animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} className="font-semibold bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, oklch(0.7 0.14 190), oklch(0.8 0.15 175), oklch(0.65 0.15 200), oklch(0.7 0.14 190))', backgroundSize: '200% auto' }}>Pavnesh</motion.span>
    </motion.span>
  )
}
