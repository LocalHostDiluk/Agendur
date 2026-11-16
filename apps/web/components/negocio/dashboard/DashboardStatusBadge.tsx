import { Badge } from "@/components/ui";

interface DashboardStatusBadgeProps {
  estado: string;
}

export function DashboardStatusBadge({ estado }: DashboardStatusBadgeProps) {
  switch (estado) {
    case "confirmada":
      return (
        <Badge variant="success" size="sm" dot={true}>
          Confirmada
        </Badge>
      );
    case "pendiente_pago":
      return (
        <Badge variant="warning" size="sm" dot={true}>
          Pendiente pago
        </Badge>
      );
    case "completada":
      return (
        <Badge variant="grape" size="sm" dot={true}>
          Completada
        </Badge>
      );
    case "cancelada":
      return (
        <Badge variant="danger" size="sm" dot={true}>
          Cancelada
        </Badge>
      );
    default:
      return (
        <Badge variant="neutral" size="sm" dot={true}>
          {estado}
        </Badge>
      );
  }
}
