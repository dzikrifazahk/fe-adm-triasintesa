import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Report() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3">
      <Card>
        <CardHeader>
          <CardTitle>Total Proyek</CardTitle>
          <CardDescription>Jumlah proyek yang sedang berjalan</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">8</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Jam Minggu Ini</CardTitle>
          <CardDescription>Akumulasi jam kerja mingguan</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">38.5</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Hari Ini</CardTitle>
          <CardDescription>User aktif check-in hari ini</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">14</p>
        </CardContent>
      </Card>
    </div>
  );
}
