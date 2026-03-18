"use client";

import { ModalDetail } from "@/components/custom/modalDetail";
import { getDictionary } from "../../../../get-dictionary";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { IAttendance } from "@/types/attendance";
import { format, isValid, parseISO } from "date-fns";
import Image from "next/image";
import MapSsr from "@/components/custom/Maps/Map";

/** Util: format tanggal aman */
function safeFormat(dateStr?: string | null, fmt = "dd MMM yyyy HH:mm") {
  if (!dateStr) return "-";
  const d = parseISO(dateStr);
  return isValid(d) ? format(d, fmt) : "-";
}

/** Util: parse float aman */
function toNumOrNull(v?: string | number | null): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : parseFloat(String(v).trim());
  return Number.isFinite(n) ? n : null;
}

/** Util: validasi range koordinat */
function isValidLatLng(
  lat: number | null,
  lng: number | null
): lat is number & {} {
  if (lat === null || lng === null) return false;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/** Cek apakah src aman untuk next/image (hindari error Invalid URL) */
function isSafeSrc(src?: string | null): src is string {
  if (!src) return false;
  return (
    /^https?:\/\//.test(src) || // absolute http(s)
    /^data:image\//.test(src) || // data URI
    src.startsWith("/") // served from /public
  );
}

/** Komponen foto dengan fallback kotak (bukan gambar) */
function PhotoOrPlaceholder({
  src,
  alt,
}: {
  src?: string | null;
  alt: string;
}) {
  const ok = isSafeSrc(src);
  return (
    <div className="aspect-video relative w-full rounded overflow-hidden">
      {ok ? (
        <Image src={src!} alt={alt} fill className="object-cover" />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-muted text-muted-foreground">
          <div className="text-xs">Tidak ada foto</div>
        </div>
      )}
    </div>
  );
}

export default function ModalDetailAttendance({
  dictionary,
  isOpen,
  title,
  onClose,
  detailData,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["man_power"];
  isOpen: boolean;
  title: string;
  onClose: () => void;
  detailData: IAttendance | null;
}) {
  const [locMarkerIn, setLocMarkerIn] = useState<[number, number] | null>(null);
  const [locMarkerOut, setLocMarkerOut] = useState<[number, number] | null>(
    null
  );

  useEffect(() => {
    setLocMarkerIn(null);
    setLocMarkerOut(null);

    if (!detailData) return;

    const latIn = toNumOrNull((detailData as any)?.location_lat_in);
    const lngIn = toNumOrNull((detailData as any)?.location_long_in);
    const latOut = toNumOrNull((detailData as any)?.location_lat_out);
    const lngOut = toNumOrNull((detailData as any)?.location_long_out);

    if (isValidLatLng(latIn, lngIn)) setLocMarkerIn([latIn!, lngIn!]);
    if (isValidLatLng(latOut, lngOut)) setLocMarkerOut([latOut!, lngOut!]);
  }, [detailData]);

  // Memo nilai yang sering dipakai
  const startTimeStr = useMemo(
    () => safeFormat(detailData?.start_time),
    [detailData?.start_time]
  );
  const endTimeStr = useMemo(
    () => safeFormat(detailData?.end_time),
    [detailData?.end_time]
  );

  return (
    <ModalDetail
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width="w-[80vw]"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
        {/* LEFT: Check-in info */}
        <Card>
          <CardHeader>
            <CardTitle>Check-in</CardTitle>
            <CardDescription>{startTimeStr}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              Lokasi: {detailData?.location_in || "-"}
            </div>
            <div className="text-sm">
              Lat: {detailData?.location_lat_in || "-"}, Long:{" "}
              {detailData?.location_long_in || "-"}
            </div>

            <PhotoOrPlaceholder src={detailData?.image_in} alt="Check-in" />

            {/* Render peta hanya jika koordinat valid */}
            {locMarkerIn ? (
              <MapSsr
                marker={locMarkerIn}
                setMarker={() => {}}
                onLocationSelect={() => {}}
              />
            ) : (
              <div className="text-xs text-muted-foreground">
                Peta tidak tersedia (koordinat tidak valid).
              </div>
            )}
          </CardContent>
        </Card>

        {/* RIGHT: Check-out info */}
        <Card>
          <CardHeader>
            <CardTitle>Check-out</CardTitle>
            <CardDescription>{endTimeStr}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              Lokasi: {detailData?.location_out || "-"}
            </div>
            <div className="text-sm">
              Lat: {detailData?.location_lat_out || "-"}, Long:{" "}
              {detailData?.location_long_out || "-"}
            </div>

            <PhotoOrPlaceholder src={detailData?.image_out} alt="Check-out" />

            {locMarkerOut ? (
              <MapSsr
                marker={locMarkerOut}
                setMarker={() => {}}
                onLocationSelect={() => {}}
              />
            ) : (
              <div className="text-xs text-muted-foreground">
                Peta tidak tersedia (koordinat tidak valid).
              </div>
            )}
          </CardContent>
        </Card>

        {/* Full detail card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Detail Kehadiran</CardTitle>
            <CardDescription className="text-xs">
              Ringkasan data presensi karyawan
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>Project: {detailData?.project_name || "-"}</div>
            <div>Task: {detailData?.budget_name || "-"}</div>
            <div>Durasi: {detailData?.duration ?? "-"} jam</div>
            <div>Status: {detailData?.status || "-"}</div>
            <div>Tipe: {detailData?.type || "-"}</div>
            <div>Presensi: {detailData?.status || "-"}</div>
            <div>Dibuat oleh: {detailData?.created_by || "-"}</div>
          </CardContent>
        </Card>
      </div>
    </ModalDetail>
  );
}
