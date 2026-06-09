import {
  AlertTriangle,
  Bell,
  CircleDot,
  ClipboardList,
  ContactRound,
  FileSearch,
  LayoutDashboard,
  MapPinned,
  Megaphone,
  ShieldAlert,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Tone = "brand" | "emergency" | "warning" | "safety" | "muted";
export type MapLayer = "alert" | "emergency" | "region" | "report" | "zone";
export type MapMarker = {
  id?: string;
  label: string;
  latitude: number;
  longitude: number;
  tone: Tone;
  count: string;
  description?: string;
  geometry?: {
    type: "circle" | "polygon";
    radiusMeters?: number;
    points?: Array<{ latitude: number; longitude: number }>;
  };
  layer?: MapLayer;
  meta?: string;
  status?: string;
  title?: string;
  details?: Array<{ label: string; value: string }>;
};

export const adminNavItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Community alerts", href: "/dashboard/emergency", icon: ShieldAlert },
  { label: "Crime reports", href: "/dashboard/reports", icon: ClipboardList },
  { label: "Missing reports", href: "/dashboard/missing", icon: FileSearch },
  { label: "Safety alerts", href: "/dashboard/alerts", icon: Megaphone },
  { label: "Danger zones", href: "/dashboard/danger-zones", icon: MapPinned },
  { label: "Users", href: "/dashboard/users", icon: UsersRound },
  { label: "Regions", href: "/dashboard/regions", icon: CircleDot },
] as const;

export const dashboardMetrics = [
  { label: "Active emergencies", value: "3", trend: "+2 today", tone: "emergency" },
  { label: "Pending reports", value: "18", trend: "6 critical", tone: "warning" },
  { label: "Safety alerts", value: "7", trend: "4 regional", tone: "brand" },
  { label: "Regions online", value: "14", trend: "100% coverage", tone: "safety" },
] satisfies Array<{ label: string; value: string; trend: string; tone: Tone }>;

export const mapMarkers = [
  { label: "Windhoek", latitude: -22.5609, longitude: 17.0658, tone: "emergency", count: "3", layer: "emergency" },
  { label: "Swakopmund", latitude: -22.6784, longitude: 14.5266, tone: "warning", count: "5", layer: "report" },
  { label: "Walvis Bay", latitude: -22.9576, longitude: 14.5053, tone: "brand", count: "2", layer: "zone" },
  { label: "Rundu", latitude: -17.9333, longitude: 19.7667, tone: "safety", count: "1", layer: "region" },
  { label: "Keetmanshoop", latitude: -26.5833, longitude: 18.1333, tone: "warning", count: "4", layer: "report" },
] satisfies MapMarker[];

export const priorityQueue = [
  {
    title: "Panic alert near Katutura",
    meta: "Windhoek • 3 min ago",
    status: "active",
    tone: "emergency",
    icon: ShieldAlert,
  },
  {
    title: "Burglary report review",
    meta: "Swakopmund • 21 min ago",
    status: "pending",
    tone: "warning",
    icon: ClipboardList,
  },
  {
    title: "Danger zone update",
    meta: "Walvis Bay • 44 min ago",
    status: "investigating",
    tone: "brand",
    icon: MapPinned,
  },
] satisfies Array<{
  title: string;
  meta: string;
  status: string;
  tone: Tone;
  icon: LucideIcon;
}>;

export const emergencyAlerts = [
  ["PAN-1018", "Panic", "Windhoek", "Active", "3 min ago", "Acknowledge"],
  ["MED-1042", "Medical", "Rundu", "Responding", "12 min ago", "Follow up"],
  ["FIR-1092", "Fire", "Walvis Bay", "Active", "18 min ago", "Acknowledge"],
  ["CRM-1114", "Crime in progress", "Oshakati", "Resolved", "1 hr ago", "Review"],
];

export const crimeReports = [
  ["CR-2084", "Burglary", "Swakopmund", "Pending", "High", "Assign"],
  ["CR-2091", "Vehicle theft", "Windhoek", "Investigating", "Critical", "Open"],
  ["CR-2102", "Assault", "Keetmanshoop", "Pending", "Medium", "Review"],
  ["CR-2110", "Vandalism", "Rundu", "Closed", "Low", "Archive"],
];

export const missingReports = [
  ["MR-1182", "Missing person", "Windhoek", "Pending", "Today", "Review"],
  ["MR-1193", "Lost item", "Walvis Bay", "Approved", "Yesterday", "Open"],
  ["MR-1208", "Found person", "Oshakati", "Pending", "2 days ago", "Review"],
];

export const safetyAlerts = [
  ["SA-331", "Road closure", "Khomas", "Warning", "High", "Publish"],
  ["SA-332", "Flood watch", "Kavango East", "Critical", "Critical", "Update"],
  ["SA-333", "Community advisory", "Erongo", "Info", "Medium", "Review"],
];

export const dangerZones = [
  ["DZ-090", "Katutura late-night corridor", "Windhoek", "High", "Circle", "Open"],
  ["DZ-091", "Harbor theft cluster", "Walvis Bay", "Medium", "Polygon", "Open"],
  ["DZ-092", "Transit scam hotspot", "Swakopmund", "Critical", "Circle", "Review"],
];

export const users = [
  ["USR-442", "Anna Johannes", "Windhoek", "User", "Verified", "View"],
  ["ADM-017", "Petrus Hamutenya", "Erongo", "Admin", "Active", "Manage"],
  ["USR-518", "Martha Itana", "Oshana", "User", "Pending", "Review"],
];

export const regions = [
  ["Khomas", "Windhoek", "3 active alerts", "4 admins", "Open"],
  ["Erongo", "Swakopmund", "2 pending reports", "2 admins", "Open"],
  ["Kavango East", "Rundu", "1 critical alert", "1 admin", "Open"],
  ["Karas", "Keetmanshoop", "4 danger zones", "1 admin", "Open"],
];

export const operationalSignals = [
  { label: "Active emergency alerts", value: "3", icon: ShieldAlert, tone: "emergency" },
  { label: "Notifications queued", value: "24", icon: Bell, tone: "brand" },
  { label: "Contacts notified", value: "11", icon: ContactRound, tone: "safety" },
  { label: "Critical risk zones", value: "2", icon: AlertTriangle, tone: "warning" },
] satisfies Array<{ label: string; value: string; icon: LucideIcon; tone: Tone }>;
