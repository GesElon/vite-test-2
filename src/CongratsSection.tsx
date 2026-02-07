import { useEffect } from 'react'
import { motion } from 'framer-motion'

import partyHornMp3 from './assets/audios/party-horn.mp3'

// @ts-ignore
const confetti = require('canvas-confetti');

type CongratsSectionProps = {
  isSessionFinished: boolean
}

const partyHornSfx = new Audio(partyHornMp3);

function CongratsSection({ isSessionFinished }: CongratsSectionProps) {
  const fireConfetti = () => {
    partyHornSfx.currentTime = 0;
    partyHornSfx.play();

    const options = {
      particleCount: 300,
      spread: 70,
      startVelocity: 70,
      ticks: 300
    };
    confetti({
      origin: { x: 0, y: 1 },
      angle: 60,
      ...options
    });
    confetti({
      origin: { x: 1, y: 1 },
      angle: 120,
      ...options
    });
    confetti({
      origin: { y: 1 },
      angle: 90,
      ...options
    });
  }

  useEffect(() => {
    if (!isSessionFinished) return;
    setTimeout(fireConfetti, 1000)
  }, [isSessionFinished]);

  return (
    <motion.div className="congrats-section" style={{ display: isSessionFinished ? 'flex' : 'none' }}>
      <p className="congrats-heading">CONGRATULATIONS YIPPEE 🎉🎉</p>
      <p className="congrats-text">You walked!</p>
      <motion.button className="gradient-btn" onClick={fireConfetti}
        initial={{ scale: 1, y: 3 }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 1.15, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 10 }}
      >
        YAY (POP MORE)
        <p className="dot75-size-font">You might lag tho</p>
      </motion.button>
    </motion.div>
  )
}

export default CongratsSection