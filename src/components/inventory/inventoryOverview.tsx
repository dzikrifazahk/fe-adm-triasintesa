"use client";

import { type ReactNode, useState } from "react";
import {
  Barcode,
  CircleCheck,
  Clock3,
  Filter,
  Layers,
  List,
  Map as MapIcon,
  MapPin,
  MoreHorizontal,
  Package,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Tag,
  TrendingUp,
  Warehouse,
} from "lucide-react";
import clsx from "clsx";
import { IInventorySummary } from "@/types/inventory";
import { useFormText } from "@/hooks/use-form-text";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { ModalFilter } from "@/components/custom/modalFilter";

export type StockFilters = { locationId: string; category: string; status: string };

const CATEGORY_TONES = [
  "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-500/30",
  "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:border-amber-500/30",
  "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-500/15 dark:text-violet-200 dark:border-violet-500/30",
  "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-200 dark:border-cyan-500/30",
  "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/15 dark:text-blue-200 dark:border-blue-500/30",
  "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-500/15 dark:text-rose-200 dark:border-rose-500/30",
];

function toneFor(category: string, all: string[]) {
  const index = Math.max(0, all.indexOf(category));
  return CATEGORY_TONES[index % CATEGORY_TONES.length];
}

function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={clsx(
        "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#26282D]",
        className,
      )}
    >
      {children}
    </section>
  );
}

function Donut({ available, reserved }: { available: number; reserved: number }) {
  const total = available + reserved;
  const pct = total ? Math.round((available / total) * 100) : 0;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg viewBox="0 0 140 140" className="h-36 w-36 shrink-0 -rotate-90">
      <circle cx="70" cy="70" r={radius} fill="none" strokeWidth="16" className="stroke-slate-200 dark:stroke-white/10" />
      {total ? (
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          strokeWidth="16"
          strokeLinecap="round"
          className="stroke-[#2B59FF] transition-[stroke-dasharray] duration-700"
          strokeDasharray={`${(pct / 100) * circumference} ${circumference}`}
        />
      ) : null}
      <text
        x="70"
        y="70"
        className="rotate-90 fill-slate-900 text-[22px] font-bold dark:fill-slate-100"
        style={{ transformOrigin: "70px 70px" }}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {pct}%
      </text>
    </svg>
  );
}

function StatTile({
  icon,
  tone,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  tone: string;
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
      <div className="flex items-center gap-2">
        <span className={clsx("flex h-8 w-8 items-center justify-center rounded-full", tone)}>{icon}</span>
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{label}</span>
      </div>
      <div className="mt-2 text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
        {value.toLocaleString("id-ID")}
      </div>
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{hint}</div>
    </div>
  );
}

