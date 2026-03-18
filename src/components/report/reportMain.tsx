"use client";
import { useState } from "react";
import { getDictionary } from "../../../get-dictionary";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { FaCircleInfo } from "react-icons/fa6";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import ProjectsTableReport from "./projects/projectsTableReport";
import PurchaseTableReport from "./purchase/purchaseTableReport";

interface Props {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["report"];
}

export default function ReportMain({ dictionary }: Props) {
  const [selectedMenu, setSelectedMenu] = useState<string | undefined>(
    "projects"
  );
  return (
    <>
      <div className="flex flex-col w-full h-full gap-2 ">
        <div className="h-12 bg-card rounded-lg p-3 flex items-center justify-between border shadow">
          <div className="flex gap-2 w-1/5">
            <div className="flex items-center">
              <Dialog>
                <DialogTrigger asChild>
                  <FaCircleInfo className="text-iprimary-blue w-5 h-5 cursor-pointer" />
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Langkah Langkah Export</DialogTitle>
                    <DialogDescription>
                      Penjelasan Langkah Langkah untuk Export Data
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4 text-sm">
                    1. Anda dapat menyesuaikan export dengan filter
                    <br /> 2. Pastikan filter data terlebih dahulu jika
                    diperlukan
                    <br />
                    3. Klik tombol export excel untuk melihat hasil export
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div>Pilih Menu</div>
          </div>
          <div className="w-full">
            <Select
              value={selectedMenu}
              onValueChange={setSelectedMenu}
              defaultValue={selectedMenu}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Menu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="purchase">Purchase</SelectItem>
                {/* <SelectItem value="man-power">Manpower</SelectItem> */}
                <SelectItem value="projects">Projects</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="w-full h-full bg-card shadow rounded-lg p-3 border">
          {selectedMenu === "projects" && (
            <div>
              <ProjectsTableReport dictionary={dictionary} />
            </div>
          )}
          {selectedMenu === "man-power" && <div>man-power</div>}
          {selectedMenu === "purchase" && (
            <div>
              <PurchaseTableReport dictionary={dictionary} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
