import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Bot,
  Target,
  TrendingUp,
  Play,
  ChevronDown,
  ChevronUp,
  ListChecks,
  Star,
} from "lucide-react";
import type { AgentTask, ExecutionRun, Agent } from "@shared/schema";

type StatusTab = "all" | "pending" | "approved" | "running" | "completed" | "failed" | "rejected";

const urgencyColor: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-green-500/20 text-green-400 border-green-500/30",
};

const statusColor: Record<string, string> = {
  pending: "text-orange-400 border-orange-400/30 bg-orange-400/10",
  approved: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  running: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  completed: "text-green-400 border-green-400/30 bg-green-400/10",
  failed: "text-red-400 border-red-400/30 bg-red-400/10",
  rejected: "text-gray-400 border-gray-400/30 bg-gray-400/10",
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

function formatDuration(ms: number) {
  const hours = Math.floor(ms / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function ObjectiveBadge({ met }: { met: string | null }) {
  if (!met) return null;
  const cfg = {
    yes: { label: "Objective Met", cls: "text-green-400 border-green-400/30 bg-green-400/10" },
    partial: { label: "Partial", cls: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" },
    no: { label: "Not Met", cls: "text-red-400 border-red-400/30 bg-red-400/10" },
  }[met] ?? null;
  if (!cfg) return null;
  return <Badge variant="outline" className={`text-xs ${cfg.cls}`}>{cfg.label}</Badge>;
}

function ExecutionPanel({ taskId }: { taskId: string }) {
  const { data: runs = [], isLoading } = useQuery<ExecutionRun[]>({
    queryKey: ["/api/admin/executions", taskId],
    queryFn: () => fetch(`/api/admin/executions?taskId=${taskId}`).then(r => r.json()),
  });

  if (isLoading) return <div className="p-4 text-xs text-muted-foreground">Loading execution data...</div>;
  if (runs.length === 0) return <div className="p-4 text-xs text-muted-foreground">No execution runs yet.</div>;

  const run = runs[0];

  return (
    <div className="border-t border-border/50 bg-muted/20 rounded-b-lg p-4 space-y-4 text-xs">
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="outline" className={statusColor[run.status ?? ""] ?? ""}>
          {run.status}
        </Badge>
        <ObjectiveBadge met={run.objectiveMet ?? null} />
        {run.qualityScore && (
          <span className="flex items-center gap-1 text-muted-foreground">
            <Star className="w-3 h-3 text-yellow-400" /> Quality: <strong className="text-foreground">{run.qualityScore}/10</strong>
          </span>
        )}
        {run.totalDurationMs && (
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3 h-3" /> Duration: {formatDuration(run.totalDurationMs)}
          </span>
        )}
      </div>

      {run.actionLog && run.actionLog.length > 0 && (
        <div>
          <p className="text-xs font-medium mb-1.5 text-muted-foreground uppercase tracking-wider">Action Log</p>
          <ol className="space-y-1">
            {run.actionLog.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-muted-foreground">
                <span className="text-primary font-mono shrink-0">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {run.outputSummary && (
        <div>
          <p className="text-xs font-medium mb-1 text-muted-foreground uppercase tracking-wider">Output Summary</p>
          <p className="text-muted-foreground leading-relaxed">{run.outputSummary}</p>
        </div>
      )}

      {run.lessonsLearned && (
        <div>
          <p className="text-xs font-medium mb-1 text-muted-foreground uppercase tracking-wider">Lessons Learned</p>
          <p className="text-muted-foreground leading-relaxed">{run.lessonsLearned}</p>
        </div>
      )}

      {run.nextSteps && (
        <div>
          <p className="text-xs font-medium mb-1 text-muted-foreground uppercase tracking-wider">Next Steps</p>
          <p className="text-muted-foreground leading-relaxed">{run.nextSteps}</p>
        </div>
      )}
    </div>
  );
}

export default function AdminTasks() {
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const { data: tasks = [], isLoading } = useQuery<AgentTask[]>({
    queryKey: ["/api/admin/tasks"],
  });

  const { data: agentList = [] } = useQuery<Agent[]>({
    queryKey: ["/api/admin/agents"],
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiRequest("PATCH", `/api/admin/tasks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/command-center"] });
    },
  });

  const agentById = Object.fromEntries(agentList.map(a => [a.id, a]));

  const filtered = activeTab === "all" ? tasks : tasks.filter(t => t.status === activeTab);

  const counts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === "pending").length,
    approved: tasks.filter(t => t.status === "approved").length,
    running: tasks.filter(t => t.status === "running").length,
    completed: tasks.filter(t => t.status === "completed").length,
    failed: tasks.filter(t => t.status === "failed").length,
    rejected: tasks.filter(t => t.status === "rejected").length,
  };

  const tabs: { value: StatusTab; label: string }[] = [
    { value: "all", label: `All (${counts.all})` },
    { value: "pending", label: `Needs Approval (${counts.pending})` },
    { value: "approved", label: `Approved (${counts.approved})` },
    { value: "running", label: `Running (${counts.running})` },
    { value: "completed", label: `Completed (${counts.completed})` },
    { value: "failed", label: `Failed (${counts.failed})` },
  ];

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto" data-testid="page-task-queue">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
          <ListChecks className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Task Queue</h1>
          <p className="text-muted-foreground text-sm">Agent assignments, approvals, and execution reports</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={v => setActiveTab(v as StatusTab)}>
        <TabsList className="flex-wrap h-auto gap-1 bg-muted/40" data-testid="tabs-task-status">
          {tabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs" data-testid={`tab-${tab.value}`}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-border/50 animate-pulse">
              <CardContent className="p-5 h-28" />
            </Card>
          ))
        ) : filtered.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="p-8 text-center text-muted-foreground text-sm">
              <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-green-400" />
              No tasks in this category.
            </CardContent>
          </Card>
        ) : filtered.map(task => {
          const agent = task.agentId ? agentById[task.agentId] : null;
          const isExpanded = expandedTask === task.id;
          const isPending = task.status === "pending" && task.requiresApproval;

          return (
            <Card key={task.id} className="border-border/50 bg-card/50 overflow-hidden" data-testid={`card-task-${task.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl mt-0.5 shrink-0">{taskTypeIcon[task.taskType] ?? "🤖"}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-sm">{task.title}</span>
                      {task.priorityScore !== null && task.priorityScore !== undefined && (
                        <span className="font-mono text-xs border border-border/50 rounded px-1.5 py-0.5 text-muted-foreground">
                          Score: {task.priorityScore}
                        </span>
                      )}
                      {task.urgency && (
                        <Badge variant="outline" className={`text-xs ${urgencyColor[task.urgency] ?? ""}`}>
                          {task.urgency}
                        </Badge>
                      )}
                      <Badge variant="outline" className={`text-xs ${statusColor[task.status ?? ""] ?? ""}`}>
                        {task.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                      {agent && (
                        <span className="flex items-center gap-1">
                          <Bot className="w-3 h-3" /> {agent.name}
                        </span>
                      )}
                      <span className="capitalize">{task.taskType}</span>
                      {task.dueAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Due {new Date(task.dueAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>

                    {task.businessImpact && (
                      <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> {task.businessImpact}
                      </p>
                    )}

                    {task.expectedOutcome && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Target className="w-3 h-3" /> {task.expectedOutcome}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {isPending && (
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          className="h-7 text-xs"
                          disabled={updateMutation.isPending}
                          onClick={() => updateMutation.mutate({ id: task.id, data: { status: "approved" } })}
                          data-testid={`button-approve-${task.id}`}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs text-red-400 border-red-400/30 hover:bg-red-400/10"
                          disabled={updateMutation.isPending}
                          onClick={() => updateMutation.mutate({ id: task.id, data: { status: "rejected" } })}
                          data-testid={`button-reject-${task.id}`}
                        >
                          <AlertTriangle className="w-3 h-3 mr-1" /> Reject
                        </Button>
                      </div>
                    )}
                    {task.status === "approved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs text-yellow-400 border-yellow-400/30 hover:bg-yellow-400/10"
                        disabled={updateMutation.isPending}
                        onClick={() => updateMutation.mutate({ id: task.id, data: { status: "running" } })}
                        data-testid={`button-run-${task.id}`}
                      >
                        <Play className="w-3 h-3 mr-1" /> Start
                      </Button>
                    )}
                    {(task.status === "completed" || task.status === "running") && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-muted-foreground"
                        onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                        data-testid={`button-expand-${task.id}`}
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5 mr-1" /> : <ChevronDown className="w-3.5 h-3.5 mr-1" />}
                        {isExpanded ? "Hide" : "Execution Log"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>

              {isExpanded && <ExecutionPanel taskId={task.id} />}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
