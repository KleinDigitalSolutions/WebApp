import { AnimatePresence } from 'framer-motion'
import ActiveChallenges from './ActiveChallenges'
import type { ActiveChallengesProps } from './ActiveChallenges'

export default function ActiveChallengesMotion(props: ActiveChallengesProps) {
  return (
    <AnimatePresence initial={false}>
      <ActiveChallenges {...props} />
    </AnimatePresence>
  )
}
