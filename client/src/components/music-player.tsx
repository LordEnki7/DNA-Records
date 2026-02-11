import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ListMusic,
  X,
  Trash2,
  Shuffle,
  Repeat,
  ChevronDown,
  Music2,
  SlidersHorizontal,
} from "lucide-react";
import type { Track } from "@shared/schema";
import { audioEngine } from "@/lib/audio-engine";
import { EqualizerPanel } from "@/components/equalizer-panel";

interface PlayerTrack extends Track {
  artistName?: string;
}

interface PlayerContextType {
  currentTrack: PlayerTrack | null;
  isPlaying: boolean;
  queue: PlayerTrack[];
  upNext: PlayerTrack[];
  playTrack: (track: PlayerTrack, queue?: PlayerTrack[]) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  addToQueue: (track: PlayerTrack) => void;
  playNext: (track: PlayerTrack) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  shuffle: boolean;
  toggleShuffle: () => void;
  repeatMode: "off" | "all" | "one";
  cycleRepeat: () => void;
}

const PlayerContext = createContext<PlayerContextType>({
  currentTrack: null,
  isPlaying: false,
  queue: [],
  upNext: [],
  playTrack: () => {},
  togglePlay: () => {},
  nextTrack: () => {},
  prevTrack: () => {},
  addToQueue: () => {},
  playNext: () => {},
  removeFromQueue: () => {},
  clearQueue: () => {},
  shuffle: false,
  toggleShuffle: () => {},
  repeatMode: "off",
  cycleRepeat: () => {},
});

