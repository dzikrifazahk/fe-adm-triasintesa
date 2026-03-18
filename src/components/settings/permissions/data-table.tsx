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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaPenToSquare, FaTrash } from "react-icons/fa6";
import { IPermissions } from "@/types/permission";
import { useState } from "react";

interface IPermissionsProps {
  data: IPermissions[];
  onDelete?: (id: number) => void;
  onEdit?: (id: number, type: string) => void;
}

export default function PermissionCollapsible({
  data,
  onDelete,
  onEdit,
}: IPermissionsProps) {
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>(
    {}
  );

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderRows = (
    permissions: IPermissions[],
    level = 0
  ): React.ReactNode[] => {
    return permissions.flatMap((item) => {
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expandedRows[item.id] ?? false;

      return [
        <TableRow key={item.id} className="group">
          <TableCell>
            <div
              className="flex items-center gap-2"
              style={{ paddingLeft: `${level * 16}px` }}
            >
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-0"
                  onClick={() => toggleRow(item.id)}
                >
                  {isExpanded ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </Button>
              )}
              <span className="font-medium">{item.name}</span>
            </div>
          </TableCell>
          <TableCell>{item.parent_id ?? "-"}</TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => onEdit?.(parseInt(item.id), "item")}
                >
                  <FaPenToSquare className="text-yellow-500 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete?.(parseInt(item.id))}
                >
                  <FaTrash className="text-red-500 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>,
        hasChildren && isExpanded
          ? renderRows(item.children, level + 1)
          : null,
      ];
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <Card className="xl:col-span-2 pt-5 mt-5">
        <CardContent>
          {/* <Label className="font-bold">Permissions</Label> */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Permission Name</TableHead>
                <TableHead>Parent ID</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-500">
                    No Data
                  </TableCell>
                </TableRow>
              ) : (
                renderRows(data)
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
