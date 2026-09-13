import AdminShell from "@/components/admin/layout/AdminShell";

export const metadata = {
  title: "Admin — LL Collectives",
  description: "LL Collectives store operations.",
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
