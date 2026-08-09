"use client";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrdersDashboardTab from "./custom/ordersDashboardTab";
import ProductControlDashboardTab from "./custom/productControlDashboardTab";
import FinancialDashboardTab from "./custom/financialDashboardTab";
import { getDictionary } from "../../../get-dictionary";
import { LayoutDashboard, Package, ShoppingCart, Wallet } from "lucide-react";

export default function DashboardMainPage({
  dictionary,
}: {
  dictionary?: Awaited<ReturnType<typeof getDictionary>>["dashboard"];
}) {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-6 overflow-auto p-6">
      <section className="relative shrink-0 overflow-hidden rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.16),_transparent_24%),linear-gradient(135deg,_#0f172a_0%,_#132144_38%,_#0f766e_100%)] p-6 text-white shadow-sm lg:p-8">
        <div className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="absolute -right-8 bottom-0 h-40 w-40 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="relative space-y-3">
          <Badge className="w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-white">
            <LayoutDashboard className="mr-1.5 size-3.5" />
            Management Dashboard
          </Badge>
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-white lg:text-4xl">
            {dictionary?.dashboard ?? "Dashboard"}
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-200">
            Pantau order & pengiriman, produksi & kontrol kualitas, serta status keuangan perusahaan dalam satu tampilan.
          </p>
        </div>
      </section>

      <Tabs defaultValue="orders" className="gap-6">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-2xl bg-slate-100 p-1.5 sm:w-fit">
          <TabsTrigger value="orders" className="h-auto gap-2 rounded-xl px-4 py-2 data-[state=active]:bg-white">
            <ShoppingCart className="size-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="product-control" className="h-auto gap-2 rounded-xl px-4 py-2 data-[state=active]:bg-white">
            <Package className="size-4" />
            Product Control
          </TabsTrigger>
          <TabsTrigger value="financial-records" className="h-auto gap-2 rounded-xl px-4 py-2 data-[state=active]:bg-white">
            <Wallet className="size-4" />
            Financial Records
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <OrdersDashboardTab />
        </TabsContent>
        <TabsContent value="product-control">
          <ProductControlDashboardTab />
        </TabsContent>
        <TabsContent value="financial-records">
          <FinancialDashboardTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
