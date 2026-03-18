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

export function QCTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quality Control</CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Batch</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow>
              <TableCell>#B-2025-04</TableCell>
              <TableCell>
                <Badge variant="secondary">Pending</Badge>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>#B-2025-03</TableCell>
              <TableCell>
                <Badge className="bg-green-500">Lolos</Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}