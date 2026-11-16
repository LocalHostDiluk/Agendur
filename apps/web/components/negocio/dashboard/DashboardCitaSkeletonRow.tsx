import { SkeletonBlock, SkeletonText } from "@/components/ui/Skeleton";

interface DashboardCitaSkeletonRowProps {
  i: number;
}

export function DashboardCitaSkeletonRow({ i }: DashboardCitaSkeletonRowProps) {
  return (
    <tr key={i} className="h-12">
      <td className="py-3 px-4">
        <SkeletonText className="h-3 w-16" />
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <SkeletonBlock className="w-8 h-8 rounded-full shrink-0" />
          <div className="space-y-1.5 w-full">
            <SkeletonText
              className="h-3.5"
              style={{ width: "70%" }}
            />
            <SkeletonText
              className="h-2.5"
              style={{ width: "40%" }}
            />
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <SkeletonText className="h-3" style={{ width: "50%" }} />
      </td>
      <td className="py-3 px-4">
        <SkeletonText className="h-3" style={{ width: "70%" }} />
      </td>
      <td className="py-3 px-4">
        <SkeletonText className="h-3" style={{ width: "40%" }} />
      </td>
      <td className="py-3 px-4">
        <SkeletonText className="h-3" style={{ width: "30%" }} />
      </td>
      <td className="py-3 px-4 text-right">
        <SkeletonBlock className="h-5 w-20 rounded-full ml-auto" />
      </td>
    </tr>
  );
}
