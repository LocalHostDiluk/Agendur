import { QueryProvider } from "@/components/providers/QueryProvider";

export default function ClienteReservaLayout({ children }: LayoutProps<"/">) {
  return <QueryProvider>{children}</QueryProvider>;
}
