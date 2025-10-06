import { useState } from "react";
import { EditBusinessDialog, type Business } from "../EditBusinessDialog";
import { Button } from "@/components/ui/button";

export default function EditBusinessDialogExample() {
  const [open, setOpen] = useState(false);
  const [business] = useState<Business>({
    id: "1",
    name: "Acme Corporation",
    address: "123 Business St",
    city: "New York",
    postalCode: "10001",
    country: "United States",
    email: "contact@acme.com",
    phone: "+1 234 567 8900",
    tags: ["Client", "VIP"],
  });

  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Edit Business</Button>
      <EditBusinessDialog
        open={open}
        onOpenChange={setOpen}
        business={business}
        onSave={(updated) => {
          console.log("Business saved:", updated);
        }}
      />
    </div>
  );
}
