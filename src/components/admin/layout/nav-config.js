import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Boxes,
  Users,
  Tag,
  Home,
  Menu,
  Image as ImageIcon,
  Images,
  BarChart2,
  TrendingUp,
  PieChart,
  UserCheck,
  Truck,
  CreditCard,
  RotateCcw,
  UserCog,
  History,
  Settings,
} from "lucide-react";

export const NAV_SECTIONS = [
  {
    heading: "Overview",
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true }],
  },
  {
    heading: "Commerce",
    items: [
      { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
      { label: "Products", href: "/admin/products", icon: Package },
      { label: "Collections", href: "/admin/collections", icon: Layers },
      { label: "Inventory", href: "/admin/inventory", icon: Boxes },
      { label: "Customers", href: "/admin/customers", icon: Users },
      { label: "Discounts", href: "/admin/discounts", icon: Tag },
    ],
  },
  {
    heading: "Content",
    items: [
      { label: "Homepage", href: "/admin/content/homepage", icon: Home },
      { label: "Navigation", href: "/admin/content/navigation", icon: Menu },
      { label: "Banners", href: "/admin/content/banners", icon: ImageIcon },
      { label: "Media", href: "/admin/content/media", icon: Images },
    ],
  },
  {
    heading: "Analytics",
    items: [
      { label: "Overview", href: "/admin/analytics", icon: BarChart2, exact: true },
      { label: "Sales", href: "/admin/analytics/sales", icon: TrendingUp },
      { label: "Products", href: "/admin/analytics/products", icon: PieChart },
      { label: "Customers", href: "/admin/analytics/customers", icon: UserCheck },
    ],
  },
  {
    heading: "Operations",
    items: [
      { label: "Shipping", href: "/admin/shipping", icon: Truck },
      { label: "Payments", href: "/admin/payments", icon: CreditCard },
      { label: "Returns", href: "/admin/returns", icon: RotateCcw },
    ],
  },
  {
    heading: "System",
    items: [
      { label: "Staff", href: "/admin/staff", icon: UserCog },
      { label: "Activity Log", href: "/admin/activity", icon: History },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export const ALL_NAV_ITEMS = NAV_SECTIONS.flatMap((section) => section.items);
