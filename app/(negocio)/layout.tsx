import { Sidebar } from "@/components/negocio/Sidebar";
import { Header } from "@/components/negocio/Header";

export default function NegocioLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}
