import PageHeader from "@/components/admin/ui/PageHeader";
import SettingsNav from "@/components/admin/settings/SettingsNav";

export default function SettingsLayout({ children }) {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Settings" description="Configure how your store operates." />
      <div className="flex flex-col gap-6 lg:flex-row">
        <SettingsNav />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
