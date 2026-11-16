import { getInitials } from "@/lib/utils/dashboard-appointment";

interface DashboardClienteAvatarProps {
  clienteNombre: string;
}

export function DashboardClienteAvatar({ clienteNombre }: DashboardClienteAvatarProps) {
  return (
    <div
      className="w-8 h-8 rounded-full bg-grape-soft text-grape font-bold flex items-center justify-center text-xs shrink-0 select-none border border-grape/20"
      aria-hidden="true"
    >
      {getInitials(clienteNombre)}
    </div>
  );
}
