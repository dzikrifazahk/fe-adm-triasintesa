"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SummaryCard } from "./custom/summaryCard";
import { ProductionForm } from "./custom/productionForm";
import { QCTable } from "./custom/qcTable";
import { TankStatus } from "./custom/tankStatus";
import { SalesTable } from "./custom/salesTable";

export default function WorkspaceManPowerMain() {
  return (
    <div className="p-6 space-y-6">

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard title="Total Produksi Hari Ini" value="2,400 Liter" sub="+12% dari kemarin" />
        <SummaryCard title="Stok Jerrycan (20L)" value="50 Unit" sub="Siap kirim" />
        <SummaryCard title="Pending QC Approval" value="3 Batch" sub="Butuh Review Direktur" />
        <SummaryCard title="Penjualan Bulan Ini" value="Rp 450.2M" sub="On Target" />
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          <ProductionForm />
          <QCTable />
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <TankStatus />
          <SalesTable />
        </div>

      </div>
    </div>
  );
}