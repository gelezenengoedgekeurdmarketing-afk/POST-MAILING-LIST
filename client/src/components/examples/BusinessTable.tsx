import { useState } from "react";
import { BusinessTable } from "../BusinessTable";
import type { Business } from "../EditBusinessDialog";

export default function BusinessTableExample() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const mockData: Business[] = [
    {
      id: "1",
      name: "Acme Corporation",
      address: "123 Business St",
      city: "New York",
      postalCode: "10001",
      country: "United States",
      email: "contact@acme.com",
      phone: "+1 234 567 8900",
      tags: ["Client", "VIP"],
      comment: "Long-term partner",
      isActive: true,
    },
    {
      id: "2",
      name: "Tech Solutions Ltd",
      address: "456 Innovation Ave",
      city: "San Francisco",
      postalCode: "94105",
      country: "United States",
      email: "info@techsolutions.com",
      phone: "+1 415 555 0123",
      tags: ["Partner", "Technology"],
      comment: "",
      isActive: true,
    },
    {
      id: "3",
      name: "Global Imports Co",
      address: "789 Trade Blvd",
      city: "Los Angeles",
      postalCode: "90001",
      country: "United States",
      email: "hello@globalimports.com",
      phone: "+1 310 555 0456",
      tags: ["Supplier"],
      comment: "Account on hold",
      isActive: false,
    },
  ];

  return (
    <div className="p-4">
      <BusinessTable
        data={mockData}
        onEdit={(business) => console.log("Edit:", business)}
        onDelete={(id) => console.log("Delete:", id)}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />
    </div>
  );
}
