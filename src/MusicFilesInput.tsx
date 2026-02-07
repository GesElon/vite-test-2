import React, { useState } from 'react'
import { parseBlob } from 'music-metadata'
import { AnimatePresence, motion } from 'framer-motion'

import picturePlaceholder from './assets/picture-placeholder.png'

export type MusicOutput = {
  id: any,
  file: File,
  title: string,
  artists: string,
  pictureUrl: string
}

export type MusicOutputs = Array<MusicOutput>

type MusicFilesInputProps = {
  outputsRef: React.RefObject<MusicOutputs>
}

// Just for the picture extracted from music-metadata parseBlob()
function createDataUrlFromUInt8(uint8Array: Uint8Array, dataFormat: string): string {
  let base64String = '';
  for (let i = 0; i < uint8Array.length; i++) {
    base64String += String.fromCharCode(uint8Array[i]);
  }
  return `data:${dataFormat};base64,${window.btoa(base64String)}`;
}

function MusicFilesInput({ outputsRef }: MusicFilesInputProps) {
  const [outputs, setOutputs] = useState<MusicOutputs>([]);

  outputsRef.current = outputs

  const musicFileItems: Array<React.ReactElement> = []
  outputs.forEach((musicOutput, i) => {
    musicFileItems.push(
      <motion.div key={musicOutput.id} className="music-file-item"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: i * 0.26 } }}
        transition={{ ease: 'easeInOut', duration: 0.13 }}
        exit={{ width: 0, opacity: 0 }}
      >
        <img src={musicOutput.pictureUrl} alt={musicOutput.title} />
        <button className="remove-file-btn" onClick={() => {
          setOutputs(o => o.filter(output => output.id !== musicOutput.id))
        }}></button>
      </motion.div>
    )
  });

  return (
    <div className="music-files-input">
      <label className="add-file-button">
        <input type="file" multiple accept="audio/*" onChange={async (e) => {
          const files = e.target.files;
          if (!files) return;

          const musicOutputs: MusicOutputs = [];
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const metadata = (await parseBlob(file)).common;
            musicOutputs.push({
              id: new Date().getTime(),
              file: file,
              title: metadata.title || file.name || 'Unknown Title',
              artists: metadata.artists ? metadata.artists.join(', ') : '',
              pictureUrl: metadata.picture ? createDataUrlFromUInt8(metadata.picture[0].data, metadata.picture[0].format) : picturePlaceholder
            });
          }

          e.target.value = ''
          setOutputs(o => [...o, ...musicOutputs]);
        }} />
      </label>
      <div className="vertical-separator"></div>
      <div className="music-file-list">
        <AnimatePresence>
          {musicFileItems}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default MusicFilesInput