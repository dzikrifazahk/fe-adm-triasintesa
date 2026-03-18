import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function TankStatus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Tangki Air</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-center text-3xl font-bold">45%</div>

        <Progress value={45} />

        <div className="text-sm text-muted-foreground text-center">
          3,600 / 8,000 Liter
        </div>

        <div className="text-green-600 text-sm text-center font-medium">
          Aman
        </div>
      </CardContent>
    </Card>
  );
}