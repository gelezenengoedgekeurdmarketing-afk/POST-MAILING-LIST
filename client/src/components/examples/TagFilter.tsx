import { useState } from "react";
import { TagFilter } from "../TagFilter";

export default function TagFilterExample() {
  const [selectedTags, setSelectedTags] = useState<string[]>(["Client"]);
  const availableTags = ["Client", "VIP", "Partner", "Supplier", "Technology"];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className="p-4">
      <TagFilter
        availableTags={availableTags}
        selectedTags={selectedTags}
        onToggleTag={toggleTag}
        onClearAll={() => setSelectedTags([])}
      />
      <p className="mt-4 text-sm text-muted-foreground">
        Selected: {selectedTags.join(", ") || "None"}
      </p>
    </div>
  );
}
