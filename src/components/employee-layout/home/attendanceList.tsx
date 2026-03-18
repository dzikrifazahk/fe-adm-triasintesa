"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock4 } from "lucide-react";
import Link from "next/link";

export default function AttendanceList({
  title,
  seeAllHref,
  items,
}: {
  title: string;
  seeAllHref?: string;
  items: { id: string; dateLabel: string; status: string; subtle?: string }[];
}) {
  return (
    <Card className="mx-2 lg:mx-5">
      <CardContent className="">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-base font-semibold">
            <Clock4 className="size-4" />
            <span className="text-sm lg:text-base md:text-base">{title}</span>
          </div>
          {seeAllHref && (
            <Link
              href={seeAllHref}
              className="text-xs lg:text-sm md:text-sm text-sky-700 hover:underline"
            >
              Lihat Semua
            </Link>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {items.map((x, idx) => (
            <div
              key={x.id}
              className="rounded-xl border bg-card p-3 flex items-center justify-between"
            >
              <div>
                <div className="font-medium">{x.dateLabel}</div>
                {x.subtle && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {x.subtle}
                  </div>
                )}
              </div>
              <Badge variant="secondary" className="bg-rose-100 text-rose-700">
                {x.status}
              </Badge>
            </div>
          ))}
        </div>

        <Separator className="my-4" />
        <div className="text-sm text-muted-foreground font-medium">
          Saturday, 30 Aug 2025
        </div>
      </CardContent>
    </Card>
  );
}
