"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useLoading } from "@/context/loadingContext";
import { notificationService } from "@/services";
import { IMeta } from "@/types/common";
import { INotification } from "@/types/notification";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ArrowRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { IPurchase } from "@/types/purchase";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { ICashAdvance } from "@/types/cash-advance";

export default function NotificationsMainDashboard() {
  const searchParams = useSearchParams();
  const { setIsLoading } = useLoading();

  const [data, setData] = useState<INotification[]>([]);
  const [metadata, setMetadata] = useState<IMeta>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [notificationSelected, setNotificationSelected] =
    useState<INotification>();

  const getNotifications = async () => {
    try {
      const { data, meta } = await notificationService.getNotifications({
        page,
        per_page: pageSize,
        paginate: true,
      });

      setData(data);
      setMetadata(meta);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: "Gagal mendapatkan data proyek",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getNotification = async () => {
    try {
      const response = await notificationService.getNotification(
        searchParams.get("uid") as string
      );

      setNotificationSelected(response.data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: "Gagal mendapatkan data proyek",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.has("uid")) {
      setIsLoading(true);
      getNotification();
      getNotifications();
    } else {
      setIsLoading(true);
      getNotifications();
    }
  }, [searchParams]);

  return (
    <div className="px-3 py-5">
      {searchParams.has("uid") && notificationSelected ? (
        <DetailNotification
          data={data}
          metadata={metadata as IMeta}
          notification={notificationSelected}
        />
      ) : (
        <AllNotification data={data} metadata={metadata as IMeta} />
      )}
    </div>
  );
}

function AllNotification({
  data,
  metadata,
}: {
  data: INotification[];
  metadata: IMeta;
}) {
  return (
    <Card className="pb-1">
      <CardHeader>
        <CardTitle>Seluruh Notifikasi</CardTitle>
        <CardDescription>
          Silahkan pilih notifikasi yang ingin dilihat
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable data={data} columns={columns()} metadata={metadata} />
      </CardContent>
    </Card>
  );
}

function DetailNotification({
  data,
  metadata,
  notification,
}: {
  data: INotification[];
  metadata: IMeta;
  notification: INotification;
}) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Seluruh Notifikasi</CardTitle>
            <CardDescription>
              Silahkan pilih notifikasi yang ingin dilihat
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={data}
              columns={[
                {
                  accessorKey: "category",
                  header: "Kategori",
                },
                {
                  accessorKey: "title",
                  header: "Judul",
                },
              ]}
              metadata={metadata}
              isWithColumnSelection={false}
            />
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Detail Notifikasi : {notification.title}</CardTitle>
            <CardDescription>
              Dibuat oleh {notification.request_by.name} pada{" "}
              {format(notification.created_at || "", "EEEE, dd MMM yyyy", {
                locale: id,
              })}
            </CardDescription>
            <CardAction>
              <Button variant={"outline"} asChild>
                <Link href={"/dashboard/notifications"}>
                  <ChevronLeft /> Kembali
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-2">
            <CardDescription>Kategori: {notification.category}</CardDescription>
            <CardDescription>
              Terbaca oleh: {notification.read_by?.name || "-"}
            </CardDescription>
            <CardDescription>
              Terbaca pada:{" "}
              {notification.read_by?.read_at
                ? format(
                    new Date(notification.read_by.read_at),
                    "EEEE, dd MMM yyyy",
                    { locale: id }
                  )
                : "-"}
            </CardDescription>
          </CardContent>
          <CardContent>
            <Label>Deskripsi:</Label>
            <CardDescription>{notification.description}</CardDescription>
          </CardContent>
          {notification.category === "PURCHASE" && (
            <DetailPurchase purchase={notification.detail} />
          )}
          {notification.category === "LOAN" && (
            <DetailLoan loan={notification.detail} />
          )}
          {notification.category === "ADJUSTMANT" && <DetailAdjustment />}
          {notification.category === "PAYROLL" && <DetailPayroll />}
        </Card>
      </div>
    </div>
  );
}

function DetailPurchase({ purchase }: { purchase: IPurchase }) {
  return (
    <CardContent>
      <Table className="[&_td]:text-end">
        <TableBody>
          <TableRow>
            <TableHead>No Proyek</TableHead>
            <TableCell>{purchase.project_id}</TableCell>
          </TableRow>
          <TableRow>
            <TableHead>No Dokumen</TableHead>
            <TableCell>{purchase.doc_no}</TableCell>
          </TableRow>
          <TableRow>
            <TableHead>Tipe Dokumen</TableHead>
            <TableCell>{purchase.doc_type}</TableCell>
          </TableRow>
          <TableRow>
            <TableHead></TableHead>
            <TableCell>
              <Button asChild>
                <Link
                  href={`/dashboard/workspace/${purchase.project_id}`}
                  target="_blank"
                >
                  Lihat Selengkapnya <ArrowRight />
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  );
}

function DetailLoan({ loan }: { loan: ICashAdvance }) {
  return (
    <CardContent>
      <Table className="[&_td]:text-end">
        <TableBody>
          <TableRow>
            <TableHead>Tanggal Pengajuan</TableHead>
            <TableCell>
              {format(loan.request_date, "dd MMM yyyy", { locale: id })}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableHead>Alasan</TableHead>
            <TableCell>{loan.reason}</TableCell>
          </TableRow>
          <TableRow>
            <TableHead></TableHead>
            <TableCell>
              <Button asChild>
                <Link
                  href={`/dashboard/man-power/cash-advance`}
                  target="_blank"
                >
                  Lihat Selengkapnya <ArrowRight />
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  );
}

function DetailPayroll() {
  return (
    <CardContent>
      <Table className="[&_td]:text-end">
        <TableBody>
          <TableRow>
            <TableHead></TableHead>
            <TableCell>
              <Button asChild>
                <Link href={`/dashboard/man-power/payroll`} target="_blank">
                  Lihat Selengkapnya <ArrowRight />
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  );
}

function DetailAdjustment() {
  return (
    <CardContent>
      <Table className="[&_td]:text-end">
        <TableBody>
          <TableRow>
            <TableHead></TableHead>
            <TableCell>
              <Button asChild>
                <Link href={`/dashboard/man-power/attendance`} target="_blank">
                  Lihat Selengkapnya <ArrowRight />
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  );
}
