import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, TrendingUp, BarChart3, Users } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { Artist, RevenueDaily } from "@shared/schema";

type RevenueSummary = {
  artistId: string;
  totalStreams: number;
  totalRevenue: number;
};

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AdminRevenue() {
  const [selectedArtistId, setSelectedArtistId] = useState<string>("");

  const { data: artists = [], isLoading: artistsLoading } = useQuery<Artist[]>({
    queryKey: ["/api/artists"],
  });

  const { data: revenueData = [], isLoading: revenueLoading } = useQuery<RevenueDaily[]>({
    queryKey: ["/api/admin/revenue"],
  });

  const { data: summaryData = [], isLoading: summaryLoading } = useQuery<RevenueSummary[]>({
    queryKey: ["/api/admin/revenue/summary"],
  });

  const { data: artistRevenueData = [] } = useQuery<RevenueDaily[]>({
    queryKey: ["/api/admin/revenue", `?artistId=${selectedArtistId}`],
    queryFn: async () => {
      const res = await fetch(`/api/admin/revenue?artistId=${selectedArtistId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch artist revenue");
      return res.json();
    },
    enabled: !!selectedArtistId,
  });

  const artistMap = useMemo(() => {
    const map = new Map<string, Artist>();
    artists.forEach((a) => map.set(a.id, a));
    return map;
  }, [artists]);

  const totalRevenue = useMemo(
    () => summaryData.reduce((sum, s) => sum + (s.totalRevenue || 0), 0),
    [summaryData]
  );

  const totalStreams = useMemo(
    () => summaryData.reduce((sum, s) => sum + (s.totalStreams || 0), 0),
    [summaryData]
  );

  const avgRevenuePerStream = totalStreams > 0 ? totalRevenue / totalStreams : 0;

  const activeArtists = useMemo(
    () => new Set(summaryData.map((s) => s.artistId)).size,
    [summaryData]
  );

  const dailyChartData = useMemo(() => {
    const byDate = new Map<string, number>();
    revenueData.forEach((r) => {
      const existing = byDate.get(r.date) || 0;
      byDate.set(r.date, existing + (r.revenue || 0));
    });
    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, revenue]) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: revenue / 100,
      }));
  }, [revenueData]);

  const artistChartData = useMemo(() => {
    const byDate = new Map<string, number>();
    artistRevenueData.forEach((r) => {
      const existing = byDate.get(r.date) || 0;
      byDate.set(r.date, existing + (r.revenue || 0));
    });
    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, revenue]) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: revenue / 100,
      }));
  }, [artistRevenueData]);

  const isLoading = artistsLoading || revenueLoading || summaryLoading;

  const stats = [
    {
      label: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: "text-primary",
    },
    {
      label: "Total Streams",
      value: totalStreams.toLocaleString(),
      icon: BarChart3,
      color: "text-chart-2",
    },
    {
      label: "Avg Revenue / Stream",
      value: formatCurrency(avgRevenuePerStream),
      icon: TrendingUp,
      color: "text-chart-3",
    },
    {
      label: "Active Artists",
      value: activeArtists,
      icon: Users,
      color: "text-chart-4",
    },
  ];

  const tooltipStyle = {
    backgroundColor: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "6px",
    fontSize: "12px",
  };

  return (
    <div className="p-6 pb-24 space-y-6 max-w-6xl mx-auto" data-testid="page-admin-revenue">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-primary" />
          Revenue Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Financial overview for DNA Records
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="revenue-summary-cards">
        {isLoading
          ? [...Array(4)].map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </Card>
            ))
          : stats.map((stat) => (
              <Card key={stat.label} className="p-4" data-testid={`card-${stat.label.toLowerCase().replace(/[\s\/]/g, "-")}`}>
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
              </Card>
            ))}
      </div>

      <section data-testid="revenue-over-time-chart">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Revenue Over Time
          <span className="text-sm font-normal text-muted-foreground">(Last 30 days)</span>
        </h2>
        <Card className="p-4">
          {revenueLoading ? (
            <Skeleton className="h-[250px] w-full" />
          ) : dailyChartData.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              No revenue data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={dailyChartData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(25, 95%, 53%)" fill="url(#revenueGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>
      </section>

      <section data-testid="artist-breakdown-table">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Artist Breakdown
        </h2>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-md" />
            ))}
          </div>
        ) : (
          <Card className="p-2">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
              <span>Artist</span>
              <span className="text-right">Streams</span>
              <span className="text-right">Revenue</span>
              <span className="text-right">Avg / Stream</span>
            </div>
            {summaryData.map((summary) => {
              const artist = artistMap.get(summary.artistId);
              const avgPerStream = summary.totalStreams > 0 ? summary.totalRevenue / summary.totalStreams : 0;
              return (
                <div
                  key={summary.artistId}
                  className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-3 py-3 rounded-md hover-elevate"
                  data-testid={`row-artist-revenue-${summary.artistId}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-md overflow-hidden bg-muted/30 flex-shrink-0">
                      {artist?.avatarUrl ? (
                        <img src={artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5">
                          <Users className="w-3 h-3 text-primary/40" />
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium truncate">{artist?.name || summary.artistId}</span>
                  </div>
                  <span className="text-sm tabular-nums text-right">{(summary.totalStreams || 0).toLocaleString()}</span>
                  <span className="text-sm tabular-nums text-right font-medium">{formatCurrency(summary.totalRevenue || 0)}</span>
                  <span className="text-sm tabular-nums text-right text-muted-foreground">{formatCurrency(avgPerStream)}</span>
                </div>
              );
            })}
            {summaryData.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">No revenue data available</div>
            )}
          </Card>
        )}
      </section>

      <section data-testid="per-artist-revenue-chart">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Per-Artist Revenue
        </h2>
        <div className="mb-4">
          <Select value={selectedArtistId} onValueChange={setSelectedArtistId}>
            <SelectTrigger className="w-64" data-testid="select-artist-revenue">
              <SelectValue placeholder="Select an artist" />
            </SelectTrigger>
            <SelectContent>
              {artists.map((artist) => (
                <SelectItem key={artist.id} value={artist.id} data-testid={`select-artist-option-${artist.id}`}>
                  {artist.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedArtistId ? (
          <Card className="p-4">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Daily Revenue &mdash; {artistMap.get(selectedArtistId)?.name}
            </h4>
            {artistChartData.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No revenue data for this artist
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={artistChartData}>
                  <defs>
                    <linearGradient id="artistRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#artistRevenueGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>
        ) : (
          <Card className="p-8 text-center">
            <BarChart3 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Select an artist to view their revenue chart</p>
          </Card>
        )}
      </section>
    </div>
  );
}
