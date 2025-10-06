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

interface TagFilterProps {
  availableTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearAll: () => void;
}

export function TagFilter({ availableTags, selectedTags, onToggleTag, onClearAll }: TagFilterProps) {
  const [open, setOpen] = useState(false);

  if (availableTags.length === 0) return null;

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
              data-testid="button-tag-filter"
            >
              Filter by Tags
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search tags..." data-testid="input-search-tags" />
              <CommandList>
                <CommandEmpty>No tags found.</CommandEmpty>
                <CommandGroup>
                  {availableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <CommandItem
                        key={tag}
                        value={tag}
                        onSelect={() => {
                          onToggleTag(tag);
                        }}
                        data-testid={`command-item-${tag}`}
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
                        <span>{tag}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {selectedTags.length > 0 && (
          <>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="gap-1"
                  data-testid={`badge-selected-${tag}`}
                >
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer hover-elevate"
                    onClick={() => onToggleTag(tag)}
                    data-testid={`button-remove-selected-${tag}`}
                  />
                </Badge>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="h-auto py-1 px-2 text-xs hover-elevate"
              data-testid="button-clear-tags"
            >
              Clear all
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
