"use client";

import { useState } from "react";
import { getDictionary } from "../../../get-dictionary";
import { productionPlanService } from "@/services";
import { IProductionBatch } from "@/types/production";
import { Plus, TestTube2, ClipboardList } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Dictionary = Awaited<
  ReturnType<typeof getDictionary>
>["quality_control_page_dic"];

type Props = {
  dictionary: Dictionary;
};

function toList<T>(response: any): T[] {
  return response?.data?.data ?? response?.data ?? [];
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function SectionEmpty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed px-6 py-10 text-center">
      <p className="text-base font-medium text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

export default function QCMain({ dictionary }: Props) {
  const [isAddQcOpen, setIsAddQcOpen] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [batches, setBatches] = useState<IProductionBatch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");

  const handleOpenAddQc = async () => {
    setIsAddQcOpen(true);
    setLoadingBatches(true);
    setBatchError(null);

    try {
      const response = await productionPlanService.getProductionBatches({
        limit: 100,
      });
      const batchList = toList<IProductionBatch>(response);
      setBatches(batchList);
      setSelectedBatchId(batchList[0] ? String(batchList[0].id) : "");
    } catch (error) {
      console.error(error);
      setBatchError("Gagal memuat data batch untuk pembuatan QC.");
      setBatches([]);
      setSelectedBatchId("");
    } finally {
      setLoadingBatches(false);
    }
  };

  const selectedBatch =
    batches.find((batch) => String(batch.id) === selectedBatchId) ?? null;

  return (
    <>
      <div className="flex min-h-0 w-full flex-1 flex-col gap-6 overflow-auto">
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-900 p-6 text-slate-50 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <Badge className="border border-teal-400/40 bg-teal-400/10 text-teal-100">
                Quality control workspace
              </Badge>
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
                  {dictionary?.title ?? "Quality Control"}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-300">
                  Halaman QC disederhanakan menjadi dua area utama: daftar QC dan
                  daftar template. Data batch hanya akan diambil saat user akan
                  menambahkan QC baru.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button className="bg-blue-500 text-white hover:bg-blue-400" onClick={handleOpenAddQc}>
                <Plus className="size-4" />
                Add QC
              </Button>
              <Button
                variant="outline"
                className="border-white/15 bg-white/5 text-slate-50 hover:bg-white/10 hover:text-slate-50"
              >
                <Plus className="size-4" />
                Add Template
              </Button>
            </div>
          </div>
        </section>

        <Tabs defaultValue="qc-list" className="gap-4">
          <TabsList className="h-auto w-full justify-start gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <TabsTrigger value="qc-list" className="px-4 py-2">
              QC List
            </TabsTrigger>
            <TabsTrigger value="template-list" className="px-4 py-2">
              Template List
            </TabsTrigger>
          </TabsList>

          <TabsContent value="qc-list">
            <Card>
              <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-xl">QC List</CardTitle>
                  <CardDescription>
                    Daftar QC akan tampil di sini setelah endpoint QC list
                    terhubung.
                  </CardDescription>
                </div>
                <Button onClick={handleOpenAddQc}>
                  <Plus className="size-4" />
                  Add QC
                </Button>
              </CardHeader>
              <CardContent>
                <SectionEmpty
                  title="Belum ada data QC yang ditampilkan"
                  description="Sesuai alur yang Anda minta, data batch tidak diambil di halaman utama. Batch hanya di-load saat tombol Add QC ditekan."
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="template-list">
            <Card>
              <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-xl">Template List</CardTitle>
                  <CardDescription>
                    Daftar template QC akan tampil di sini saat endpoint template
                    sudah terhubung.
                  </CardDescription>
                </div>
                <Button variant="outline">
                  <Plus className="size-4" />
                  Add Template
                </Button>
              </CardHeader>
              <CardContent>
                <SectionEmpty
                  title="Belum ada data template yang ditampilkan"
                  description="Area ini sengaja tidak memakai data dummy. Nanti tinggal disambungkan ke endpoint QC template."
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isAddQcOpen} onOpenChange={setIsAddQcOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add QC</DialogTitle>
            <DialogDescription>
              Batch diambil saat modal ini dibuka, lalu dipilih sebagai dasar
              pembuatan QC inspection.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-900">Select Batch</p>
              <Select
                value={selectedBatchId || undefined}
                onValueChange={setSelectedBatchId}
                disabled={loadingBatches || batches.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      loadingBatches
                        ? "Loading batches..."
                        : "Pilih batch produksi"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((batch) => (
                    <SelectItem key={batch.id} value={String(batch.id)}>
                      {batch.batchNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {batchError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {batchError}
              </div>
            ) : null}

            {selectedBatch ? (
              <div className="rounded-2xl border bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <ClipboardList className="size-4 text-slate-600" />
                  <p className="font-medium text-slate-900">Selected batch detail</p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Batch Number
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {selectedBatch.batchNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Batch ID
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {selectedBatch.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Plan ID
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {selectedBatch.planId}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Period
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {formatDate(selectedBatch.startDate)} -{" "}
                      {formatDate(selectedBatch.endDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Raw Material
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {Number(selectedBatch.rawMaterialVolume).toLocaleString("id-ID")} L
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Target Jirigen
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {Number(selectedBatch.targetQuantityJirigen).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>
            ) : loadingBatches ? (
              <div className="rounded-2xl border border-dashed px-6 py-8 text-center text-sm text-slate-500">
                Sedang mengambil data batch produksi...
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed px-6 py-8 text-center text-sm text-slate-500">
                Belum ada batch yang bisa dipilih.
              </div>
            )}

            <div className="rounded-2xl border bg-slate-50 p-4">
              <div className="flex items-center gap-2">
                <TestTube2 className="size-4 text-slate-600" />
                <p className="font-medium text-slate-900">Next step</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Setelah batch dipilih, modal atau form create QC inspection bisa
                memakai `batchId` ini untuk submit ke endpoint QC.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddQcOpen(false)}>
              Close
            </Button>
            <Button disabled={!selectedBatchId || loadingBatches}>
              Continue Create QC
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
