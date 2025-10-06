import { useState } from "react";
import { ExportDialog } from "../ExportDialog";
import { Button } from "@/components/ui/button";

export default function ExportDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Open Export Dialog</Button>
      <ExportDialog
        open={open}
        onOpenChange={setOpen}
        onExport={(format, type) => {
          console.log("Export triggered:", format, type);
        }}
        selectedCount={5}
      />
    </div>
  );
}
