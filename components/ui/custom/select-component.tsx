import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
interface Items {
  value: string;
  label: string;
}
interface SelectComponentProps {
  selectedValue: any;
  items: Items[];
  onValueChange: any;
}

export function SelectComponent({
  selectedValue,
  items,
  onValueChange,
}: SelectComponentProps) {
  return (
    <Select
      value={selectedValue}
      onValueChange={(value) => {
        if (value) onValueChange(value);
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="Text" />
      </SelectTrigger>
      <SelectContent
        alignItemWithTrigger={false}
        className="text-teal-500 z-auto"
        side="top"
        sideOffset={10}
      >
        {items.map((item) => {
          return (
            <SelectItem
              className="data-highlighted:bg-teal-800  data-highlighted:text-white data-highlighted:font-bold"
              key={item.value}
              value={item.value}
            >
              {item.label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
