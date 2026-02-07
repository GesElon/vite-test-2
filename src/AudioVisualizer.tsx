import { useEffect, useRef } from "react";

type AudioVisualizerProps = {
  audioRef: React.RefObject<HTMLAudioElement>;
}

function compressDataArrayByTwo(dataArray: Uint8Array): Uint8Array {
  const compressedArray = new Uint8Array(dataArray.length/2);
  let index = 0;
  for (let i = 0; i < dataArray.length; i+=2) {
    compressedArray[index] = Math.floor((dataArray[i] + dataArray[i+1]) / 2);
    index++;
  }
  return compressedArray;
}

function AudioVisualizer({ audioRef }: AudioVisualizerProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // const analyzerRef = useRef<AnalyserNode>(() => {
  //   return audioContext.current.createAnalyser();
  // });

  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    if (!analyzerRef.current) {
      analyzerRef.current = audioContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = 32;
      const bufferLength = analyzerRef.current.frequencyBinCount;
      const fullDataArray = new Uint8Array(bufferLength);

      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        canvasRef.current.width = rect.width * 2;
        canvasRef.current.height = rect.height * 2;

        const ctx = canvasRef.current.getContext('2d');

        const barWidth = (canvasRef.current.width) / ((bufferLength*2 - 1) + (bufferLength*2 - 2)) * 2; // spacing will take same width as barWidth
        let barHeight;
        let x;

        const maxBarHeight = canvasRef.current.width * (255 * 2 / 1200)

        function animate() {
          if (!ctx) return;
          if (!canvasRef.current) return;
          if (!analyzerRef.current) return;

          x = 0;
          ctx.restore();
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          analyzerRef.current.getByteFrequencyData(fullDataArray);

          const dataArray = compressDataArrayByTwo(fullDataArray);
          
          ctx.save();
          ctx.translate(canvasRef.current.width/2, -canvasRef.current.height/2);

          // Make visualizer symmetrical

          // Draw center bar
          barHeight = dataArray[0] / 255 * maxBarHeight;
          ctx.fillStyle = 'orange';
          ctx.fillRect(-barWidth/2, canvasRef.current.height - barHeight/2, barWidth, barHeight);
          x += barWidth * 2;
          // Rounded edges
          ctx.fillStyle = 'orange';
          ctx.beginPath();
          ctx.arc(0, canvasRef.current.height - barHeight/2, barWidth/2, 0, Math.PI, true);
          ctx.fill();
          ctx.fillStyle = 'orange';
          ctx.beginPath();
          ctx.arc(0, canvasRef.current.height + barHeight/2, barWidth/2, 0, Math.PI);
          ctx.fill();

          for (let i = 1; i < bufferLength; i++) {
            barHeight = dataArray[i] / 255 * maxBarHeight;
            // Right bar
            ctx.fillStyle = 'orange';
            ctx.fillRect(-barWidth/2 + x, canvasRef.current.height - barHeight/2, barWidth, barHeight);
            // Rounded edges for Right bar
            ctx.fillStyle = 'orange';
            ctx.beginPath();
            ctx.arc(x, canvasRef.current.height - barHeight/2, barWidth/2, 0, Math.PI, true);
            ctx.fill();
            ctx.fillStyle = 'orange';
            ctx.beginPath();
            ctx.arc(x, canvasRef.current.height + barHeight/2, barWidth/2, 0, Math.PI);
            ctx.fill();
            // Left bar
            ctx.fillStyle = 'orange';
            ctx.fillRect(-barWidth/2 - x, canvasRef.current.height - barHeight/2, barWidth, barHeight);
            // Rounded edges for Right bar
            ctx.fillStyle = 'orange';
            ctx.beginPath();
            ctx.arc(-x, canvasRef.current.height - barHeight/2, barWidth/2, 0, Math.PI, true);
            ctx.fill();
            ctx.fillStyle = 'orange';
            ctx.beginPath();
            ctx.arc(-x, canvasRef.current.height + barHeight/2, barWidth/2, 0, Math.PI);
            ctx.fill();

            x += barWidth * 2;
          }
          requestAnimationFrame(animate);
        }
        animate();

        console.log(barWidth)
      }
    }

    if (!audioSourceRef.current) {
      audioSourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      audioSourceRef.current.connect(analyzerRef.current);
      analyzerRef.current.connect(audioContextRef.current.destination);
    }

    // Resume context on user interaction
    const resume = () => audioContextRef.current?.resume();
    window.addEventListener("click", resume);
    return () => {
      window.removeEventListener("click", resume);
    };
  }, [])

  return (
    <canvas ref={canvasRef} className="audio-visualizer-canvas"></canvas>
  );
}

export default AudioVisualizer;