import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { IconTrendingUp } from "@tabler/icons-react";

export default function ManPowerSectionCard({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("grid md:grid-cols-2 gap-4", className)}>
      <Card className="bg-gradient-to-br from-blue-600 to-blue-300 text-white">
        <CardHeader className="space-y-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardDescription className="text-white">
                Attendance
              </CardDescription>
              <CardTitle className="mt-1 text-2xl font-semibold tabular-nums break-words @[250px]/card:text-3xl">
                100 Person
              </CardTitle>
            </div>

            <CardAction className="shrink-0">
              <Badge
                variant="outline"
                className="flex items-center gap-1.5 whitespace-nowrap text-white"
              >
                <IconTrendingUp className="size-4 shrink-0" />
              </Badge>
            </CardAction>
          </div>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <span className="line-clamp-1">Total Attendance Today</span>
            <IconTrendingUp className="size-4 shrink-0" />
          </div>
        </CardFooter>
      </Card>
      <Card className="bg-gradient-to-br from-green-600 to-green-300 text-white">
        <CardHeader className="space-y-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardDescription className="text-white">
                Daily Salary
              </CardDescription>
              <CardTitle className="mt-1 text-2xl font-semibold tabular-nums break-words @[250px]/card:text-3xl">
                Rp 10.000
              </CardTitle>
            </div>

            <CardAction className="shrink-0">
              <Badge
                variant="outline"
                className="flex items-center gap-1.5 whitespace-nowrap text-white"
              >
                <IconTrendingUp className="size-4 shrink-0" />
              </Badge>
            </CardAction>
          </div>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <span className="line-clamp-1">Total Daily Salary</span>
            <IconTrendingUp className="size-4 shrink-0" />
          </div>
        </CardFooter>
      </Card>
      <Card className="bg-gradient-to-br from-purple-600 to-purple-400 text-white">
        <CardHeader className="space-y-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardDescription className="text-white">
                Overtime Hourly Salary
              </CardDescription>
              <CardTitle className="mt-1 text-2xl font-semibold tabular-nums break-words @[250px]/card:text-3xl">
                Rp 10.000
              </CardTitle>
            </div>

            <CardAction className="shrink-0">
              <Badge
                variant="outline"
                className="flex items-center gap-1.5 whitespace-nowrap text-white"
              >
                <IconTrendingUp className="size-4 shrink-0" />
              </Badge>
            </CardAction>
          </div>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <span className="line-clamp-1">Total Overtime Hourly Salary</span>
            <IconTrendingUp className="size-4 shrink-0" />
          </div>
        </CardFooter>
      </Card>
      <Card className="bg-gradient-to-br from-amber-600 to-amber-400 text-white">
        <CardHeader className="space-y-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardDescription className="text-white">
                Daily Late Salary
              </CardDescription>
              <CardTitle className="mt-1 text-2xl font-semibold tabular-nums break-words @[250px]/card:text-3xl">
                Rp 10.000
              </CardTitle>
            </div>

            <CardAction className="shrink-0">
              <Badge
                variant="outline"
                className="flex items-center gap-1.5 whitespace-nowrap text-white"
              >
                <IconTrendingUp className="size-4 shrink-0" />
              </Badge>
            </CardAction>
          </div>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <span className="line-clamp-1">Total Daily Late Salary</span>
            <IconTrendingUp className="size-4 shrink-0" />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
