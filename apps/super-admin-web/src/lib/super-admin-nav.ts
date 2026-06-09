import {
  LayoutDashboard,
  MapPinned,
  ShieldAlert,
  UsersRound,
} from "lucide-react";

export const superAdminNavItems = [
  { label: "Platform overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "All regions", href: "/dashboard/regions", icon: MapPinned },
  { label: "Admin accounts", href: "/dashboard/users", icon: UsersRound },
  { label: "Emergency queue", href: "/dashboard/emergencies", icon: ShieldAlert },
];
