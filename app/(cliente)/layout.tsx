export default function ClienteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center">
      {children}
    </div>
  );
}
