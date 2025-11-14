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

interface CityFilterProps {
  availableCities: string[];
  selectedCities: string[];
  onToggleCity: (city: string) => void;
}

export function CityFilter({ availableCities, selectedCities, onToggleCity }: CityFilterProps) {
  const [open, setOpen] = useState(false);

  if (availableCities.length === 0) return null;

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
              data-testid="button-city-filter"
            >
              Filter by City
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search cities..." data-testid="input-search-cities" />
              <CommandList>
                <CommandEmpty>No cities found.</CommandEmpty>
                <CommandGroup>
                  {availableCities.map((city) => {
                    const isSelected = selectedCities.includes(city);
                    return (
                      <CommandItem
                        key={city}
                        value={city}
                        onSelect={() => {
                          onToggleCity(city);
                        }}
                        data-testid={`command-item-city-${city}`}
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
                        <span>{city}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {selectedCities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedCities.map((city) => (
              <Badge
                key={city}
                variant="secondary"
                className="gap-1"
                data-testid={`badge-selected-city-${city}`}
              >
                {city}
                <X
                  className="h-3 w-3 cursor-pointer hover-elevate"
                  onClick={() => onToggleCity(city)}
                  data-testid={`button-remove-selected-city-${city}`}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
