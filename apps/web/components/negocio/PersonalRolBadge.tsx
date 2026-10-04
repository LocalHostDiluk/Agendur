import { Badge } from "@/components/ui/Badge";
import { getRoleBadgeVariant, formatRoleLabel } from "@/lib/utils/personal-role";
interface PersonalRolBadgeProps { rol?: string }
export function PersonalRolBadge({ rol }: PersonalRolBadgeProps) {
  return (
                            <Badge
                              variant={getRoleBadgeVariant(rol)}
                              size="sm"
                              dot
                            >
                              {formatRoleLabel(rol)}
                            </Badge>
  );
}
