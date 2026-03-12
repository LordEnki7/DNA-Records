import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { PlayerProvider, MusicPlayerBar } from "@/components/music-player";
import { GlobalSearch } from "@/components/global-search";
import { useAuth } from "@/hooks/use-auth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Discover from "@/pages/discover";
import ArtistProfile from "@/pages/artist";
import Library from "@/pages/library";
import Live from "@/pages/live";
import Notifications from "@/pages/notifications";
import Admin from "@/pages/admin";
import AdminAR from "@/pages/admin-ar";
import AdminMarketing from "@/pages/admin-marketing";
import AdminRevenue from "@/pages/admin-revenue";
import AdminCalendar from "@/pages/admin-calendar";
import AdminCommand from "@/pages/admin-command";
import AdminAgents from "@/pages/admin-agents";
import AdminTasks from "@/pages/admin-tasks";
import NotFound from "@/pages/not-found";

function AuthenticatedRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/discover" component={Discover} />
      <Route path="/artist/:id" component={ArtistProfile} />
      <Route path="/library" component={Library} />
      <Route path="/live" component={Live} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/command" component={AdminCommand} />
      <Route path="/admin/agents" component={AdminAgents} />
      <Route path="/admin/tasks" component={AdminTasks} />
      <Route path="/admin/ar" component={AdminAR} />
      <Route path="/admin/marketing" component={AdminMarketing} />
      <Route path="/admin/revenue" component={AdminRevenue} />
      <Route path="/admin/calendar" component={AdminCalendar} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedLayout() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <PlayerProvider>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex flex-col flex-1 min-w-0">
            <header className="flex items-center justify-between gap-2 p-2 border-b border-border/50 sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <GlobalSearch />
              <ThemeToggle />
            </header>
            <main className="flex-1 overflow-auto">
              <AuthenticatedRouter />
            </main>
          </div>
        </div>
        <MusicPlayerBar />
      </SidebarProvider>
    </PlayerProvider>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground tracking-wider">
            INITIALIZING...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  return <AuthenticatedLayout />;
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
