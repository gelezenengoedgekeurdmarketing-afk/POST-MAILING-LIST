import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ZipcodeFilterProps {
  availableZipcodes: string[];
  selectedZipcodes: string[];
  onToggleZipcode: (zipcode: string) => void;
}

export function ZipcodeFilter({ availableZipcodes, selectedZipcodes, onToggleZipcode }: ZipcodeFilterProps) {
  const [open, setOpen] = useState(false);

  if (availableZipcodes.length === 0) return null;

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
              data-testid="button-zipcode-filter"
            >
              Filter by Zipcode
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search zipcodes..." data-testid="input-search-zipcodes" />
              <CommandList>
                <CommandEmpty>No zipcodes found.</CommandEmpty>
                <CommandGroup>
                  {availableZipcodes.map((zipcode) => {
                    const isSelected = selectedZipcodes.includes(zipcode);
                    return (
                      <CommandItem
                        key={zipcode}
                        value={zipcode}
                        onSelect={() => {
                          onToggleZipcode(zipcode);
                        }}
                        data-testid={`command-item-zipcode-${zipcode}`}
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
                        <span>{zipcode}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {selectedZipcodes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedZipcodes.map((zipcode) => (
              <Badge
                key={zipcode}
                variant="secondary"
                className="gap-1"
                data-testid={`badge-selected-zipcode-${zipcode}`}
              >
                {zipcode}
                <X
                  className="h-3 w-3 cursor-pointer hover-elevate"
                  onClick={() => onToggleZipcode(zipcode)}
                  data-testid={`button-remove-selected-zipcode-${zipcode}`}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
