import { useState } from "react";
import { ImportDialog } from "../ImportDialog";
import { Button } from "@/components/ui/button";

export default function ImportDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Open Import Dialog</Button>
      <ImportDialog
        open={open}
        onOpenChange={setOpen}
        onImport={(file, tags) => {
          console.log("Import triggered:", file.name, tags);
        }}
      />
    </div>
  );
}
