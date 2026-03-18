import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SalesTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Penjualan & Pengiriman</CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow>
              <TableCell>RS. Mitra</TableCell>
              <TableCell>
                <Badge className="bg-blue-500">Dikirim</Badge>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Klinik Sehat</TableCell>
              <TableCell>
                <Badge variant="secondary">Approval</Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}