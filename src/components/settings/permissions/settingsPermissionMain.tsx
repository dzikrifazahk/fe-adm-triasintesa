"use client";

import { getDictionary } from "../../../../get-dictionary";
import { useEffect, useState } from "react";
import PermissionTable from "./data-table";
import { Separator } from "@/components/ui/separator";
import { useLoading } from "@/context/loadingContext";
import { permissionService } from "@/services";
import { IPermissions } from "@/types/permission";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsPermissionMain({
  dictionary,
}: {
  dictionary: Awaited<
    ReturnType<typeof getDictionary>
  >["settings_permission"];
}) {
  const { setIsLoading } = useLoading();

  const [permissionsData, setPermissionsData] = useState<
    Record<string, IPermissions[]>
  >({});

  const getPermissions = async () => {
    try {
      const { data } = await permissionService.getPermissions({});
      setPermissionsData(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  
  useEffect(() => {
    getPermissions();
    setIsLoading(false);
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      <Card className="flex-1 flex flex-col h-full">
        <CardContent className="flex flex-col h-full ">
          {/* HEADER */}
          <div className="flex flex-col">
            <div className="font-sans-bold text-lg">
              {dictionary.title}
            </div>
            <div className="font-sans text-sm text-gray-500 dark:text-gray-200">
              {dictionary.description}
            </div>
          </div>

          <Separator className="my-3" />

          {/* TABLE AREA */}
          <div className="flex-1 overflow-y-auto">
            <PermissionTable data={permissionsData} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}