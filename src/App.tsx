import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import './App.css'

import MusicFilesInput, { type MusicOutputs } from './MusicFilesInput'
import SessionSection from './SessionSection'

function App() {
  const fastWalkDurationInputRef = useRef<HTMLInputElement>(null); // minutes
  const slowWalkDurationInputRef = useRef<HTMLInputElement>(null); // minutes
  const numCyclesInputRef = useRef<HTMLInputElement>(null); // number of cycles
  const fastWalkMusicInfosRef = useRef<MusicOutputs>([]);
  const slowWalkMusicInfosRef = useRef<MusicOutputs>([]);

  console.log('render')

  const [isSessionStarted, setIsSessionStarted] = useState<boolean>(false);

  const handleSession = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    (e.target as HTMLButtonElement).disabled = true;
    setIsSessionStarted(true);
  }

  return (
    <>
      <div className="app-ctn">
        <div className="header">
          <p className="title">Interval Walking</p>
          <span>Alternation between fast and slow walk between fixed time interval!</span>
        </div>
        <div className="session-options">
          <div className="three-column-grid">
            <label htmlFor="fast-walk-duration-input">
              <span>Fast Walk</span>
            </label>
            <input type="number" ref={fastWalkDurationInputRef} id="fast-walk-duration-input" defaultValue={3} />
            <span>min(s)</span>
            <label htmlFor="slow-walk-duration-input">
              <span>Slow Walk</span>
            </label>
            <input type="number" ref={slowWalkDurationInputRef} id="slow-walk-duration-input" defaultValue={3} />
            <span>min(s)</span>
            <label htmlFor="num-cycles-input">
              <span>Number of Cycles</span>
            </label>
            <input type="number" ref={numCyclesInputRef} id="num-cycles-input" defaultValue={5} />
            <span>cycle(s)</span>
          </div>
          <span className="section-separator"></span>
          <p>Each music is played for each phase</p>
          <h3 className='section-title'>Fast Walk Music</h3>
          <MusicFilesInput outputsRef={fastWalkMusicInfosRef} />
          <h3 className='section-title'>Slow Walk Music</h3>
          <MusicFilesInput outputsRef={slowWalkMusicInfosRef} />
          <motion.button className="start-btn gradient-btn"
            onClick={handleSession}
            initial={{ scale: 1, y: 3 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 1.15, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 10 }}
          >
            Start
          </motion.button>
        </div>
      </div>
      <SessionSection
        isSessionStarted={isSessionStarted}
        fastWalkDurationInputRef={fastWalkDurationInputRef}
        slowWalkDurationInputRef={slowWalkDurationInputRef}
        numCyclesInputRef={numCyclesInputRef}
        fastWalkMusicInfosRef={fastWalkMusicInfosRef}
        slowWalkMusicInfosRef={slowWalkMusicInfosRef}
      />
    </>
  )
}

export default App
