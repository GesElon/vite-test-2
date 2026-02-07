import { useRef } from 'react'
import { motion } from 'framer-motion'

import playSvg from './assets/play-solid-full.svg?url'
import pauseSvg from './assets/pause-solid-full.svg?url'

type AudioControlsProps = {
  togglePlay: () => void
  isPlaying: boolean
}

const AudioControls = ({ togglePlay, isPlaying }: AudioControlsProps) => {
  const playButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <motion.button className="audio-play-btn" ref={playButtonRef} onClick={togglePlay}
        style={{ backgroundImage: `url("${isPlaying ? pauseSvg : playSvg}")` }}
        initial={{ scale: 1, x: '-50%', y: 3 }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 1.15, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 10 }}
      >
      </motion.button>
    </>
  )
}

export default AudioControls