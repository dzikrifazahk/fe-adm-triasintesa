"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

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
import { IComboboxWithoutIC } from "@/types/common";

type ComboboxPopoverProps<T> = {
  data: IComboboxWithoutIC<T>[];
  selectedItem: IComboboxWithoutIC<T> | null;
  onSelect: (item: IComboboxWithoutIC<T> | null) => void;
  size?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  height?: string;
};

export function ComboboxWithoutIC<T>({
  data,
  selectedItem,
  onSelect,
  size = "", // on pixel example: w-[200px]
  isOpen = false,
  onOpenChange,
  placeholder = "Search...",
  height = "h-full",
}: ComboboxPopoverProps<T>) {
  const handleSelect = (item: IComboboxWithoutIC<T> | null) => {
    onSelect(item);
    if (onOpenChange) {
      onOpenChange(false);
    }
    isOpen = false;
  };
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          //   className="w-[200px] justify-between"
          className={`${size ? size : "w-full"} ${height} flex justify-between ${
            selectedItem ? "" : "text-gray-500"
          }`}
        >
          {selectedItem ? selectedItem.label : placeholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={`p-0`} side="bottom" align="start">
        <Command>
          <CommandInput
            placeholder={placeholder}
            className="placeholder-gray-500"
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {data.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.label}
                  onSelect={() => handleSelect(item)}
                >
                  {item.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      item.value === selectedItem?.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
