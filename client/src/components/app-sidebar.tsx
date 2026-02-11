import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import {
  Home,
  Compass,
  Music2,
  Radio,
  Bell,
  Shield,
  LogOut,
  Megaphone,
  TrendingUp,
  DollarSign,
  CalendarDays,
} from "lucide-react";
import logoUrl from "@assets/ChatGPT_Image_Feb_7,_2026,_11_31_15_PM_1770526963729.png";

const mainNavItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Discover", url: "/discover", icon: Compass },
  { title: "Library", url: "/library", icon: Music2 },
  { title: "Live", url: "/live", icon: Radio },
  { title: "Notifications", url: "/notifications", icon: Bell },
];

const adminNavItems = [
  { title: "A&R Scout", url: "/admin/ar", icon: TrendingUp },
  { title: "Marketing", url: "/admin/marketing", icon: Megaphone },
  { title: "Revenue", url: "/admin/revenue", icon: DollarSign },
  { title: "Content Calendar", url: "/admin/calendar", icon: CalendarDays },
  { title: "Label Admin", url: "/admin", icon: Shield },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer">
            <img
              src={logoUrl}
              alt="EchoForge Records"
              className="w-10 h-10 rounded-md object-cover"
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wider text-foreground">
                ECHOFORGE
              </span>
              <span className="text-[10px] tracking-[0.3em] text-primary font-medium">
                RECORDS
              </span>
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            Navigate
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase()}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            Label Operations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {user && (
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.profileImageUrl || ""} />
              <AvatarFallback className="bg-primary/20 text-primary text-xs">
                {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" data-testid="text-user-name">
                {user.firstName
                  ? `${user.firstName} ${user.lastName || ""}`
                  : user.email}
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => logout()}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
