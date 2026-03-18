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
import { formatCurrencyIDR } from "@/utils/currencyFormatter";
import { IPurchaseCounting } from "@/types/purchase";

interface Props {
  data: IPurchaseCounting | undefined;
}

export function PurchaseSectionCard({ data }: Props) {
  const submit = data?.submit;
  const verified = data?.verified;
  const paymentRequest = data?.payment_request;
  const paid = data?.paid;

  return (
    <div
      className="
        grid gap-4 px-4 lg:px-6
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-2
      "
    >
      {/* Submit */}
      <Card className="@container/card">
        <CardHeader className="space-y-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardDescription>Submit</CardDescription>
              <CardTitle className="mt-1 text-2xl font-semibold tabular-nums break-words @[250px]/card:text-3xl">
                {formatCurrencyIDR(submit?.total ?? 0)}
              </CardTitle>
            </div>

            <CardAction className="shrink-0">
              <Badge
                variant="outline"
                className="flex items-center gap-1.5 whitespace-nowrap"
              >
                <IconTrendingUp className="size-4 shrink-0" />
                <span className="text-[11px] font-medium">
                  {submit?.count ?? 0} request
                </span>
              </Badge>
            </CardAction>
          </div>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <span className="line-clamp-1">
              Pengajuan purchase yang sudah dibuat
            </span>
          </div>
          <div className="text-muted-foreground">
            Menunggu proses verifikasi dari pihak terkait.
          </div>
        </CardFooter>
      </Card>

      {/* Verified */}
      <Card className="@container/card">
        <CardHeader className="space-y-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardDescription>Verified</CardDescription>
              <CardTitle className="mt-1 text-2xl font-semibold tabular-nums break-words @[250px]/card:text-3xl">
                {formatCurrencyIDR(verified?.total ?? 0)}
              </CardTitle>
            </div>

            <CardAction className="shrink-0">
              <Badge
                variant="outline"
                className="flex items-center gap-1.5 whitespace-nowrap"
              >
                <IconTrendingUp className="size-4 shrink-0" />
                <span className="text-[11px] font-medium">
                  {verified?.count ?? 0} request
                </span>
              </Badge>
            </CardAction>
          </div>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <span className="line-clamp-1">
              Purchase yang sudah diverifikasi
            </span>
          </div>
          <div className="text-muted-foreground">
            Siap dilanjutkan ke proses permintaan pembayaran.
          </div>
        </CardFooter>
      </Card>

      {/* Payment Request */}
      <Card className="@container/card">
        <CardHeader className="space-y-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardDescription>Payment Request</CardDescription>
              <CardTitle className="mt-1 text-2xl font-semibold tabular-nums break-words @[250px]/card:text-3xl">
                {formatCurrencyIDR(paymentRequest?.total ?? 0)}
              </CardTitle>
            </div>

            <CardAction className="shrink-0">
              <Badge
                variant="outline"
                className="flex items-center gap-1.5 whitespace-nowrap"
              >
                <IconTrendingDown className="size-4 shrink-0" />
                <span className="text-[11px] font-medium">
                  {paymentRequest?.count ?? 0} request
                </span>
              </Badge>
            </CardAction>
          </div>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <span className="line-clamp-1">
              Permintaan pembayaran yang sedang diproses
            </span>
          </div>
          <div className="text-muted-foreground">
            Menunggu approval & eksekusi dari tim finance.
          </div>
        </CardFooter>
      </Card>

      {/* Paid */}
      <Card className="@container/card">
        <CardHeader className="space-y-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardDescription>Paid</CardDescription>
              <CardTitle className="mt-1 text-2xl font-semibold tabular-nums break-words @[250px]/card:text-3xl">
                {formatCurrencyIDR(paid?.total ?? 0)}
              </CardTitle>
            </div>

            <CardAction className="shrink-0">
              <Badge
                variant="outline"
                className="flex items-center gap-1.5 whitespace-nowrap"
              >
                <IconTrendingUp className="size-4 shrink-0" />
                <span className="text-[11px] font-medium">
                  {paid?.count ?? 0} request
                </span>
              </Badge>
            </CardAction>
          </div>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <span className="line-clamp-1">
              Purchase yang sudah dibayar lunas
            </span>
          </div>
          <div className="text-muted-foreground">
            Menunjukkan realisasi pengeluaran dari purchase order.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
