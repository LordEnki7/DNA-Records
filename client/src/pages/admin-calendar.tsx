import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Check,
  X,
  Clock,
  Brain,
  Megaphone,
  Music2,
} from "lucide-react";
import type { ContentCalendarItem, Artist } from "@shared/schema";

const typeConfig: Record<string, { label: string; className: string }> = {
  release: { label: "Release", className: "bg-chart-1/10 text-chart-1" },
  promotion: { label: "Promotion", className: "bg-chart-2/10 text-chart-2" },
  social_post: { label: "Social Post", className: "bg-chart-3/10 text-chart-3" },
  playlist_pitch: { label: "Playlist Pitch", className: "bg-chart-4/10 text-chart-4" },
  press_release: { label: "Press Release", className: "bg-chart-5/10 text-chart-5" },
};

const platformConfig: Record<string, { label: string; className: string }> = {
  spotify: { label: "Spotify", className: "bg-green-500/10 text-green-500" },
  twitter: { label: "Twitter", className: "bg-blue-400/10 text-blue-400" },
  instagram: { label: "Instagram", className: "bg-pink-500/10 text-pink-500" },
  tiktok: { label: "TikTok", className: "bg-purple-500/10 text-purple-500" },
  youtube: { label: "YouTube", className: "bg-red-500/10 text-red-500" },
  apple_music: { label: "Apple Music", className: "bg-rose-400/10 text-rose-400" },
};

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-500/10 text-yellow-500" },
  approved: { label: "Approved", className: "bg-green-500/10 text-green-500" },
  completed: { label: "Completed", className: "bg-blue-500/10 text-blue-500" },
  rejected: { label: "Rejected", className: "bg-red-500/10 text-red-500" },
};

function groupByDate(items: ContentCalendarItem[]): Record<string, ContentCalendarItem[]> {
  const groups: Record<string, ContentCalendarItem[]> = {};
  for (const item of items) {
    const dateKey = new Date(item.scheduledAt).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(item);
  }
  return groups;
}

export default function AdminCalendar() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [artistFilter, setArtistFilter] = useState("all");

  const { data: calendarItems = [], isLoading } = useQuery<ContentCalendarItem[]>({
    queryKey: ["/api/admin/calendar"],
  });

  const { data: artists = [] } = useQuery<Artist[]>({
    queryKey: ["/api/artists"],
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest("PATCH", `/api/admin/calendar/${id}`, { status }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/calendar"] });
      toast({
        title: variables.status === "approved" ? "Item Approved" : "Item Rejected",
        description: `Content calendar item has been ${variables.status}.`,
      });
    },
  });

  const filtered = calendarItems
    .filter((item) => {
      if (activeTab !== "all" && item.status !== activeTab) return false;
      if (artistFilter !== "all" && item.artistId !== artistFilter) return false;
      return true;
    })
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const grouped = groupByDate(filtered);
  const pendingCount = calendarItems.filter((i) => i.status === "pending").length;

  return (
    <div className="p-6 pb-24 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-page-title">
          <Calendar className="w-6 h-6 text-primary" />
          AI Content Calendar
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI-scheduled content with human approval workflow
        </p>
      </div>

      {pendingCount > 0 && (
        <Card className="p-4 flex items-center gap-3 border-yellow-500/30">
          <div className="w-10 h-10 rounded-md bg-yellow-500/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <p className="text-sm font-medium" data-testid="text-approval-required">Human Approval Required</p>
            <p className="text-xs text-muted-foreground">
              {pendingCount} content {pendingCount === 1 ? "item needs" : "items need"} review before publishing
            </p>
          </div>
          <Badge className="ml-auto no-default-active-elevate bg-yellow-500/10 text-yellow-500">
            {pendingCount} pending
          </Badge>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList data-testid="tabs-status-filter">
            <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
            <TabsTrigger value="pending" data-testid="tab-pending">Pending</TabsTrigger>
            <TabsTrigger value="approved" data-testid="tab-approved">Approved</TabsTrigger>
            <TabsTrigger value="completed" data-testid="tab-completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={artistFilter} onValueChange={setArtistFilter}>
          <SelectTrigger className="w-[200px]" data-testid="select-artist-filter">
            <SelectValue placeholder="Filter by artist" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Artists</SelectItem>
            {artists.map((artist) => (
              <SelectItem key={artist.id} value={artist.id}>
                {artist.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-md" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <Calendar className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground" data-testid="text-empty-state">
            No content items match the current filters
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([dateLabel, items]) => (
            <div key={dateLabel}>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-muted-foreground" data-testid={`text-date-group-${dateLabel}`}>
                  {dateLabel}
                </h2>
              </div>

              <div className="space-y-3 pl-2 border-l-2 border-muted ml-2">
                {items.map((item) => {
                  const artist = artists.find((a) => a.id === item.artistId);
                  const type = typeConfig[item.type] || { label: item.type, className: "bg-muted text-muted-foreground" };
                  const platform = item.platform ? platformConfig[item.platform] || { label: item.platform, className: "bg-muted text-muted-foreground" } : null;
                  const status = statusConfig[item.status || "pending"] || statusConfig.pending;
                  const isPending = item.status === "pending";

                  return (
                    <Card key={item.id} className="p-4 ml-4" data-testid={`card-calendar-item-${item.id}`}>
                      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium" data-testid={`text-item-title-${item.id}`}>
                            {item.title}
                          </p>
                          {artist && (
                            <p className="text-xs text-muted-foreground mt-0.5" data-testid={`text-item-artist-${item.id}`}>
                              {artist.name}
                            </p>
                          )}
                        </div>
                        <Badge className={`${status.className} no-default-active-elevate`} data-testid={`badge-status-${item.id}`}>
                          {status.label}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <Badge className={`${type.className} no-default-active-elevate`} data-testid={`badge-type-${item.id}`}>
                          {type.label}
                        </Badge>
                        {platform && (
                          <Badge className={`${platform.className} no-default-active-elevate`} data-testid={`badge-platform-${item.id}`}>
                            {platform.label}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                          <Clock className="w-3 h-3" />
                          {new Date(item.scheduledAt).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {item.aiNotes && (
                        <div className="bg-muted/30 rounded-md p-3 mb-3">
                          <p className="text-xs font-medium flex items-center gap-1 mb-1 text-muted-foreground">
                            <Brain className="w-3 h-3" />
                            AI Notes
                          </p>
                          <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-ai-notes-${item.id}`}>
                            {item.aiNotes}
                          </p>
                        </div>
                      )}

                      {isPending && (
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => statusMutation.mutate({ id: item.id, status: "rejected" })}
                            disabled={statusMutation.isPending}
                            data-testid={`button-reject-${item.id}`}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => statusMutation.mutate({ id: item.id, status: "approved" })}
                            disabled={statusMutation.isPending}
                            data-testid={`button-approve-${item.id}`}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
