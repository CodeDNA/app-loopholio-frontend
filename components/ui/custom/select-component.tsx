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
      <SelectContent className="text-teal-500 bg-teal-800">
        {items.map((item) => {
          return (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
