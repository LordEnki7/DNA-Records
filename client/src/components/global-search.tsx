import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search, Music2, Headphones } from "lucide-react";
import { Link } from "wouter";
import type { Artist, Track } from "@shared/schema";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data } = useQuery<{ artists: Artist[]; tracks: Track[] }>({
    queryKey: [`/api/search?q=${encodeURIComponent(query)}`],
    enabled: query.trim().length > 0,
  });

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const hasResults = data && (data.artists.length > 0 || data.tracks.length > 0);

  return (
    <div ref={ref} className="relative flex-1 max-w-sm">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search artists, tracks..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => query.trim() && setOpen(true)}
        className="pl-8 h-8 text-sm"
        data-testid="input-global-search"
      />
      {open && query.trim() && hasResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 overflow-hidden max-h-80 overflow-y-auto">
          {data.artists.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] tracking-wider text-muted-foreground uppercase font-medium">
                Artists
              </div>
              {data.artists.map((artist) => (
                <Link key={artist.id} href={`/artist/${artist.id}`}>
                  <div
                    className="flex items-center gap-2.5 px-3 py-2 hover-elevate cursor-pointer"
                    onClick={() => { setOpen(false); setQuery(""); }}
                    data-testid={`search-result-artist-${artist.id}`}
                  >
                    <div className="w-8 h-8 rounded-md overflow-hidden bg-muted/30 flex-shrink-0">
                      {artist.avatarUrl ? (
                        <img src={artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5">
                          <Headphones className="w-3.5 h-3.5 text-primary/40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{artist.name}</p>
                      <p className="text-xs text-muted-foreground">{artist.genre}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {data.tracks.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] tracking-wider text-muted-foreground uppercase font-medium border-t border-border">
                Tracks
              </div>
              {data.tracks.map((track) => (
                <Link key={track.id} href={`/artist/${track.artistId}`}>
                  <div
                    className="flex items-center gap-2.5 px-3 py-2 hover-elevate cursor-pointer"
                    onClick={() => { setOpen(false); setQuery(""); }}
                    data-testid={`search-result-track-${track.id}`}
                  >
                    <div className="w-8 h-8 rounded-md overflow-hidden bg-muted/30 flex-shrink-0">
                      {track.coverUrl ? (
                        <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5">
                          <Music2 className="w-3.5 h-3.5 text-primary/40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{track.title}</p>
                      <p className="text-xs text-muted-foreground">{track.genre}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
      {open && query.trim() && !hasResults && data && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 p-4 text-center">
          <p className="text-sm text-muted-foreground">No results found</p>
        </div>
      )}
    </div>
  );
}
