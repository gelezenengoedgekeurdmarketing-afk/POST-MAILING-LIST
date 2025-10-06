import { useState } from "react";
import { BusinessTable } from "../BusinessTable";
import type { Business } from "../EditBusinessDialog";

export default function BusinessTableExample() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const mockData: Business[] = [
    {
      id: "1",
      name: "Acme Corporation",
      streetName: "123 Business St",
      zipcode: "10001",
      city: "New York",
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
      streetName: "456 Innovation Ave",
      zipcode: "94105",
      city: "San Francisco",
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
      streetName: "789 Trade Blvd",
      zipcode: "90001",
      city: "Los Angeles",
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
