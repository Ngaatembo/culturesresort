import type { ReactNode } from "react";
import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  ChefHat,
  ClipboardList,
  Contact2,
  Image as ImageIcon,
  LayoutGrid,
  LogOut,
  MapPin,
  MessageSquare,
  Settings as SettingsIcon,
  ShieldCheck,
  ShoppingBag,
  UtensilsCrossed,
  Wine,
  Clock,
  CalendarDays,
  CalendarCheck2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { adminLogout } from "@/lib/auth/functions";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutGrid;
  badge?: number | undefined;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

function buildNav(counts: Partial<Record<string, number>>): NavGroup[] {
  return [
    {
      label: "Main",
      items: [{ to: "/admin", label: "Overview", icon: LayoutGrid }],
    },
    {
      label: "Operations",
      items: [
        { to: "/admin/orders", label: "Orders", icon: ShoppingBag, badge: counts["orders"] },
        { to: "/admin/kitchen", label: "Kitchen", icon: ChefHat, badge: counts["kitchen"] },
        {
          to: "/admin/reservations",
          label: "Reservations",
          icon: CalendarCheck2,
          badge: counts["reservations"],
        },
        {
          to: "/admin/enquiries",
          label: "Enquiries",
          icon: MessageSquare,
          badge: counts["enquiries"],
        },
      ],
    },
    {
      label: "Content",
      items: [
        { to: "/admin/menu", label: "Food Menu", icon: UtensilsCrossed },
        { to: "/admin/beverages", label: "Beverages", icon: Wine },
        { to: "/admin/gallery", label: "Gallery", icon: ImageIcon },
        { to: "/admin/events", label: "Events & Functions", icon: CalendarDays },
      ],
    },
    {
      label: "Business",
      items: [
        { to: "/admin/hours", label: "Opening Hours", icon: Clock },
        { to: "/admin/visit-details", label: "Visit Details", icon: MapPin },
        { to: "/admin/contact", label: "Contact & Socials", icon: Contact2 },
      ],
    },
    {
      label: "System",
      items: [
        { to: "/admin/staff", label: "Staff & Users", icon: ShieldCheck },
        { to: "/admin/settings", label: "Settings", icon: SettingsIcon },
        { to: "/admin/activity", label: "Activity Log", icon: Activity },
      ],
    },
  ];
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive = item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to);
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
        <Link to={item.to}>
          <item.icon />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
      {typeof item.badge === "number" && item.badge > 0 ? (
        <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
      ) : null}
    </SidebarMenuItem>
  );
}

function LogoutButton() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onLogout = async () => {
    setLoading(true);
    try {
      await adminLogout();
    } finally {
      navigate({ to: "/admin/login" });
    }
  };

  return (
    <SidebarMenuButton onClick={onLogout} disabled={loading} tooltip="Log out">
      <LogOut />
      <span>{loading ? "Logging out…" : "Log out"}</span>
    </SidebarMenuButton>
  );
}

export function AdminSidebar({
  counts = {},
}: {
  counts?: Partial<Record<string, number>> | undefined;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const groups = buildNav(counts);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-2.5 px-1">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent font-display text-sm text-sidebar-accent-foreground">
            C
          </span>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-bold text-sidebar-foreground">Cultures Resort</p>
            <p className="truncate text-xs text-sidebar-foreground/60">Owner dashboard</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <NavLink key={item.to} item={item} pathname={pathname} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="View site">
              <Link to="/">
                <ClipboardList />
                <span>View public site</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <LogoutButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function titleFromPath(pathname: string) {
  const map: Record<string, string> = {
    "/admin": "Overview",
    "/admin/orders": "Orders",
    "/admin/kitchen": "Kitchen",
    "/admin/reservations": "Reservations",
    "/admin/enquiries": "Enquiries",
    "/admin/menu": "Food Menu",
    "/admin/beverages": "Beverages",
    "/admin/gallery": "Gallery",
    "/admin/events": "Events & Functions",
    "/admin/hours": "Opening Hours",
    "/admin/visit-details": "Visit Details",
    "/admin/contact": "Contact & Socials",
    "/admin/staff": "Staff & Users",
    "/admin/settings": "Settings",
    "/admin/activity": "Activity Log",
  };
  return map[pathname] ?? "Dashboard";
}

export function AdminTopbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur">
      <SidebarTrigger />
      <p className="text-sm font-semibold text-foreground">{titleFromPath(pathname)}</p>
    </header>
  );
}

export function AdminShell({
  children,
  counts,
}: {
  children: ReactNode;
  counts?: Partial<Record<string, number>> | undefined;
}) {
  return (
    <div className="admin">
      <SidebarProvider>
        <AdminSidebar counts={counts} />
        <SidebarInset>
          <AdminTopbar />
          <main className="min-w-0 flex-1 space-y-6 p-4 lg:p-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
