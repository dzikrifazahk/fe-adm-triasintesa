import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ProductionForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Input Hasil Produksi</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">

        <div className="grid md:grid-cols-2 gap-4">
          <Input placeholder="Tanggal & Waktu" />
          <Input placeholder="Volume Air Masuk (Liter)" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Input placeholder="Hasil Produksi (Liter)" />
          <Input placeholder="Konversi ke Dirijen" />
        </div>

        <div className="flex gap-3 pt-2">
          <Button>Simpan Batch</Button>
          <Button variant="outline">Scan Dirijen</Button>
        </div>

      </CardContent>
    </Card>
  );
}