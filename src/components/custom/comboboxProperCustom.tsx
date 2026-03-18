"use client";

import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useDebounce from "@/utils/useDebouncy";

export type ComboboxItem<T> = {
  value: string;
  label: string;
  icon: LucideIcon;
};

type ComboboxPopoverProps<T> = {
  data: ComboboxItem<T>[];
  selectedItem: ComboboxItem<T> | null;
  onSelect: (item: ComboboxItem<T> | null) => void;
  size?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  onInputChange?: (query: string) => void;
  height?: string;
  isDisable?: boolean;
};

export function ComboboxPopoverCustom<T>({
  data,
  selectedItem,
  onSelect,
  size = "",
  isOpen = false,
  onOpenChange,
  placeholder = "Search...",
  onInputChange,
  height = "h-full",
  isDisable,
}: ComboboxPopoverProps<T>) {
  const [inputValue, setInputValue] = React.useState<string>("");
  const debouncedInput = useDebounce(inputValue, 300);
  const didMount = React.useRef(false);
  
  React.useEffect(() => {
    if (didMount.current && onInputChange) {
      onInputChange(debouncedInput);
    } else {
      didMount.current = true;
    }
  }, [debouncedInput]);
  const handleSelect = (item: ComboboxItem<T> | null) => {
    onSelect(item);
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  const filtered = React.useMemo(() => {
    if (!inputValue) return data;
    return data.filter((item) =>
      item.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [data, inputValue]);

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        if (!isDisable && onOpenChange) {
          onOpenChange(open);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={isDisable}
          className={cn(
            `${size ? size : "w-full"} ${height} justify-center`,
            isDisable && "cursor-not-allowed opacity-50"
          )}
        >
          {selectedItem ? (
            <>
              <selectedItem.icon className="mr-2 h-4 w-4 shrink-0" />
              {selectedItem.label}
            </>
          ) : (
            <>+ Silahkan Pilih</>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" side="bottom" align="center">
        <Command>
          <CommandInput
            value={inputValue}
            onValueChange={(value) => setInputValue(value)}
            placeholder={placeholder}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {filtered.map((item) => (
                <CommandItem
                  key={String(item.value)}
                  value={String(item.label)}
                  onSelect={() => handleSelect(item)}
                >
                  <item.icon
                    className={cn(
                      "mr-2 h-4 w-4",
                      item.value === selectedItem?.value
                        ? "opacity-100"
                        : "opacity-40"
                    )}
                  />
                  <span>{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
