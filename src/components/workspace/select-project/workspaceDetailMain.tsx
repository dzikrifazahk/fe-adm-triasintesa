"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FaBoxOpen,
  FaCheckToSlot,
  FaExpeditedssl,
  FaInfo,
  FaMoneyBillTrendUp,
  FaPercent,
  FaRocket,
  FaStreetView,
  FaClipboardList,
  FaIdCardClip,
} from "react-icons/fa6";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IProject } from "@/types/project";
import { projectService } from "@/services";
import { formatCurrencyIDR } from "@/utils/currencyFormatter";
import { MobileContext } from "@/hooks/use-mobile-ssr";
import { getDictionary } from "../../../../get-dictionary";
import { useWorkspaceContext } from "@/context/workspaceContext";
import { Badge } from "@/components/ui/badge";
import { useLoading } from "@/context/loadingContext";
import { getStatusClass } from "@/helpers/statusCostProgressHelper";

interface Props {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["workspace"];
}

export default function WorkspaceDetailMain({ dictionary }: Props) {
  const params = useParams();
  const router = useRouter();
  const { isMobile } = useContext(MobileContext);
  const { setIsLoading } = useLoading();
  const { setProjectName } = useWorkspaceContext();
  const [isLoading, setIsLoadingFetch] = useState(false);
  const [data, setData] = useState<IProject[]>([]);

  const openStat = "Open < 90%";
  const needToCheckStat = "> 90%  &  > 100%";
  const closedStat = "Closed 100%";

  const handleChangeMenu = (id: string) => {
    setIsLoading(true);
    router.push(`/dashboard/workspace/${params.workspace}/${id}`);
  };

  const fetchProject = async () => {
    try {
      setIsLoadingFetch(true);
      const { data } = await projectService.getProject(
        String(params.workspace)
      );
      setProjectName(data[0].name);
      setData(data);
    } catch (error) {
      setIsLoadingFetch(false);
      console.error("Error fetching data:", error);
    } finally {
      setIsLoadingFetch(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, []);

  return (
    <div className="overflow-auto flex flex-col gap-6 md:gap-8">
      {/* Top: Info + KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Informasi */}
        <Card className="@container/card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold">Informasi</CardTitle>
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#7B8191]">
                <FaInfo className="h-3 w-3" />
              </span>
            </div>
            <Separator className="bg-[#C9CEDA]" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:gap-4">
            <StatRow
              icon={<FaBoxOpen className="dark:text-muted"/>}
              label="Open"
              value={openStat}
              valueClass="text-[#76787C]"
            />
            <StatRow
              icon={<FaCheckToSlot className="dark:text-muted"/>}
              label="Need To Check"
              value={needToCheckStat}
              valueClass="text-[#76787C]"
            />
            <StatRow
              icon={<FaExpeditedssl className="dark:text-muted"/>}
              label="Closed"
              value={closedStat}
              valueClass="text-[#76787C]"
            />
          </CardContent>
        </Card>

        {/* KPIs (2x2 fixed grid) */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 items-stretch">
            {/* Status Cost Progress */}
            <Card className="@container/card overflow-hidden">
              <CardHeader className="min-w-0">
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <CardDescription className="truncate">
                    Status Cost Progress
                  </CardDescription>
                  <Badge variant="outline" className="shrink-0 gap-2">
                    <FaRocket className="shrink-0" />
                    Status
                  </Badge>
                </div>

                {isLoading ? (
                  <Skeleton className="h-7 w-40 mt-1" />
                ) : (
                  <CardTitle
                    className={getStatusClass(
                      data[0]?.cost_progress_project?.status_cost_progres ??
                        "-",
                      {
                        base: "text-xs p-2 rounded-lg tabular-nums w-fit",
                      }
                    )}
                  >
                    {data[0]?.cost_progress_project?.status_cost_progres ?? "-"}
                  </CardTitle>
                )}
              </CardHeader>
            </Card>

            {/* Percent */}
            <Card className="@container/card overflow-hidden">
              <CardHeader className="min-w-0">
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <CardDescription className="truncate">
                    Percent
                  </CardDescription>
                  <Badge variant="outline" className="shrink-0 gap-2">
                    <FaPercent className="shrink-0" />
                    Percent
                  </Badge>
                </div>

                {isLoading ? (
                  <Skeleton className="h-7 w-40 mt-1" />
                ) : (
                  <CardTitle className="text-base tabular-nums break-words">
                    {data[0]?.cost_progress_project?.percent
                      ? `${data[0]?.cost_progress_project?.percent}`
                      : "-"}
                  </CardTitle>
                )}
              </CardHeader>
            </Card>

            {/* Real Cost */}
            <Card className="@container/card overflow-hidden">
              <CardHeader className="min-w-0">
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <CardDescription className="truncate">
                    Real Cost
                  </CardDescription>
                  <Badge variant="outline" className="shrink-0 gap-2">
                    <FaMoneyBillTrendUp className="shrink-0" />
                    Purchase
                  </Badge>
                </div>

                {isLoading ? (
                  <Skeleton className="h-7 w-40 mt-1" />
                ) : (
                  <CardTitle className="text-base tabular-nums break-words">
                    {formatCurrencyIDR(
                      data[0]?.cost_progress_project?.real_cost
                    ) ?? "-"}
                  </CardTitle>
                )}
              </CardHeader>
            </Card>

            {/* Man Power */}
            <Card className="@container/card overflow-hidden">
              <CardHeader className="min-w-0">
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <CardDescription className="truncate">
                    Man Power
                  </CardDescription>
                  <Badge variant="outline" className="gap-2">
                    <FaStreetView className="shrink-0" />
                    Payroll
                  </Badge>
                </div>

                {isLoading ? (
                  <Skeleton className="h-7 w-40 mt-1" />
                ) : (
                  <CardTitle className="text-base tabular-nums break-words">
                    {formatCurrencyIDR(
                      data[0]?.cost_progress_project?.payroll_cost
                    ) ?? "-"}
                  </CardTitle>
                )}
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="flex flex-col items-center gap-3 md:gap-4">
        <h2 className="text-base md:text-lg font-bold text-black text-center dark:text-white">
          Silahkan Pilih Menu untuk Proyek {data[0]?.name}
        </h2>

        <div className="w-full flex justify-center">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-md">
            <button
              type="button"
              onClick={() => handleChangeMenu("purchase")}
              className={`cursor-pointer group flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-secondary bg-iprimary-blue text-white transition-colors hover:bg-iprimary-blue-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-iprimary-blue p-4 ${
                isMobile ? "h-32" : "h-28"
              }`}
            >
              <FaClipboardList size={32} className="text-white" />
              <span className="text-sm font-medium">Purchase</span>
            </button>

            <button
              type="button"
              onClick={() => handleChangeMenu("man-power")}
              className={`cursor-pointer group flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-secondary bg-iprimary-blue text-white transition-colors hover:bg-iprimary-blue-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-iprimary-blue p-4 ${
                isMobile ? "h-32" : "h-28"
              }`}
            >
              <FaIdCardClip size={32} className="text-white" />
              <span className="text-sm font-medium">Man Power</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center gap-3 text-xs sm:text-sm">
      <span className="p-2 rounded-full bg-white shadow-sm">{icon}</span>
      <div className="flex flex-col">
        <div className="font-semibold lg:text-xs md:text-xs">{label}</div>
        <div className={`${valueClass} text-sm lg:text-xs md:text-xs`}>
          {value}
        </div>
      </div>
    </div>
  );
}
