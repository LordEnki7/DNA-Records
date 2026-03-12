import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bot,
  Zap,
  Clock,
  PauseCircle,
  XCircle,
  CheckCircle2,
  Activity,
} from "lucide-react";
import type { Agent } from "@shared/schema";

const statusConfig = {
  active: { label: "Active", color: "text-green-400 border-green-400/30 bg-green-400/10", icon: Zap },
  idle: { label: "Idle", color: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10", icon: PauseCircle },
  disabled: { label: "Disabled", color: "text-red-400 border-red-400/30 bg-red-400/10", icon: XCircle },
};

const unitColor: Record<string, string> = {
  "A&R Department": "bg-blue-500/15 text-blue-400",
  "Marketing Department": "bg-orange-500/15 text-orange-400",
  "Business Development": "bg-green-500/15 text-green-400",
  "Strategy": "bg-purple-500/15 text-purple-400",
  "Operations": "bg-cyan-500/15 text-cyan-400",
  "Executive": "bg-primary/15 text-primary",
};

const agentEmoji: Record<string, string> = {
  "A&R Scout": "🎯",
  "Marketing Director": "📢",
  "Revenue Optimizer": "💰",
  "Content Creator": "✍️",
  "Research Intelligence": "🔬",
  "System Optimizer": "⚙️",
  "Daily Orchestrator": "🧠",
  "Growth Engine": "📈",
};

function formatLastActive(date: string | Date | null) {
  if (!date) return "Never";
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function AdminAgents() {
  const { data: agentList = [], isLoading } = useQuery<Agent[]>({
    queryKey: ["/api/admin/agents"],
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest("PATCH", `/api/admin/agents/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/agents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/command-center"] });
    },
  });

  const counts = {
    total: agentList.length,
    active: agentList.filter(a => a.status === "active").length,
    idle: agentList.filter(a => a.status === "idle").length,
    disabled: agentList.filter(a => a.status === "disabled").length,
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" data-testid="page-agent-registry">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Agent Registry</h1>
          </div>
          <p className="text-muted-foreground text-sm ml-11">All AI agents deployed in the DNA Records ecosystem</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Agents", value: counts.total, icon: Bot, color: "text-blue-400" },
          { label: "Active", value: counts.active, icon: Zap, color: "text-green-400" },
          { label: "Idle", value: counts.idle, icon: PauseCircle, color: "text-yellow-400" },
          { label: "Disabled", value: counts.disabled, icon: XCircle, color: "text-red-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-border/50 bg-card/50">
            <CardContent className="p-4 flex flex-col gap-1">
              <Icon className={`w-4 h-4 ${color}`} />
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-border/50 bg-card/50 animate-pulse">
              <CardContent className="p-5 h-48" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {agentList.map(agent => {
            const status = (agent.status ?? "idle") as keyof typeof statusConfig;
            const cfg = statusConfig[status] ?? statusConfig.idle;
            const StatusIcon = cfg.icon;
            const isActive = status === "active";

            return (
              <Card
                key={agent.id}
                className="border-border/50 bg-card/50 hover:border-border transition-colors"
                data-testid={`card-agent-${agent.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{agentEmoji[agent.name] ?? "🤖"}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-base">{agent.name}</CardTitle>
                        <Badge variant="outline" className={`text-xs ${cfg.color}`}>
                          <StatusIcon className="w-2.5 h-2.5 mr-1" />
                          {cfg.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{agent.role}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {agent.assignedUnit && (
                    <span className={`inline-block text-xs rounded-full px-2.5 py-0.5 font-medium ${unitColor[agent.assignedUnit] ?? "bg-muted text-muted-foreground"}`}>
                      {agent.assignedUnit}
                    </span>
                  )}

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {agent.description}
                  </p>

                  {agent.capabilities && agent.capabilities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {agent.capabilities.map(cap => (
                        <Badge key={cap} variant="secondary" className="text-xs px-1.5 py-0 h-5">
                          {cap}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatLastActive(agent.lastActiveAt)}
                    </span>
                    <div className="flex gap-1.5">
                      {status !== "active" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs px-2 text-green-400 border-green-400/30 hover:bg-green-400/10"
                          disabled={updateMutation.isPending}
                          onClick={() => updateMutation.mutate({ id: agent.id, status: "active" })}
                          data-testid={`button-activate-agent-${agent.id}`}
                        >
                          <Zap className="w-2.5 h-2.5 mr-1" /> Activate
                        </Button>
                      )}
                      {status !== "idle" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs px-2 text-yellow-400 border-yellow-400/30 hover:bg-yellow-400/10"
                          disabled={updateMutation.isPending}
                          onClick={() => updateMutation.mutate({ id: agent.id, status: "idle" })}
                          data-testid={`button-idle-agent-${agent.id}`}
                        >
                          <PauseCircle className="w-2.5 h-2.5 mr-1" /> Idle
                        </Button>
                      )}
                      {status !== "disabled" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs px-2 text-red-400 border-red-400/30 hover:bg-red-400/10"
                          disabled={updateMutation.isPending}
                          onClick={() => updateMutation.mutate({ id: agent.id, status: "disabled" })}
                          data-testid={`button-disable-agent-${agent.id}`}
                        >
                          <XCircle className="w-2.5 h-2.5 mr-1" /> Disable
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