export function usePlayer() {
  return useContext(PlayerContext);
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<PlayerTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<PlayerTrack[]>([]);
  const [upNext, setUpNext] = useState<PlayerTrack[]>([]);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");
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

  const getNextTrack = useCallback((): PlayerTrack | null => {
    if (upNext.length > 0) {
      return upNext[0];
    }
    if (!currentTrack || queue.length === 0) return null;
    const idx = queue.findIndex((t) => t.id === currentTrack.id);
    if (shuffle) {
      const remaining = queue.filter((t) => t.id !== currentTrack.id);
      if (remaining.length === 0) return repeatMode === "all" ? queue[0] : null;
      return remaining[Math.floor(Math.random() * remaining.length)];
    }
    if (idx < queue.length - 1) return queue[idx + 1];
    if (repeatMode === "all") return queue[0];
    return null;
  }, [currentTrack, queue, upNext, shuffle, repeatMode]);

  const nextTrack = useCallback(() => {
    if (repeatMode === "one" && currentTrack) {
      trackIdRef.current = null;
      setCurrentTrack({ ...currentTrack });
      setIsPlaying(true);
      return;
    }
    if (upNext.length > 0) {
      const next = upNext[0];
      setUpNext((prev) => prev.slice(1));
      setCurrentTrack(next);
      setIsPlaying(true);
      return;
    }
    const next = getNextTrack();
    if (next) {
      setCurrentTrack(next);
      setIsPlaying(true);
    }
  }, [currentTrack, upNext, getNextTrack, repeatMode]);

  const prevTrack = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    const idx = queue.findIndex((t) => t.id === currentTrack.id);
    if (idx > 0) {
      setCurrentTrack(queue[idx - 1]);
      setIsPlaying(true);
    } else if (repeatMode === "all") {
      setCurrentTrack(queue[queue.length - 1]);
      setIsPlaying(true);
    }
  }, [currentTrack, queue, repeatMode]);

  const addToQueue = useCallback((track: PlayerTrack) => {
    setUpNext((prev) => [...prev, track]);
  }, []);

  const playNext = useCallback((track: PlayerTrack) => {
    setUpNext((prev) => [track, ...prev]);
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setUpNext((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearQueue = useCallback(() => {
    setUpNext([]);
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle((prev) => !prev);
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeatMode((prev) => (prev === "off" ? "all" : prev === "all" ? "one" : "off"));
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

      if (e.code === "Space") {
        e.preventDefault();
        if (currentTrack) togglePlay();
      } else if (e.code === "ArrowRight" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        nextTrack();
      } else if (e.code === "ArrowLeft" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        prevTrack();
      } else if (e.code === "KeyM") {
        e.preventDefault();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTrack, togglePlay, nextTrack, prevTrack]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        queue,
        upNext,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        addToQueue,
        playNext,
        removeFromQueue,
        clearQueue,
        shuffle,
        toggleShuffle,
        repeatMode,
        cycleRepeat,
      }}
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

function QueuePanel({ onClose }: { onClose: () => void }) {
  const { currentTrack, queue, upNext, removeFromQueue, clearQueue, playTrack } = usePlayer();

  const currentIdx = currentTrack ? queue.findIndex((t) => t.id === currentTrack.id) : -1;
  const autoUpcoming = currentIdx >= 0 ? queue.slice(currentIdx + 1, currentIdx + 6) : [];

  return (
    <div className="absolute bottom-full right-0 mb-2 w-80 max-h-96 overflow-y-auto bg-popover border border-border rounded-md shadow-lg z-50">
      <div className="flex items-center justify-between gap-2 p-3 border-b border-border sticky top-0 bg-popover">
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          <ListMusic className="w-4 h-4 text-primary" />
          Queue
        </h3>
        <div className="flex items-center gap-1">
          {upNext.length > 0 && (
            <Button size="sm" variant="ghost" onClick={clearQueue} data-testid="button-clear-queue">
              <Trash2 className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}
          <Button size="icon" variant="ghost" onClick={onClose} data-testid="button-close-queue">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {currentTrack && (
        <div className="p-2 border-b border-border">
          <p className="text-[10px] tracking-wider text-muted-foreground uppercase font-medium px-2 mb-1">Now Playing</p>
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="w-8 h-8 rounded-md overflow-hidden bg-muted/30 flex-shrink-0">
              {currentTrack.coverUrl ? (
                <img src={currentTrack.coverUrl} alt={currentTrack.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/5">
                  <Music2 className="w-3 h-3 text-primary/40" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate text-primary">{currentTrack.title}</p>
              <p className="text-xs text-muted-foreground truncate">{currentTrack.artistName}</p>
            </div>
          </div>
        </div>
      )}

      {upNext.length > 0 && (
        <div className="p-2 border-b border-border">
          <p className="text-[10px] tracking-wider text-muted-foreground uppercase font-medium px-2 mb-1">Added to Queue</p>
          {upNext.map((track, i) => (
            <div key={`upnext-${i}`} className="flex items-center gap-2 px-2 py-1 hover-elevate rounded-md cursor-pointer group">
              <div className="w-8 h-8 rounded-md overflow-hidden bg-muted/30 flex-shrink-0">
                {track.coverUrl ? (
                  <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/5">
                    <Music2 className="w-3 h-3 text-primary/40" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0" onClick={() => playTrack(track)}>
                <p className="text-sm truncate">{track.title}</p>
                <p className="text-xs text-muted-foreground truncate">{track.artistName}</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeFromQueue(i)}
                data-testid={`button-remove-queue-${i}`}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {autoUpcoming.length > 0 && (
        <div className="p-2">
          <p className="text-[10px] tracking-wider text-muted-foreground uppercase font-medium px-2 mb-1">Up Next</p>
          {autoUpcoming.map((track, i) => (
            <div
              key={`auto-${i}`}
              className="flex items-center gap-2 px-2 py-1 hover-elevate rounded-md cursor-pointer"
              onClick={() => playTrack(track, queue)}
            >
              <div className="w-8 h-8 rounded-md overflow-hidden bg-muted/30 flex-shrink-0">
                {track.coverUrl ? (
                  <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/5">
                    <Music2 className="w-3 h-3 text-primary/40" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{track.title}</p>
                <p className="text-xs text-muted-foreground truncate">{track.artistName}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {upNext.length === 0 && autoUpcoming.length === 0 && (
        <div className="p-6 text-center">
          <p className="text-sm text-muted-foreground">Queue is empty</p>
        </div>
      )}
    </div>
  );
}

export function MusicPlayerBar() {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    prevTrack,
    upNext,
    shuffle,
    toggleShuffle,
    repeatMode,
    cycleRepeat,
  } = usePlayer();
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showEQ, setShowEQ] = useState(false);
  const [expanded, setExpanded] = useState(false);
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
      <div className="h-1 w-full bg-muted/30 relative cursor-pointer" onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        setProgress(Math.round(pct * duration));
      }}>
        <div
          className="h-full bg-primary transition-all duration-1000"
          style={{ width: `${(progress / duration) * 100}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary))]"
          style={{ left: `${(progress / duration) * 100}%` }}
        />
      </div>

      <div className="flex items-center gap-2 sm:gap-4 px-2 sm:px-4 py-2 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-3 min-w-0 w-1/4">
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-md overflow-hidden flex-shrink-0 bg-muted/30 cursor-pointer ring-1 ring-border/30"
            onClick={() => setExpanded(!expanded)}
            data-testid="button-expand-player"
          >
            {currentTrack.coverUrl ? (
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className={`w-full h-full object-cover transition-transform duration-500 ${isPlaying ? "scale-105" : ""}`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className={`w-4 h-4 rounded-full border-2 border-primary ${isPlaying ? "animate-neon-pulse" : ""}`} />
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

        <div className="flex items-center justify-center gap-1 flex-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleShuffle}
            className={`hidden sm:flex toggle-elevate ${shuffle ? "toggle-elevated text-primary" : ""}`}
            data-testid="button-shuffle"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </Button>
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
          <Button
            size="icon"
            variant="ghost"
            onClick={cycleRepeat}
            className={`hidden sm:flex toggle-elevate ${repeatMode !== "off" ? "toggle-elevated text-primary" : ""}`}
            data-testid="button-repeat"
          >
            <Repeat className="w-3.5 h-3.5" />
            {repeatMode === "one" && (
              <span className="absolute text-[8px] font-bold">1</span>
            )}
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums ml-1 hidden sm:inline">
            {formatTime(progress)} / {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 w-1/4 justify-end relative">
          <div className="relative hidden sm:block">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => { setShowEQ(!showEQ); setShowQueue(false); }}
              className={`toggle-elevate ${showEQ ? "toggle-elevated text-primary" : ""}`}
              data-testid="button-toggle-eq"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
            {showEQ && <EqualizerPanel onClose={() => setShowEQ(false)} />}
          </div>
          <div className="relative">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => { setShowQueue(!showQueue); setShowEQ(false); }}
              className={`toggle-elevate ${showQueue ? "toggle-elevated text-primary" : ""}`}
              data-testid="button-toggle-queue"
            >
              <ListMusic className="w-4 h-4" />
            </Button>
            {upNext.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-bold">
                {upNext.length}
              </span>
            )}
            {showQueue && <QueuePanel onClose={() => setShowQueue(false)} />}
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsMuted(!isMuted)}
            className="hidden sm:flex"
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
            className="w-20 hidden sm:flex"
            data-testid="slider-volume"
          />
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border/50 px-4 py-3 max-w-screen-2xl mx-auto">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-md overflow-hidden bg-muted/30 ring-1 ring-primary/20">
                {currentTrack.coverUrl ? (
                  <img src={currentTrack.coverUrl} alt={currentTrack.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/5">
                    <Music2 className="w-6 h-6 text-primary/40" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold">{currentTrack.title}</p>
                <p className="text-sm text-muted-foreground">{currentTrack.artistName}</p>
                <Badge variant="secondary" className="mt-1 text-[10px] no-default-active-elevate">{currentTrack.genre}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="text-center">
                <p className="font-medium text-foreground tabular-nums">{formatTime(progress)}</p>
                <p>Elapsed</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground tabular-nums">{formatTime(duration - progress)}</p>
                <p>Remaining</p>
              </div>
              <div className="flex gap-1 sm:hidden">
                <Button size="icon" variant="ghost" onClick={toggleShuffle} className={`toggle-elevate ${shuffle ? "toggle-elevated text-primary" : ""}`}>
                  <Shuffle className="w-3.5 h-3.5" />
                </Button>
                <Button size="icon" variant="ghost" onClick={cycleRepeat} className={`toggle-elevate ${repeatMode !== "off" ? "toggle-elevated text-primary" : ""}`}>
                  <Repeat className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <Button size="icon" variant="ghost" onClick={() => setExpanded(false)}>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            Keyboard: Space to play/pause, Left/Right arrows to skip tracks
          </p>
        </div>
      )}
    </div>
  );
}
