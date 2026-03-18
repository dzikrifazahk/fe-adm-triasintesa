import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InputWithICProps {
  label: string;
  placeholder: string;
  icon: React.ReactNode;
}

export default function InputWithIC({
  label,
  placeholder,
  icon,
}: InputWithICProps) {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5 dark:border-white">
      <Label htmlFor="input-field">{label}</Label>
      <div className="relative">
        <div className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground">
          {icon}
        </div>
        <Input
          id="input-field"
          type="search"
          placeholder={placeholder}
          className="w-full rounded-lg bg-background pl-8"
        />
      </div>
    </div>
  );
}
