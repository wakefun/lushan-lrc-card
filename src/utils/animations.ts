export const PHYSICS_HEAVY = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 40,
  mass: 1.5
}

export const PHYSICS_BRUSH = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 25,
  mass: 0.8
}

export const CARD_VARIANTS = {
  initial: {
    scale: 0.95,
    opacity: 0,
    y: 20,
    filter: 'blur(4px)'
  },
  animate: {
    scale: 1,
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { ...PHYSICS_HEAVY, delay: 0.05 }
  },
  exit: {
    scale: 0.95,
    opacity: 0,
    filter: 'blur(6px)',
    transition: { duration: 0.25 }
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 }
  }
}

export const MOUNTAIN_VARIANTS = {
  initial: { opacity: 0, y: 30, scale: 0.9 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...PHYSICS_BRUSH, delay: i * 0.06 }
  }),
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.98 }
}
