import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Bot,
  Cpu,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Target,
  Brain,
  ChevronRight,
  Star,
  RefreshCw,
  ShieldCheck,
  Flame,
} from "lucide-react";
import type { AgentTask, AgentMemory, Agent } from "@shared/schema";

const urgencyColor: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-green-500/20 text-green-400 border-green-500/30",
};

const taskTypeIcon: Record<string, string> = {
  marketing: "📢",
  ar: "🎯",
  revenue: "💰",
  content: "✍️",
  research: "🔬",
  growth: "📈",
  automation: "⚙️",
};

const categoryColor: Record<string, string> = {
  strategy: "text-blue-400",
  market: "text-purple-400",
  performance: "text-green-400",
  warning: "text-red-400",
  opportunity: "text-orange-400",
};

const categoryIcon: Record<string, string> = {
  strategy: "💡",
  market: "📊",
  performance: "⚡",
  warning: "⚠️",
  opportunity: "🚀",
};

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 90 ? "text-red-400 border-red-500/40" :
    score >= 80 ? "text-orange-400 border-orange-500/40" :
    score >= 70 ? "text-yellow-400 border-yellow-500/40" :
    "text-green-400 border-green-500/40";
  return (
    <span className={`font-mono text-xs border rounded px-1.5 py-0.5 ${color}`} data-testid="score-badge">
      {score}
    </span>
  );
}

