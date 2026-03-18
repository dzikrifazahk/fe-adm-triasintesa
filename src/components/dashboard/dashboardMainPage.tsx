"use client";

import { useState } from "react";
import { FaProjectDiagram, FaShoppingCart, FaUsersCog } from "react-icons/fa";
import { FaGrip } from "react-icons/fa6";
import { AnimatePresence, motion } from "framer-motion";
import { ChartAreaInteractive } from "./chart-area-interactive";
import { DataTable } from "./data-table";
import { getDictionary } from "../../../get-dictionary";
import ProjectDashboardMain from "./projects/projectsMainDashboard";
import PurchaseDashboardMain from "./purchase/purchaseMainDashboard";
import ManPowerMainDashboard from "./man-power/manPowerMainDashboard";

type MenuKey = "projects" | "purchase" | "manpower";

export default function WorkspaceManPowerMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["dashboard"];
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<MenuKey>("manpower");

  const handleSelectMenu = (menu: MenuKey) => {
    setActiveMenu(menu);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Overlay blur saat menu terbuka (dianimasikan) */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-20 bg-black/10 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Floating button + modern menu */}
      <div className="absolute left-3 top-3 z-30 flex items-start gap-2">
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-full bg-iprimary-blue text-white px-3 py-2 text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-iprimary-blue focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#292A2D] cursor-pointer hover:bg-iprimary-blue-tertiary transition"
        >
          <FaGrip className="h-4 w-4" />
        </button>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              key="menu-card"
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="min-w-[230px] rounded-2xl border border-zinc-200/70 bg-white/95 shadow-xl text-sm py-2 dark:bg-[#18181B]/95 dark:border-zinc-700/70 backdrop-blur-md"
            >
              {/* Header kecil */}
              <div className="px-4 pb-2 pt-1">
                <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
                  Quick Switch
                </p>
              </div>

              <div className="px-1">
                {/* Projects */}
                <button
                  type="button"
                  onClick={() => handleSelectMenu("projects")}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all cursor-pointer
                  ${
                    activeMenu === "projects"
                      ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 shadow-md ring-1 ring-blue-400/70"
                      : "hover:bg-zinc-50 hover:shadow-sm dark:hover:bg-zinc-800/80"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-sm transition-transform
                    ${
                      activeMenu === "projects"
                        ? "bg-gradient-to-br from-blue-600 to-sky-500 group-hover:scale-105"
                        : "bg-gradient-to-br from-blue-500/90 to-sky-400/90 group-hover:scale-105"
                    }`}
                  >
                    <FaProjectDiagram className="h-4 w-4" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="text-[13px] font-medium">Projects</span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Overview & margin progress
                    </span>
                  </div>
                  {activeMenu === "projects" && (
                    <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-500">
                      Active
                    </span>
                  )}
                </button>

                {/* Divider tipis */}
                <div className="mx-3 my-1 h-px bg-zinc-100 dark:bg-zinc-800" />

                {/* Purchase */}
                <button
                  type="button"
                  onClick={() => handleSelectMenu("purchase")}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all cursor-pointer
                  ${
                    activeMenu === "purchase"
                      ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 shadow-md ring-1 ring-emerald-400/70"
                      : "hover:bg-zinc-50 hover:shadow-sm dark:hover:bg-zinc-800/80"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-sm transition-transform
                    ${
                      activeMenu === "purchase"
                        ? "bg-gradient-to-br from-emerald-600 to-teal-500 group-hover:scale-105"
                        : "bg-gradient-to-br from-emerald-500/90 to-teal-400/90 group-hover:scale-105"
                    }`}
                  >
                    <FaShoppingCart className="h-4 w-4" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="text-[13px] font-medium">Purchase</span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Purchase request & budget
                    </span>
                  </div>
                  {activeMenu === "purchase" && (
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-500">
                      Active
                    </span>
                  )}
                </button>

                {/* Divider tipis */}
                <div className="mx-3 my-1 h-px bg-zinc-100 dark:bg-zinc-800" />

                {/* Manpower */}
                <button
                  type="button"
                  onClick={() => handleSelectMenu("manpower")}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all cursor-pointer
                  ${
                    activeMenu === "manpower"
                      ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 shadow-md ring-1 ring-amber-400/70"
                      : "hover:bg-zinc-50 hover:shadow-sm dark:hover:bg-zinc-800/80"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-sm transition-transform
                    ${
                      activeMenu === "manpower"
                        ? "bg-gradient-to-br from-amber-600 to-orange-500 group-hover:scale-105"
                        : "bg-gradient-to-br from-amber-500/90 to-orange-400/90 group-hover:scale-105"
                    }`}
                  >
                    <FaUsersCog className="h-4 w-4" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="text-[13px] font-medium">Manpower</span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Attendance & cost tracking
                    </span>
                  </div>
                  {activeMenu === "manpower" && (
                    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-500">
                      Active
                    </span>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Konten utama */}
      <div className="flex flex-col min-h-full overflow-y-auto">
        <div className="@container/main flex flex-1 flex-col gap-2">
          {activeMenu === "projects" && (
            <ProjectDashboardMain dictionary={dictionary} />
          )}
          {activeMenu === "purchase" && (
            <PurchaseDashboardMain dictionary={dictionary} />
          )}
          {activeMenu === "manpower" && (
            <ManPowerMainDashboard dictionary={dictionary} />
          )}

          {/* <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
            <DataTable data={data} />
          </div> */}
        </div>
      </div>
    </>
  );
}
