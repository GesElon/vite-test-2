import React, { useState, useEffect, useRef } from 'react'
import { motion, useAnimate, useAnimation } from 'framer-motion'

import AudioVisualizer from './AudioVisualizer'
import AudioControls from './AudioControls'
import type { MusicOutput, MusicOutputs } from './MusicFilesInput'
import CongratsSection from './CongratsSection'

import completionNotifyMp3 from './assets/audios/completion-notify.mp3'
import fastWalkNotifyMp3 from './assets/audios/fast-walk-notify.mp3'
import slowWalkNotifyMp3 from './assets/audios/slow-walk-notify.mp3'

type SessionSectionProps = {
  isSessionStarted: boolean
  fastWalkDurationInputRef: React.RefObject<HTMLInputElement | null>
  slowWalkDurationInputRef: React.RefObject<HTMLInputElement | null>
  numCyclesInputRef: React.RefObject<HTMLInputElement | null>
  fastWalkMusicInfosRef: React.RefObject<MusicOutputs>
  slowWalkMusicInfosRef: React.RefObject<MusicOutputs>
}

function formatTime(secs: number) {
  const seconds = Math.floor(secs % 60);
  const minutes = Math.floor(secs / 60);
  return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds }`
}

function fadeOut(audio: HTMLAudioElement, fadeSeconds: number) {
  const decrement = fadeSeconds * 0.01;
  const interval = setInterval(() => {
    if (audio.volume > decrement) {
      audio.volume -= decrement;
    } else {
      audio.volume = 0;
      audio.pause();
      clearInterval(interval);
    }
  }, 10);
};

function SessionSection({
  isSessionStarted,
  fastWalkDurationInputRef,
  slowWalkDurationInputRef,
  numCyclesInputRef,
  fastWalkMusicInfosRef,
  slowWalkMusicInfosRef
}: SessionSectionProps) {
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  useEffect(() => {
    audioRef.current.loop = true;
  }, []);

  const controls = useAnimation();
  const [scope, animate] = useAnimate();

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const currentPhaseRef = useRef<'fast' | 'slow'>('fast');
  const currentCycleRef = useRef<number>(1);
  const [currentMusicInfo, setCurrentMusicInfo] = useState<Partial<MusicOutput>>({});

  const [isSessionFinished, setIsSessionFinished] = useState<boolean>(false);

  const phaseProgressDisplayRef = useRef<HTMLParagraphElement>(null);

  const fastWalkNotifyRef = useRef<HTMLAudioElement>(null);
  const slowWalkNotifyRef = useRef<HTMLAudioElement>(null);
  const completionNotifyRef = useRef<HTMLAudioElement>(null);
  
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }

    setIsPlaying(prev => !prev);
  }

  const switchAudio = (audioUrl: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    audio.src = audioUrl;
    audio.play();
  }

  useEffect(() => {
    animate([
      ['.session-section', { opacity: 0 }, { duration: 0 }]
    ]);
  }, []);

  useEffect(() => {
    if (!isSessionStarted) return; // to prevent calling when switching to false

    const handleSessionFinished = async () => {
      await animate([
        ['.session-section', { opacity: 0 }, { duration: 1 }]
      ]);
      setIsSessionFinished(true);
    }
    
    const run = async () => {
      await controls.start({ backdropFilter: 'blur(100px)', transition: { duration: 1 } });
      await controls.start({ backgroundColor: 'rgba(255, 255, 255, 1)', transition: { duration: 0.5 } });
      await animate([
        ['.session-section', { opacity: 1 }, { duration: 0.5 }]
      ]);
      controls.set({ pointerEvents: 'all' });

      const fastWalkDuration = (Number(fastWalkDurationInputRef.current!.value) || 1) * 60; // mins to secs
      const slowWalkDuration = (Number(slowWalkDurationInputRef.current!.value) || 1) * 60; // mins to secs
      const numCycles = Number(numCyclesInputRef.current!.value) || 1;
      const fastWalkMusicInfos = fastWalkMusicInfosRef.current;
      const slowWalkMusicInfos = slowWalkMusicInfosRef.current;

      // Initialize values
      currentCycleRef.current = 0;
      currentPhaseRef.current = 'slow';

      const beginNextPhase = () => {
        // Update displays info 
        if (currentPhaseRef.current === 'slow') {
          currentCycleRef.current++;
          currentPhaseRef.current = 'fast';
        } else {
          currentPhaseRef.current = 'slow';
        }

        // Begin phase after advancing info
        audioRef.current.volume = 1;

        const phaseMusicInfos = (currentPhaseRef.current === 'fast' ? fastWalkMusicInfos : slowWalkMusicInfos)
        const currentMusicInfo = phaseMusicInfos[(currentCycleRef.current - 1) % phaseMusicInfos.length];
        setCurrentMusicInfo(currentMusicInfo);

        const duration = (currentPhaseRef.current === 'fast' ? fastWalkDuration : slowWalkDuration);

        const phaseProgressDisplay = phaseProgressDisplayRef.current;
        let elapsedSeconds = 0;
        let _lastTick: number | null = null;
        const progressInterval = setInterval(() => {
          if (audioRef.current.paused) {
            _lastTick = null;
            return;
          }
          const now = Date.now();
          const secondsPassed = (now - (_lastTick || now)) / 1000;
          _lastTick = now;
          elapsedSeconds += secondsPassed;
          phaseProgressDisplay!.innerHTML = formatTime(elapsedSeconds);
          // Duration reached, Phase completed
          if (elapsedSeconds > duration) {
            clearInterval(progressInterval);
            fadeOut(audioRef.current, 1);
            if (currentCycleRef.current >= numCycles && currentPhaseRef.current === 'slow') {
              setTimeout(() => completionNotifyRef.current!.play(), 750)
              setTimeout(handleSessionFinished, 2000);
            } else {
              if (currentPhaseRef.current === 'fast') {
                setTimeout(() => slowWalkNotifyRef.current!.play(), 750)
              } else {
                setTimeout(() => fastWalkNotifyRef.current!.play(), 750)
              }
              setTimeout(beginNextPhase, 2000);
            }
          }
        }, 10);
        switchAudio(URL.createObjectURL(currentMusicInfo.file));
      }

      // Start progressing through session
      beginNextPhase();
      togglePlay();
    }

    run()
  }, [isSessionStarted]);

  return (
    <motion.div className="session-section-ctn" ref={scope} animate={controls} >
      <div className="session-section">
        <div className="session-section-bg" style={{ backgroundImage: `url(${currentMusicInfo.pictureUrl})` }}></div>
        <AudioControls togglePlay={togglePlay} isPlaying={isPlaying} />
        <div className="music-info-display">
          <div className="picture-disk" style={{ backgroundImage: `url(${currentMusicInfo.pictureUrl})` }}></div>
          <p className='music-title'>{currentMusicInfo.title}</p>
          <p className='music-artists'>{currentMusicInfo.artists}</p>
        </div>
        <AudioVisualizer audioRef={audioRef} />
        <div className="progress-info-display">
          <span>Phase Progress</span>
          <p ref={phaseProgressDisplayRef} className='phase-progress-display'>0:00</p>
          <p className='cycle-display'>CYCLE {currentCycleRef.current}</p>
          <p className='phase-display'>{currentPhaseRef.current === 'fast' ? 'FAST' : 'SLOW' } WALKING</p>
        </div>
      </div>
      <CongratsSection isSessionFinished={isSessionFinished} />
      <audio ref={completionNotifyRef} src={completionNotifyMp3}></audio>
      <audio ref={fastWalkNotifyRef} src={fastWalkNotifyMp3}></audio>
      <audio ref={slowWalkNotifyRef} src={slowWalkNotifyMp3}></audio>
    </motion.div>
  )
}

export default SessionSection