export default function AdminCommandCenter() {
  const { data: brief } = useQuery<{
    totalAgents: number;
    activeAgents: number;
    pendingApprovals: number;
    runningTasks: number;
    completedToday: number;
    avgQualityScore: number;
  }>({ queryKey: ["/api/admin/command-center"] });

  const { data: tasks = [] } = useQuery<AgentTask[]>({ queryKey: ["/api/admin/tasks"] });
  const { data: memory = [] } = useQuery<AgentMemory[]>({ queryKey: ["/api/admin/memory"] });
  const { data: agentList = [] } = useQuery<Agent[]>({ queryKey: ["/api/admin/agents"] });

  const approveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest("PATCH", `/api/admin/tasks/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/command-center"] });
    },
  });

  const pendingApproval = tasks.filter(t => t.status === "pending" && t.requiresApproval)
    .sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0));

  const runningTasks = tasks.filter(t => t.status === "running")
    .sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0));

  const topPriority = [...pendingApproval, ...runningTasks]
    .sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0))
    .slice(0, 5);

  const quickWins = tasks.filter(t => t.status === "pending" && !t.requiresApproval)
    .sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0))
    .slice(0, 4);

  const recentMemory = memory.slice(0, 6);

  const agentById = Object.fromEntries(agentList.map(a => [a.id, a]));

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" data-testid="page-command-center">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">AI Command Center</h1>
          </div>
          <p className="text-muted-foreground text-sm ml-11">Daily Executive Brief — {today}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/command-center"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/tasks"] });
          }}
          data-testid="button-refresh-brief"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Refresh Brief
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Agents", value: brief?.totalAgents ?? "—", icon: Bot, color: "text-blue-400" },
          { label: "Active Now", value: brief?.activeAgents ?? "—", icon: Zap, color: "text-green-400" },
          { label: "Needs Approval", value: brief?.pendingApprovals ?? "—", icon: ShieldCheck, color: "text-orange-400" },
          { label: "Running Tasks", value: brief?.runningTasks ?? "—", icon: RefreshCw, color: "text-yellow-400" },
          { label: "Completed Today", value: brief?.completedToday ?? "—", icon: CheckCircle2, color: "text-green-400" },
          { label: "Avg Quality", value: brief?.avgQualityScore ? `${brief.avgQualityScore}/10` : "—", icon: Star, color: "text-primary" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-border/50 bg-card/50">
            <CardContent className="p-4 flex flex-col gap-1">
              <Icon className={`w-4 h-4 ${color}`} />
              <div className="text-2xl font-bold tracking-tight">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h2 className="text-base font-semibold flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-primary" />
              Top Priority Actions
            </h2>
            <div className="space-y-3">
              {topPriority.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="p-6 text-center text-muted-foreground text-sm">No high-priority actions right now.</CardContent>
                </Card>
              ) : topPriority.map((task, idx) => {
                const agent = task.agentId ? agentById[task.agentId] : null;
                return (
                  <Card key={task.id} className="border-border/50 bg-card/50 hover:border-border transition-colors" data-testid={`card-priority-task-${task.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl mt-0.5">{taskTypeIcon[task.taskType] ?? "🤖"}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-xs text-muted-foreground font-mono">#{idx + 1}</span>
                            <span className="font-medium text-sm">{task.title}</span>
                            <ScoreBadge score={task.priorityScore ?? 0} />
                            {task.urgency && (
                              <Badge variant="outline" className={`text-xs ${urgencyColor[task.urgency] ?? ""}`}>
                                {task.urgency}
                              </Badge>
                            )}
                          </div>
                          {agent && (
                            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                              <Bot className="w-3 h-3" /> {agent.name}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
                          {task.businessImpact && (
                            <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" /> {task.businessImpact}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={task.status === "running" ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" : "text-orange-400 border-orange-400/30 bg-orange-400/10"}
                        >
                          {task.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <Separator className="opacity-30" />

          <div>
            <h2 className="text-base font-semibold flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-orange-400" />
              Approval Queue
              {pendingApproval.length > 0 && (
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">{pendingApproval.length}</Badge>
              )}
            </h2>
            <div className="space-y-3">
              {pendingApproval.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="p-6 text-center text-muted-foreground text-sm">
                    <CheckCircle2 className="w-5 h-5 mx-auto mb-2 text-green-400" />
                    All caught up — no pending approvals.
                  </CardContent>
                </Card>
              ) : pendingApproval.map(task => {
                const agent = task.agentId ? agentById[task.agentId] : null;
                const isPending = approveMutation.isPending;
                return (
                  <Card key={task.id} className="border-orange-500/20 bg-orange-500/5" data-testid={`card-approval-task-${task.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-xl mt-0.5">{taskTypeIcon[task.taskType] ?? "🤖"}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-medium text-sm">{task.title}</span>
                            <ScoreBadge score={task.priorityScore ?? 0} />
                          </div>
                          {agent && <p className="text-xs text-muted-foreground mb-1"><Bot className="w-3 h-3 inline mr-1" />{agent.name}</p>}
                          {task.expectedOutcome && <p className="text-xs text-muted-foreground line-clamp-1"><Target className="w-3 h-3 inline mr-1" />{task.expectedOutcome}</p>}
                          {task.businessImpact && <p className="text-xs text-green-400 mt-1">{task.businessImpact}</p>}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          className="flex-1"
                          disabled={isPending}
                          onClick={() => approveMutation.mutate({ id: task.id, status: "approved" })}
                          data-testid={`button-approve-task-${task.id}`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-red-400 border-red-400/30 hover:bg-red-400/10"
                          disabled={isPending}
                          onClick={() => approveMutation.mutate({ id: task.id, status: "rejected" })}
                          data-testid={`button-reject-task-${task.id}`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-yellow-400" />
              Quick Wins
            </h2>
            <div className="space-y-2">
              {quickWins.length === 0 ? (
                <p className="text-sm text-muted-foreground">No auto-approved tasks queued.</p>
              ) : quickWins.map(task => (
                <Card key={task.id} className="border-border/50 bg-card/50" data-testid={`card-quickwin-${task.id}`}>
                  <CardContent className="p-3 flex items-center gap-2">
                    <span className="text-base">{taskTypeIcon[task.taskType] ?? "🤖"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">Score: {task.priorityScore}</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator className="opacity-30" />

          <div>
            <h2 className="text-base font-semibold flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-blue-400" />
              Agent Memory
              <span className="text-xs text-muted-foreground font-normal">— Shared Insights</span>
            </h2>
            <div className="space-y-2">
              {recentMemory.map(mem => {
                const agent = mem.agentId ? agentById[mem.agentId] : null;
                return (
                  <Card key={mem.id} className="border-border/50 bg-card/50" data-testid={`card-memory-${mem.id}`}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-sm">{categoryIcon[mem.category] ?? "💡"}</span>
                        <span className={`text-xs font-medium capitalize ${categoryColor[mem.category] ?? "text-muted-foreground"}`}>{mem.category}</span>
                        {mem.qualityScore && <span className="ml-auto text-xs text-muted-foreground">{mem.qualityScore}/10</span>}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{mem.insight}</p>
                      {agent && <p className="text-xs text-muted-foreground mt-1.5 opacity-60">— {agent.name}</p>}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <Separator className="opacity-30" />

          <div>
            <h2 className="text-base font-semibold flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-green-400" />
              End-of-Day Targets
            </h2>
            <ul className="space-y-1.5">
              {[
                "All approval queue items reviewed",
                "Running tasks progressing on schedule",
                "Weekly content pack delivered",
                "Competitive analysis complete",
                "Revenue forecast presented",
              ].map(target => (
                <li key={target} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3 text-green-400 shrink-0 mt-0.5" />
                  {target}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
