"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { IPermissions } from "@/types/permission";

interface IPermissionsProps {
  data: Record<string, IPermissions[]>;
}

export default function PermissionCollapsible({ data }: IPermissionsProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => {
    setExpanded((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // 🔥 EXPAND ALL
  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    Object.keys(data).forEach((key) => {
      allExpanded[key] = true;
    });
    setExpanded(allExpanded);
  };

  // 🔥 COLLAPSE ALL
  const collapseAll = () => {
    setExpanded({});
  };

  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      <CardContent className="flex flex-col h-full overflow-hidden">
        <div className="flex gap-2 mb-3">
          <Button className="cursor-pointer" variant="outline" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button className="cursor-pointer" variant="outline" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
        </div>

        {/* 🔹 TABLE */}
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource / Action</TableHead>
                <TableHead>Permission</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {Object.keys(data).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-500">
                    No Data
                  </TableCell>
                </TableRow>
              ) : (
                Object.entries(data).flatMap(([resource, permissions]) => {
                  const isOpen = expanded[resource];

                  return [
                    // 🔹 PARENT
                    <TableRow
                      key={resource}
                      onClick={() => toggle(resource)}
                      className={`cursor-pointer transition-colors ${
                        isOpen
                          ? "bg-gray-100 dark:bg-gray-800"
                          : "hover:bg-gray-50 dark:hover:bg-gray-900"
                      }`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggle(resource);
                            }}
                          >
                            {isOpen ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                          </Button>

                          <span className="font-bold capitalize">
                            {resource.replace("-", " ")}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>,

                    // 🔹 CHILD
                    isOpen
                      ? permissions.map((item) => (
                          <TableRow key={item.id} className="bg-transparent">
                            <TableCell className="pl-10 text-gray-600 dark:text-gray-400">
                              {item.action}
                            </TableCell>

                            <TableCell>{item.permission}</TableCell>

                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      : null,
                  ];
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
