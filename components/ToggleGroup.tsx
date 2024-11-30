import React from "react";
import { Item, Root } from "@radix-ui/react-toggle-group";
import clsx from "clsx";

interface ToggleGroupProps {
  value?: string;
  onValueChange: (value: string) => void | Promise<void>;
  options: {
    value: string;
    label: string;
  }[];
}

export const ToggleGroup = ({
  value,
  onValueChange,
  options,
}: ToggleGroupProps) => {
  return (
    <Root
      className="flex"
      type="single"
      value={value}
      onValueChange={(value) => void onValueChange(value)}
    >
      {options.map((option, index) => (
        <Item
          key={option.value}
          className={clsx(
            "grow px-4 py-2 font-medium transition-colors cursor-pointer",
            value === option.value
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200",
            { "rounded-l-md": index === 0 },
            { "rounded-r-md": index === options.length - 1 },
          )}
          value={String(option.value)}
        >
          {option.label}
        </Item>
      ))}
    </Root>
  );
};
