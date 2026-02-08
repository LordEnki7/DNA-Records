import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { Track, Artist } from "@shared/schema";
import { audioEngine } from "@/lib/audio-engine";

interface PlayerTrack extends Track {
  artistName?: string;
}

interface PlayerContextType {
  currentTrack: PlayerTrack | null;
  isPlaying: boolean;
  queue: PlayerTrack[];
  playTrack: (track: PlayerTrack, queue?: PlayerTrack[]) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
}

const PlayerContext = createContext<PlayerContextType>({
  currentTrack: null,
  isPlaying: false,
  queue: [],
  playTrack: () => {},
  togglePlay: () => {},
  nextTrack: () => {},
  prevTrack: () => {},
});

export function usePlayer() {
  return useContext(PlayerContext);
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<PlayerTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<PlayerTrack[]>([]);
  const trackIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (currentTrack && isPlaying) {
      if (trackIdRef.current !== currentTrack.id) {
        audioEngine.start(currentTrack.title, currentTrack.genre);
        trackIdRef.current = currentTrack.id;
      } else if (audioEngine.currentState === "paused") {
        audioEngine.resume();
      } else if (audioEngine.currentState === "stopped") {
        audioEngine.start(currentTrack.title, currentTrack.genre);
      }
    } else if (!isPlaying && audioEngine.currentState === "playing") {
      audioEngine.pause();
    }
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    return () => {
      audioEngine.destroy();
    };
  }, []);

  const playTrack = useCallback((track: PlayerTrack, newQueue?: PlayerTrack[]) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    if (newQueue) setQueue(newQueue);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const nextTrack = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    const idx = queue.findIndex((t) => t.id === currentTrack.id);
    if (idx < queue.length - 1) {
      setCurrentTrack(queue[idx + 1]);
      setIsPlaying(true);
    }
  }, [currentTrack, queue]);

  const prevTrack = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    const idx = queue.findIndex((t) => t.id === currentTrack.id);
    if (idx > 0) {
      setCurrentTrack(queue[idx - 1]);
      setIsPlaying(true);
    }
  }, [currentTrack, queue]);

  return (
    <PlayerContext.Provider
      value={{ currentTrack, isPlaying, queue, playTrack, togglePlay, nextTrack, prevTrack }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MusicPlayerBar() {
  const { currentTrack, isPlaying, togglePlay, nextTrack, prevTrack } = usePlayer();
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const effectiveVolume = isMuted ? 0 : volume / 100;
    audioEngine.setVolume(effectiveVolume);
  }, [volume, isMuted]);

  useEffect(() => {
    if (isPlaying && currentTrack) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= (currentTrack.duration || 240)) {
            nextTrack();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, currentTrack, nextTrack]);

  useEffect(() => {
    setProgress(0);
  }, [currentTrack?.id]);

  if (!currentTrack) return null;

  const duration = currentTrack.duration || 240;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-border/50"
      data-testid="music-player-bar"
    >
      <div className="h-1 w-full bg-muted/30 relative">
        <div
          className="h-full bg-primary transition-all duration-1000"
          style={{ width: `${(progress / duration) * 100}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary))]"
          style={{ left: `${(progress / duration) * 100}%` }}
        />
      </div>

      <div className="flex items-center gap-4 px-4 py-2 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-3 min-w-0 w-1/4">
          <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-muted/30">
            {currentTrack.coverUrl ? (
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-4 h-4 rounded-full border-2 border-primary animate-neon-pulse" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p
              className="text-sm font-medium truncate"
              data-testid="text-now-playing-title"
            >
              {currentTrack.title}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {currentTrack.artistName || "Unknown Artist"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 flex-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={prevTrack}
            data-testid="button-prev-track"
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="default"
            onClick={togglePlay}
            className="rounded-full"
            data-testid="button-play-pause"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={nextTrack}
            data-testid="button-next-track"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums ml-2">
            {formatTime(progress)} / {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center gap-2 w-1/4 justify-end">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsMuted(!isMuted)}
            data-testid="button-mute"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            onValueChange={([v]) => {
              setVolume(v);
              setIsMuted(false);
            }}
            max={100}
            step={1}
            className="w-24"
            data-testid="slider-volume"
          />
        </div>
      </div>
    </div>
  );
}