export function InventoryOverview({
  summary,
  filters,
  onFiltersChange,
  search,
  onSearchChange,
  onSearchSubmit,
  onCheckBarcode,
  onAddStock,
  onOpenLocations,
  onOpenMovements,
  onRefresh,
  refreshing,
  formatDate,
  getStatusClassName,
}: {
  summary: IInventorySummary | null;
  filters: StockFilters;
  onFiltersChange: (next: StockFilters) => void;
  search: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onCheckBarcode: (barcode?: string) => void;
  onAddStock: () => void;
  onOpenLocations: () => void;
  onOpenMovements: () => void;
  onRefresh: () => void;
  refreshing?: boolean;
  formatDate: (value?: string | null) => string;
  getStatusClassName: (status?: string) => string;
}) {
  const t = useFormText();
  const p = t.stockPage;
  const locations = summary?.locations ?? [];
  const categories = summary?.categories ?? [];
  const totals = summary?.totals;
  const activeLocation = locations.find((l) => String(l.id) === filters.locationId);
  const mapLocations = activeLocation ? [activeLocation] : locations;
  const scopeName = activeLocation?.name ?? p.allLocations;
  const tileCategories = [...new Set([...categories, ...locations.flatMap((l) => l.categories.map((c) => c.category))])];

  const setFilter = (patch: Partial<StockFilters>) => onFiltersChange({ ...filters, ...patch });
  const [filterOpen, setFilterOpen] = useState(false);
  const [draft, setDraft] = useState<StockFilters>(filters);
  const openFilter = () => {
    setDraft(filters);
    setFilterOpen(true);
  };
  const activeFilterCount = [filters.locationId, filters.category, filters.status].filter(Boolean).length;

  const movementKind = (toStatus: string, movementType: string) => {
    if (movementType === "scan_in" || movementType === "manual_in" || toStatus === "available")
      return { label: p.typeIn, tone: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30", sign: "+" };
    if (toStatus === "reserved")
      return { label: p.typeReserve, tone: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30", sign: "-" };
    if (toStatus === "shipped" || toStatus === "sold")
      return { label: p.typeOut, tone: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30", sign: "-" };
    if (toStatus === "returned")
      return { label: p.typeReturn, tone: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/30", sign: "+" };
    return { label: p.typeOther, tone: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-white/5 dark:text-slate-300 dark:border-white/10", sign: "" };
  };

  const available = activeLocation ? activeLocation.available : totals?.available ?? 0;
  const reserved = activeLocation ? activeLocation.reserved : totals?.reserved ?? 0;

  return (
    <div className="space-y-4">
      {/* Tab lokasi */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[{ id: "", name: p.allLocations }, ...locations.map((l) => ({ id: String(l.id), name: l.name }))].map((tab) => {
          const active = filters.locationId === tab.id;
          return (
            <button
              key={tab.id || "all"}
              type="button"
              onClick={() => setFilter({ locationId: tab.id })}
              className={clsx(
                "flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors",
                active
                  ? "border-[#0B3D91] bg-[#0B3D91] text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-[#0B3D91]/40 dark:border-white/10 dark:bg-[#26282D] dark:text-slate-200",
              )}
            >
              <Warehouse className="h-4 w-4" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Toolbar: cari + filter + muat ulang + aksi utama */}
      <Card className="p-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <form
            className="relative min-w-0 flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              onSearchSubmit();
            }}
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={p.searchStock}
              className="h-10 w-full rounded-md border border-input bg-transparent pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50 dark:bg-input/30"
            />
          </form>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="relative h-10 flex-1 sm:flex-none" onClick={openFilter}>
              <Filter className="h-4 w-4" /> {p.filter}
              {activeFilterCount ? (
                <span className="ml-1 rounded-full bg-[#2B59FF] px-1.5 text-[11px] font-semibold leading-5 text-white">
                  {activeFilterCount}
                </span>
              ) : null}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 w-10 p-0"
              onClick={onRefresh}
              aria-label={p.refetch}
              title={p.refetch}
            >
              <RefreshCw className={clsx("h-4 w-4", refreshing && "animate-spin")} />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Button type="button" className="h-10 bg-[#2B59FF] text-white hover:bg-[#2148d6]" onClick={() => onCheckBarcode()}>
              <Barcode className="h-4 w-4" /> {p.checkBarcode}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 border-[#2B59FF] text-[#2B59FF] hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-500/10"
              onClick={onAddStock}
            >
              <Plus className="h-4 w-4" /> {p.addStock}
            </Button>
          </div>
          </div>
        </div>
      </Card>

      <ModalFilter isOpen={filterOpen} onClose={() => setFilterOpen(false)} title={p.advanceFilter} width="w-[85vw] sm:w-[380px]">
        <div className="flex w-full flex-col gap-4 p-3">
          <div className="flex flex-col gap-2">
            <span className="font-bold">{t.common.location}</span>
            <Combobox
              icon={<MapPin className="h-4 w-4 text-slate-500" />}
              options={[{ value: "__all__", label: p.allLocations }, ...locations.map((l) => ({ value: String(l.id), label: l.name }))]}
              value={draft.locationId || "__all__"}
              onValueChange={(v) => setDraft((d) => ({ ...d, locationId: v === "__all__" ? "" : v }))}
              className="h-10"
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-bold">{t.item.category}</span>
            <Combobox
              icon={<Tag className="h-4 w-4 text-slate-500" />}
              options={[{ value: "__all__", label: p.allCategories }, ...categories.map((c) => ({ value: c, label: c }))]}
              value={draft.category || "__all__"}
              onValueChange={(v) => setDraft((d) => ({ ...d, category: v === "__all__" ? "" : v }))}
              className="h-10"
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-bold">{t.common.status}</span>
            <Combobox
              icon={<Layers className="h-4 w-4 text-slate-500" />}
              searchable={false}
              options={[
                { value: "__all__", label: p.allStatus },
                ...["available", "reserved", "shipped", "sold", "returned"].map((s) => ({ value: s, label: s })),
              ]}
              value={draft.status || "__all__"}
              onValueChange={(v) => setDraft((d) => ({ ...d, status: v === "__all__" ? "" : v }))}
              className="h-10 capitalize"
              contentClassName="capitalize"
            />
          </div>
        </div>
        <div className="sticky bottom-0 mt-6 flex flex-col gap-2 rounded-b-lg p-5 sm:flex-row sm:justify-end">
          <Button
            className="w-full bg-iprimary-blue text-white hover:bg-iprimary-blue-tertiary sm:w-auto"
            onClick={() => {
              onFiltersChange(draft);
              setFilterOpen(false);
            }}
          >
            {p.applyFilter}
          </Button>
          <Button
            className="w-full bg-yellow-500 text-white hover:bg-yellow-400 sm:w-auto"
            onClick={() => {
              const cleared = { locationId: "", category: "", status: "" };
              setDraft(cleared);
              onFiltersChange(cleared);
              setFilterOpen(false);
            }}
            aria-label={p.resetFilter}
            title={p.resetFilter}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button className="w-full bg-red-500 text-white hover:bg-red-600 sm:w-auto" onClick={() => setFilterOpen(false)}>
            {t.common.cancel}
          </Button>
        </div>
      </ModalFilter>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        {/* Peta penyimpanan per lokasi */}
        <Card>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#0B3D91] dark:bg-blue-500/15 dark:text-blue-300">
                <Warehouse className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {p.mapTitle} – {scopeName}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{p.mapDescription}</p>
              </div>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={onOpenLocations}>
              <MapIcon className="h-4 w-4" /> {p.locationDetail}
            </Button>
          </div>

          <div className={clsx("grid gap-3", activeLocation ? "grid-cols-1" : "sm:grid-cols-2 2xl:grid-cols-3")}>
            {mapLocations.map((loc) => {
              const total = loc.available + loc.reserved;
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setFilter({ locationId: String(loc.id) })}
                  className="rounded-xl border border-slate-200 p-3 text-left transition hover:border-[#2B59FF]/50 hover:shadow-sm dark:border-white/10"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{loc.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{loc.code}</div>
                    </div>
                    <span className="shrink-0 text-xs tabular-nums text-slate-500 dark:text-slate-400">
                      {loc.available} {p.available} • {loc.reserved} {p.reserved}
                    </span>
                  </div>
                  {total ? (
                    <div className={clsx("grid gap-2", activeLocation ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2")}>
                      {loc.categories.map((c) => (
                        <div
                          key={c.category}
                          className={clsx(
                            "rounded-lg border text-xs",
                            activeLocation ? "px-4 py-4" : "px-2.5 py-2",
                            toneFor(c.category, tileCategories),
                          )}
                        >
                          <div className="truncate font-semibold">{c.category}</div>
                          {activeLocation ? (
                            <div className="mt-1 text-2xl font-bold tabular-nums">{c.available + c.reserved}</div>
                          ) : null}
                          <div className="tabular-nums opacity-80">
                            {activeLocation
                              ? `${c.available} ${p.available} • ${c.reserved} ${p.reserved}`
                              : `${c.available + c.reserved} ${p.units}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-slate-200 px-2.5 py-3 text-center text-xs text-slate-400 dark:border-white/10">
                      {p.empty}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className="mb-3 font-bold text-slate-900 dark:text-slate-100">
              {p.usageTitle} – {scopeName}
            </h2>
            <div className="flex items-center gap-4">
              <Donut available={available} reserved={reserved} />
              <div className="flex-1 space-y-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <span className="h-3 w-3 rounded-full bg-[#2B59FF]" /> {p.usageAvailable}
                  </span>
                  <b className="tabular-nums text-slate-900 dark:text-slate-100">{available}</b>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <span className="h-3 w-3 rounded-full bg-slate-300 dark:bg-white/20" /> {p.usageReserved}
                  </span>
                  <b className="tabular-nums text-slate-900 dark:text-slate-100">{reserved}</b>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 font-bold text-slate-900 dark:text-slate-100">{p.summaryTitle}</h2>
            <div className="grid grid-cols-2 gap-3">
              <StatTile
                icon={<Package className="h-4 w-4" />}
                tone="bg-blue-50 text-[#2B59FF] dark:bg-blue-500/15 dark:text-blue-300"
                label={p.totalItems}
                value={totals?.inStock ?? 0}
                hint={p.totalItemsHint}
              />
              <StatTile
                icon={<CircleCheck className="h-4 w-4" />}
                tone="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
                label={p.availableItems}
                value={totals?.available ?? 0}
                hint={p.availableItemsHint}
              />
              <StatTile
                icon={<Clock3 className="h-4 w-4" />}
                tone="bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300"
                label={p.expiringSoon}
                value={totals?.expiringSoon ?? 0}
                hint={p.expiringSoonHint}
              />
              <StatTile
                icon={<TrendingUp className="h-4 w-4" />}
                tone="bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300"
                label={p.movementsToday}
                value={totals?.movementsToday ?? 0}
                hint={p.movementsTodayHint}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Aktivitas terbaru */}
      <Card>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{p.activityTitle}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{p.activityDescription}</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onOpenMovements}>
            <List className="h-4 w-4" /> {p.viewAll}
          </Button>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-300">
              <tr>
                {[p.colDatetime, p.colItem, p.colBarcode, p.colLocation, p.colType, p.colQty, p.colStatus, p.colAction].map((h) => (
                  <th key={h} className="px-3 py-2.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summary?.activity.length ? (
                summary.activity.map((a) => {
                  const kind = movementKind(a.toStatus, a.movementType);
                  return (
                    <tr key={a.id} className="border-t border-slate-100 dark:border-white/5">
                      <td className="whitespace-nowrap px-3 py-2.5 text-slate-600 dark:text-slate-300">{formatDate(a.datetime)}</td>
                      <td className="px-3 py-2.5 font-medium text-slate-900 dark:text-slate-100">{a.itemName ?? "-"}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-slate-600 dark:text-slate-300">{a.barcode ?? "-"}</td>
                      <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{a.location ?? "-"}</td>
                      <td className="px-3 py-2.5">
                        <span className={clsx("inline-block rounded-md border px-2 py-0.5 text-xs font-medium", kind.tone)}>
                          {kind.label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 tabular-nums text-slate-900 dark:text-slate-100">
                        {kind.sign}
                        {a.quantity}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={clsx("inline-block rounded-md px-2 py-0.5 text-xs font-medium capitalize", getStatusClassName(a.currentStatus))}>
                          {a.currentStatus}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          disabled={!a.barcode}
                          onClick={() => a.barcode && onCheckBarcode(a.barcode)}
                          aria-label={p.checkBarcode}
                          title={p.checkBarcode}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-slate-500 dark:text-slate-400">
                    {p.noActivity}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
