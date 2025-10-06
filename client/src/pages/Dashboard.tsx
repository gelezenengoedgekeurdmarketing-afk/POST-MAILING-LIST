import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SearchBar } from "@/components/SearchBar";
import { TagFilter } from "@/components/TagFilter";
import { BusinessTable } from "@/components/BusinessTable";
import { ImportDialog } from "@/components/ImportDialog";
import { ExportDialog } from "@/components/ExportDialog";
import { EditBusinessDialog, type Business } from "@/components/EditBusinessDialog";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();
  const [businesses, setBusinesses] = useState<Business[]>([
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
      comment: "Long-term partner, excellent payment history",
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
      comment: "Account on hold pending review",
      isActive: false,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [editBusiness, setEditBusiness] = useState<Business | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    businesses.forEach(business => {
      business.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [businesses]);

  const filteredBusinesses = useMemo(() => {
    return businesses.filter(business => {
      const matchesSearch = searchQuery === "" || 
        Object.values(business).some(value => 
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => business.tags.includes(tag));
      
      return matchesSearch && matchesTags;
    });
  }, [businesses, searchQuery, selectedTags]);

  const handleImport = (file: File, tags: string[]) => {
    console.log("Import file:", file.name, "with tags:", tags);
    toast({
      title: "Import started",
      description: `Importing data from ${file.name}...`,
    });
  };

  const handleExport = (format: string, type: string) => {
    console.log("Export format:", format, "type:", type);
    toast({
      title: "Export started",
      description: `Exporting data as ${format.toUpperCase()}...`,
    });
  };

  const handleSaveBusiness = (business: Business) => {
    if (business.id) {
      setBusinesses(businesses.map(b => b.id === business.id ? business : b));
      toast({
        title: "Business updated",
        description: "The business information has been updated.",
      });
    } else {
      const newBusiness = { ...business, id: String(Date.now()) };
      setBusinesses([...businesses, newBusiness]);
      toast({
        title: "Business added",
        description: "A new business has been added to the database.",
      });
    }
  };

  const handleDeleteBusiness = (id: string) => {
    setBusinesses(businesses.filter(b => b.id !== id));
    setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    toast({
      title: "Business deleted",
      description: "The business has been removed from the database.",
    });
  };

  const handleAddNew = () => {
    setEditBusiness(null);
    setEditOpen(true);
  };

  const handleEdit = (business: Business) => {
    setEditBusiness(business);
    setEditOpen(true);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <h1 className="text-2xl font-semibold">Business Database</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setImportOpen(true)}
                data-testid="button-import"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button
                variant="outline"
                onClick={() => setExportOpen(true)}
                data-testid="button-export"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={handleAddNew} data-testid="button-add-new">
                <Plus className="h-4 w-4 mr-2" />
                Add Business
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col gap-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
          />
          
          <TagFilter
            availableTags={allTags}
            selectedTags={selectedTags}
            onToggleTag={toggleTag}
            onClearAll={() => setSelectedTags([])}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredBusinesses.length} of {businesses.length} businesses
              {selectedIds.length > 0 && ` (${selectedIds.length} selected)`}
            </p>
          </div>

          <BusinessTable
            data={filteredBusinesses}
            onEdit={handleEdit}
            onDelete={handleDeleteBusiness}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </div>
      </main>

      <ImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={handleImport}
      />

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        onExport={handleExport}
        selectedCount={selectedIds.length}
      />

      <EditBusinessDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        business={editBusiness}
        onSave={handleSaveBusiness}
      />
    </div>
  );
}
