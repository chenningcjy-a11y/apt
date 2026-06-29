import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Play, Pause } from 'lucide-react';

export default function App() {
  const [stage, setStage] = useState<'prompt' | 'playing'>('prompt');
  const [songData, setSongData] = useState<{ cover: string; audio: string } | null>({
    cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/2d/1a/7d/2d1a7d91-587e-0ceb-d434-327bd66d9e86/075679628312.jpg/1024x1024bb.jpg',
    audio: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/22/8a/a1/228aa1a0-cbfd-ac14-ae99-09ca59bcc80b/mzaf_12121445588963961343.plus.aac.p.m4a'
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const surpriseAudiosRef = useRef<HTMLAudioElement[]>([]);

  useEffect(() => {
    // Media URLs are hardcoded to avoid relying on external APIs that might be blocked or slow.
    // Apple's media CDNs (mzstatic, itunes-assets) are generally directly accessible in mainland China.
  }, []);

  const handleAccept = () => {
    setStage('playing');
    setIsPlaying(true);
    if (audioRef.current && songData?.audio) {
      audioRef.current.play().catch(err => console.warn("Autoplay blocked or failed:", err));
    }
  };

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        surpriseAudiosRef.current.forEach(audio => {
          audio.pause();
        });
      } else {
        audioRef.current.play().catch(err => console.warn("Play failed:", err));
        surpriseAudiosRef.current.forEach(audio => {
          audio.play().catch(err => console.warn("Surprise play failed:", err));
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const playSurpriseAudio = () => {
    if (songData?.audio) {
      const surpriseAudio = new Audio(songData.audio);
      surpriseAudiosRef.current.push(surpriseAudio);
      surpriseAudio.play().catch(err => console.warn("Surprise play failed:", err));
      
      surpriseAudio.onended = () => {
        surpriseAudiosRef.current = surpriseAudiosRef.current.filter(a => a !== surpriseAudio);
      };
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans overflow-hidden relative flex flex-col items-center justify-center">
      {/* Hidden audio element always rendered to avoid mount issues */}
      <audio
        ref={audioRef}
        {...(songData?.audio ? { src: songData.audio } : {})}
        loop
        onError={(e) => {
          e.stopPropagation();
          console.warn("Audio error ignored");
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Frosted Glass Theme Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-rose-500 rounded-full blur-[120px] opacity-40"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-pink-400 rounded-full blur-[100px] opacity-30"></div>
        <div className="absolute inset-0 bg-[#f43f5e]/10"></div>
      </div>

      <AnimatePresence mode="wait">
        {stage === 'prompt' ? (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex flex-col items-center justify-center w-full"
          >
            <div className="bg-white/5 backdrop-blur-2xl px-8 py-12 md:p-16 rounded-3xl md:rounded-[40px] border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.5)] flex flex-col items-center text-center max-w-sm w-full mx-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
              
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                className="relative"
              >
                <div className="absolute inset-0 bg-white/10 blur-2xl rounded-full scale-150" />
                <Gift className="w-28 h-28 text-white relative z-10 mb-8" strokeWidth={1.5} />
              </motion.div>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter mb-8 md:mb-10 text-white drop-shadow-md">
                是否接收礼物？
              </h1>
              
              <button
                onClick={handleAccept}
                className="group relative px-8 py-3 sm:px-10 sm:py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full text-lg sm:text-xl font-bold shadow-2xl hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <span className="relative z-10 flex items-center gap-2">
                  接收礼物
                </span>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer"
            onClick={playSurpriseAudio}
          >
            {/* Background Cover */}
            {songData?.cover && (
              <motion.div
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.3 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{ backgroundImage: `url(${songData.cover})` }}
              />
            )}
            
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 z-0" />

            {/* Surprise Hint */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="absolute top-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
            >
              <div className="px-6 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-xl flex items-center gap-2 animate-pulse">
                <span className="text-sm font-medium tracking-wide text-white">点击屏幕有惊喜 ✨</span>
              </div>
            </motion.div>

            {/* Main Content inside Frosted Glass Panel */}
            <div className="relative z-10 flex flex-col items-center w-[90%] sm:w-[80%] max-w-[500px] px-6 py-10 md:p-12 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl md:rounded-[40px] shadow-[0_32px_64px_rgba(0,0,0,0.5)] mx-4 text-center">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 1, ease: 'easeOut' }}
                className="w-full flex flex-col items-center"
              >
                {/* Vinyl Record / CD effect */}
                <div 
                  className={`relative w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 mb-8 md:mb-10 rounded-full overflow-hidden border-4 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-transform duration-1000 ${isPlaying ? 'animate-[spin_12s_linear_infinite]' : ''}`}
                >
                  {songData?.cover ? (
                    <img src={songData.cover} alt="APT. Cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-rose-900/50 flex items-center justify-center backdrop-blur-md">
                      <span className="text-white/50 text-sm">Loading Cover...</span>
                    </div>
                  )}
                  {/* CD center hole */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 bg-black/80 rounded-full border-2 border-white/10 shadow-inner flex items-center justify-center backdrop-blur-sm">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white/20 rounded-full" />
                  </div>
                  {/* Glossy reflection */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none" />
                </div>

                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-2 md:mb-3 text-white tracking-tighter drop-shadow-lg">
                  APT.
                </h2>
                <p className="text-lg sm:text-xl md:text-2xl text-rose-400 font-bold tracking-wide mb-8 md:mb-12">
                  ROSÉ & Bruno Mars
                </p>

                <button
                  onClick={togglePlay}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 sm:w-8 sm:h-8 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-current ml-0.5 sm:ml-1" />
                  )}
                </button>
              </motion.div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
