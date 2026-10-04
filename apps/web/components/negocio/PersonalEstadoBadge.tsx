import { Badge } from "@/components/ui/Badge";
interface PersonalEstadoBadgeProps { esActivo: boolean }
export function PersonalEstadoBadge({ esActivo }: PersonalEstadoBadgeProps) {
  return (
                            <Badge
                              variant={esActivo ? "success" : "neutral"}
                              size="sm"
                              dot
                            >
                              {esActivo ? "Activo" : "Inactivo"}
                            </Badge>
  );
}
