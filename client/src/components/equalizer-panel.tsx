import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { X, RotateCcw } from "lucide-react";
import { audioEngine, AudioEngine } from "@/lib/audio-engine";

const EQ_PRESETS: Record<string, number[]> = {
  Flat: [0, 0, 0, 0, 0],
  "Bass Boost": [6, 4, 0, 0, 0],
  "Treble Boost": [0, 0, 0, 3, 6],
  "V-Shape": [5, 2, -2, 2, 5],
  "Vocal Boost": [0, 0, 4, 3, 0],
  Electronic: [4, 2, 0, 1, 3],
  "Late Night": [-2, 0, 2, 0, -2],
};

export function EqualizerPanel({ onClose }: { onClose: () => void }) {
  const [gains, setGains] = useState<number[]>(audioEngine.getEQGains());
  const [activePreset, setActivePreset] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("echoforge-eq");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setGains(parsed);
        parsed.forEach((g: number, i: number) => audioEngine.applyEQ(i, g));
      } catch {}
    }
  }, []);

  const handleGainChange = (index: number, value: number) => {
    const newGains = [...gains];
    newGains[index] = value;
    setGains(newGains);
    audioEngine.applyEQ(index, value);
    setActivePreset(null);
    localStorage.setItem("echoforge-eq", JSON.stringify(newGains));
  };

  const applyPreset = (name: string) => {
    const preset = EQ_PRESETS[name];
    if (!preset) return;
    setGains([...preset]);
    preset.forEach((g, i) => audioEngine.applyEQ(i, g));
    setActivePreset(name);
    localStorage.setItem("echoforge-eq", JSON.stringify(preset));
  };

  const resetEQ = () => {
    audioEngine.resetEQ();
    setGains([0, 0, 0, 0, 0]);
    setActivePreset("Flat");
    localStorage.setItem("echoforge-eq", JSON.stringify([0, 0, 0, 0, 0]));
  };

  return (
    <div className="absolute bottom-full right-0 mb-2 w-72 bg-popover border border-border rounded-md shadow-lg z-50">
      <div className="flex items-center justify-between gap-2 p-3 border-b border-border">
        <h3 className="text-sm font-semibold">Equalizer</h3>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={resetEQ} data-testid="button-reset-eq">
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
          <Button size="icon" variant="ghost" onClick={onClose} data-testid="button-close-eq">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-3">
        <div className="flex flex-wrap gap-1.5 mb-4">
          {Object.keys(EQ_PRESETS).map((name) => (
            <Button
              key={name}
              size="sm"
              variant={activePreset === name ? "default" : "outline"}
              onClick={() => applyPreset(name)}
              className="text-xs h-7"
              data-testid={`button-eq-preset-${name.toLowerCase().replace(/\s/g, "-")}`}
            >
              {name}
            </Button>
          ))}
        </div>

        <div className="flex justify-between gap-2 h-40">
          {AudioEngine.EQ_LABELS.map((label, i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <span className="text-[9px] text-muted-foreground tabular-nums font-mono">
                {gains[i] > 0 ? "+" : ""}{gains[i]}
              </span>
              <div className="flex-1 flex items-center">
                <Slider
                  orientation="vertical"
                  value={[gains[i]]}
                  onValueChange={([v]) => handleGainChange(i, v)}
                  min={-12}
                  max={12}
                  step={1}
                  className="h-full"
                  data-testid={`slider-eq-${i}`}
                />
              </div>
              <span className="text-[9px] text-muted-foreground whitespace-nowrap">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
