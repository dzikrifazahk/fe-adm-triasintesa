"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { projectService } from "@/services";
import { useEffect, useState } from "react";
import { IProject } from "@/types/project";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface WorkspaceDetailProjectProps {
  id: string;
}

export function WorkspaceDetailProject({ id }: WorkspaceDetailProjectProps) {
  const [data, setData] = useState<IProject>();

  useEffect(() => {
    const getProjectDetail = async () => {
      try {
        const response = await projectService.getProject(id);
        setData(response);
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };

    if (id) {
      getProjectDetail();
    }
  }, [id]);

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant={"outline"}
          className="text-xs h-5 bg-secondary hover:bg-primary text-white hover:text-white"
        >
          Lihat Detail Data
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full ">
          <DrawerHeader>
            <DrawerTitle className="text-secondary text-2xl">
              {data?.name ?? ""}
            </DrawerTitle>
            <DrawerDescription>
              {data?.id ?? ""} - {data?.client.name ?? ""}
            </DrawerDescription>
          </DrawerHeader>

          {/* Flex Wrapper for Information */}
          <div className="p-3 flex flex-col sm:flex-row">
            {/* Proyek Info Section */}
            <div className="w-full h-full flex flex-col sm:w-1/2 ml-2 mr-2">
              <div className="text-base font-semibold w-full bg-gray-100 rounded-md p-2">
                Informasi Proyek
              </div>
              <div className="gap-3 text-sm p-2 grid grid-cols-1 sm:grid-cols-2">
                {/* Each Info Row */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <DrawerDescription className="w-full sm:w-32">
                    Tanggal
                  </DrawerDescription>
                  <span>{data?.date ?? ""}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <DrawerDescription className="w-full sm:w-32">
                    Harga Borongan
                  </DrawerDescription>
                  <span>{data?.harga_type_project ?? ""}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <DrawerDescription className="w-full sm:w-32">
                    Billing
                  </DrawerDescription>
                  <span>{data?.billing ?? ""}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <DrawerDescription className="w-full sm:w-32">
                    Estimasi Biaya
                  </DrawerDescription>
                  <span>{data?.cost_estimate ?? ""}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <DrawerDescription className="w-full sm:w-32">
                    Keuntungan
                  </DrawerDescription>
                  <span>{data?.margin ?? ""}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <DrawerDescription className="w-full sm:w-32">
                    % Persentase
                  </DrawerDescription>
                  <span>{data?.percent ?? ""}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <DrawerDescription className="w-full sm:w-32">
                    Lampiran
                  </DrawerDescription>
                  <a
                    href={data?.file_attachment?.link ?? ""}
                    className="underline text-blue-300"
                  >
                    Klik Disini
                  </a>
                </div>
              </div>
            </div>

            {/* Orang Yang Terlibat Section */}
            <div className="w-full h-full flex flex-col sm:w-1/2 ml-2 mr-2">
              <div className="text-base font-semibold w-full bg-gray-100 rounded-md p-2">
                Informasi Orang Yang Terlibat
              </div>
              <div className="flex w-full gap-5 ml-3 mr-3">
                <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-4 p-2">
                  {data?.tukang.map((item, index) => {
                    const fullName = item.name || "";

                    const getInitials = (name: string) => {
                      const nameParts = name.split(" ");
                      const initials = nameParts
                        .map((part) => part.charAt(0).toUpperCase())
                        .join("");
                      return initials.length >= 2
                        ? initials.substring(0, 2)
                        : initials;
                    };

                    const initials = getInitials(fullName);

                    return (
                      <div key={index} className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback className="bg-primary-light-two border border-secondary">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm">{fullName}</span>
                          <span className="text-sm">
                            {item?.divisi?.name ?? "-"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" className="text-secondary">
                Kembali
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
