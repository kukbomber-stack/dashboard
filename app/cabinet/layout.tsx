import Sidebar from "@/components/Sidebar";
import PrintCover from "@/components/PrintCover";

export default function CabinetLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <Sidebar />
      <PrintCover />
      <div className="main">{children}</div>
    </div>
  );
}
