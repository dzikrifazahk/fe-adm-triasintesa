import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ICountingProject } from "@/types/project";
import { formatCurrencyIDR } from "@/utils/currencyFormatter";

interface Props {
  data: ICountingProject | undefined;
}

export function ProjectSectionCards({ data }: Props) {
  return (
    <div
      className="
        grid gap-4 px-4 lg:px-6
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-6
      "
    >
      {/* Billing */}
      <Card className="@container/card md:col-span-1 xl:col-span-2">
        <CardHeader className="space-y-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardDescription>Billing</CardDescription>
              <CardTitle className="mt-1 text-2xl font-semibold tabular-nums break-words @[250px]/card:text-3xl">
                {formatCurrencyIDR(data?.billing ?? 0)}
              </CardTitle>
            </div>

            <CardAction className="shrink-0">
              <Badge
                variant="outline"
                className="flex items-center gap-1.5 whitespace-nowrap"
              >
                <IconTrendingUp className="size-4 shrink-0" />
              </Badge>
            </CardAction>
          </div>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <span className="line-clamp-1">Total Billing Projects</span>
            <IconTrendingUp className="size-4 shrink-0" />
          </div>
          <div className="text-muted-foreground">
            Calculated from last 30 days
          </div>
        </CardFooter>
      </Card>

      {/* Cost Estimate */}
      <Card className="@container/card md:col-span-1 xl:col-span-2">
        <CardHeader className="space-y-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardDescription>Real Cost Estimate</CardDescription>
              <CardTitle className="mt-1 text-2xl font-semibold tabular-nums break-words @[250px]/card:text-3xl">
                {formatCurrencyIDR(data?.real_cost_estimate ?? 0)}
              </CardTitle>
            </div>

            <CardAction className="shrink-0">
              <Badge
                variant="outline"
                className="flex items-center gap-1.5 whitespace-nowrap"
              >
                <IconTrendingDown className="size-4 shrink-0" />
              </Badge>
            </CardAction>
          </div>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <IconTrendingDown className="size-4 shrink-0" />
          </div>
          <div className="text-muted-foreground">
            Acquisition needs attention
          </div>
        </CardFooter>
      </Card>

      {/* Margin */}
      <Card className="@container/card md:col-span-2 xl:col-span-2">
        <CardHeader className="space-y-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardDescription>Margin</CardDescription>
              <CardTitle className="mt-1 text-2xl font-semibold tabular-nums break-words @[250px]/card:text-3xl">
                {formatCurrencyIDR(data?.margin ?? 0)}
              </CardTitle>
            </div>

            <CardAction className="shrink-0">
              <Badge
                variant="outline"
                className="flex items-center gap-1.5 whitespace-nowrap"
              >
                <IconTrendingUp className="size-4 shrink-0" />
              </Badge>
            </CardAction>
          </div>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <span className="line-clamp-1">Strong user retention</span>
            <IconTrendingUp className="size-4 shrink-0" />
          </div>
          <div className="text-muted-foreground">Engagement exceed targets</div>
        </CardFooter>
      </Card>

      {/* Percent – row bawah, lebih lebar */}
      <Card className="@container/card md:col-span-2 xl:col-span-3">
        <CardHeader className="space-y-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardDescription>Percent</CardDescription>
              <CardTitle className="mt-1 text-2xl font-semibold tabular-nums break-words @[250px]/card:text-3xl">
                {data?.percent ?? "0"}
              </CardTitle>
            </div>

            <CardAction className="shrink-0">
              <Badge
                variant="outline"
                className="flex items-center gap-1.5 whitespace-nowrap"
              >
                <IconTrendingUp className="size-4 shrink-0" />
              </Badge>
            </CardAction>
          </div>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <span className="line-clamp-1">Steady performance increase</span>
            <IconTrendingUp className="size-4 shrink-0" />
          </div>
          <div className="text-muted-foreground">Meets growth projections</div>
        </CardFooter>
      </Card>

      {/* Projects – row bawah, lebar juga */}
      <Card className="@container/card md:col-span-2 xl:col-span-3">
        <CardHeader className="space-y-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardDescription>Projects</CardDescription>
              <CardTitle className="mt-1 text-2xl font-semibold tabular-nums break-words @[250px]/card:text-3xl">
                {data?.total_projects ?? 0}
              </CardTitle>
            </div>

            <CardAction className="shrink-0">
              <Badge
                variant="outline"
                className="flex items-center gap-1.5 whitespace-nowrap"
              >
                <IconTrendingUp className="size-4 shrink-0" />
              </Badge>
            </CardAction>
          </div>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <span className="line-clamp-1">Total Projects Now</span>
            <IconTrendingUp className="size-4 shrink-0" />
          </div>
          <div className="text-muted-foreground">Meets growth projections</div>
        </CardFooter>
      </Card>
    </div>
  );
}
