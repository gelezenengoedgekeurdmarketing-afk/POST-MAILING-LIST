import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ActiveStatus = "active" | "inactive" | null;

interface ActiveFilterProps {
  selectedStatus: ActiveStatus;
  onStatusChange: (status: ActiveStatus) => void;
}

export function ActiveFilter({ selectedStatus, onStatusChange }: ActiveFilterProps) {
  const [open, setOpen] = useState(false);

  const options = [
    { value: "active" as const, label: "Active" },
    { value: "inactive" as const, label: "Inactive" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[200px] justify-between"
              data-testid="button-active-filter"
            >
              Filter by Status
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandList>
                <CommandGroup>
                  {options.map((option) => {
                    const isSelected = selectedStatus === option.value;
                    return (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => {
                          onStatusChange(isSelected ? null : option.value);
                          setOpen(false);
                        }}
                        data-testid={`command-item-status-${option.value}`}
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "opacity-50 [&_svg]:invisible"
                          )}
                        >
                          <Check className="h-4 w-4" />
                        </div>
                        <span>{option.label}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {selectedStatus && (
          <>
            <Badge
              variant="secondary"
              className="gap-1"
              data-testid={`badge-selected-status-${selectedStatus}`}
            >
              {selectedStatus === "active" ? "Active" : "Inactive"}
              <X
                className="h-3 w-3 cursor-pointer hover-elevate"
                onClick={() => onStatusChange(null)}
                data-testid="button-remove-status-filter"
              />
            </Badge>
          </>
        )}
      </div>
    </div>
  );
}
