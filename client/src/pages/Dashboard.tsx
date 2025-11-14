import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HeaderUserMenu } from "@/components/HeaderUserMenu";
import { SearchBar } from "@/components/SearchBar";
import { TagFilter } from "@/components/TagFilter";
import { CityFilter } from "@/components/CityFilter";
import { ZipcodeFilter } from "@/components/ZipcodeFilter";
import { ActiveFilter } from "@/components/ActiveFilter";
import { BusinessTable } from "@/components/BusinessTable";
import { ImportDialog } from "@/components/ImportDialog";
import { ExportDialog } from "@/components/ExportDialog";
import { EditBusinessDialog, type Business } from "@/components/EditBusinessDialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
  const { toast } = useToast();
  
  const { data: businesses = [], isLoading } = useQuery<Business[]>({
    queryKey: ["/api/businesses"],
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedZipcodes, setSelectedZipcodes] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<"active" | "inactive" | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [editBusiness, setEditBusiness] = useState<Business | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const createBusinessMutation = useMutation({
    mutationFn: async (business: Omit<Business, "id">) => {
      const res = await apiRequest("POST", "/api/businesses", business);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
      toast({
        title: "Success",
        description: "Business added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add business",
        variant: "destructive",
      });
    },
  });

  const updateBusinessMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<Business, "id">> }) => {
      const res = await apiRequest("PATCH", `/api/businesses/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
      toast({
        title: "Success",
        description: "Business updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update business",
        variant: "destructive",
      });
    },
  });

  const deleteBusinessMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/businesses/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
      setSelectedIds([]);
      toast({
        title: "Success",
        description: "Business deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete business",
        variant: "destructive",
      });
    },
  });

  const bulkCreateMutation = useMutation({
    mutationFn: async (businessList: Omit<Business, "id">[]) => {
      const res = await apiRequest("POST", "/api/businesses/bulk", { businesses: businessList });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
      toast({
        title: "Import successful",
        description: "Businesses imported successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Import failed",
        description: error.message || "Failed to import businesses",
        variant: "destructive",
      });
    },
  });

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    businesses.forEach(business => {
      business.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [businesses]);

  const allCities = useMemo(() => {
    const citySet = new Set<string>();
    businesses.forEach(business => {
      if (business.city) {
        citySet.add(business.city);
      }
    });
    return Array.from(citySet).sort();
  }, [businesses]);

  const allZipcodes = useMemo(() => {
    const zipcodeSet = new Set<string>();
    businesses.forEach(business => {
      if (business.zipcode) {
        zipcodeSet.add(business.zipcode);
      }
    });
    return Array.from(zipcodeSet).sort();
  }, [businesses]);

  const filteredBusinesses = useMemo(() => {
    return businesses.filter(business => {
      const matchesSearch = searchQuery === "" || 
        Object.values(business).some(value => 
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => business.tags.includes(tag));
      
      const matchesCities = selectedCities.length === 0 || 
        selectedCities.includes(business.city);
      
      const matchesZipcodes = selectedZipcodes.length === 0 || 
        selectedZipcodes.includes(business.zipcode);
      
      const matchesStatus = !selectedStatus || 
        (business.isActive === (selectedStatus === "active"));
      
      return matchesSearch && matchesTags && matchesCities && matchesZipcodes && matchesStatus;
    });
  }, [businesses, searchQuery, selectedTags, selectedCities, selectedZipcodes, selectedStatus]);

  const handleImport = async (file: File, tags: string[]) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tags", JSON.stringify(tags));

    try {
      const response = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      if (!response.ok && response.status !== 207) {
        const error = await response.json();
        throw new Error(error.error || "Import failed");
      }

      const result = await response.json();
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
      
      if (result.failed > 0) {
        toast({
          title: "Partial import",
          description: `Imported ${result.imported} businesses. ${result.failed} rows failed. Check console for details.`,
          variant: "destructive",
        });
        console.error("Import errors:", result.errors);
      } else {
        toast({
          title: "Import successful",
          description: `Imported ${result.imported} businesses`,
        });
      }
      setImportOpen(false);
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message || "Failed to import businesses",
        variant: "destructive",
      });
    }
  };

  const handleExport = async (format: string, type: string, customName: string) => {
    const ids = type === "selected" ? selectedIds : undefined;
    
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ format, ids, customName }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "export.xlsx";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: `Exported businesses as ${format}`,
      });
      setExportOpen(false);
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message || "Failed to export businesses",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBusiness = (id: string) => {
    deleteBusinessMutation.mutate(id);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    
    Promise.all(selectedIds.map(id => 
      apiRequest("DELETE", `/api/businesses/${id}`)
    )).then(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
      setSelectedIds([]);
      toast({
        title: "Success",
        description: `${selectedIds.length} businesses deleted successfully`,
      });
    }).catch((error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete businesses",
        variant: "destructive",
      });
    });
  };

  const handleAddNew = () => {
    setEditBusiness(null);
    setEditOpen(true);
  };

  const handleSaveBusiness = (business: Business) => {
    if (business.id) {
      const { id, ...data } = business;
      updateBusinessMutation.mutate({ id, data }, {
        onSuccess: () => {
          setEditOpen(false);
        },
      });
    } else {
      const { id, ...data } = business;
      createBusinessMutation.mutate(data, {
        onSuccess: () => {
          setEditOpen(false);
        },
      });
    }
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

  const toggleCity = (city: string) => {
    if (selectedCities.includes(city)) {
      setSelectedCities(selectedCities.filter(c => c !== city));
    } else {
      setSelectedCities([...selectedCities, city]);
    }
  };

  const toggleZipcode = (zipcode: string) => {
    if (selectedZipcodes.includes(zipcode)) {
      setSelectedZipcodes(selectedZipcodes.filter(z => z !== zipcode));
    } else {
      setSelectedZipcodes([...selectedZipcodes, zipcode]);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <h1 className="text-2xl font-semibold">POST MAILINGLIST MAKER</h1>
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
              <HeaderUserMenu />
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
          
          <div className="flex gap-4 flex-wrap items-center">
            <TagFilter
              availableTags={allTags}
              selectedTags={selectedTags}
              onToggleTag={toggleTag}
            />
            
            <CityFilter
              availableCities={allCities}
              selectedCities={selectedCities}
              onToggleCity={toggleCity}
            />
            
            <ZipcodeFilter
              availableZipcodes={allZipcodes}
              selectedZipcodes={selectedZipcodes}
              onToggleZipcode={toggleZipcode}
            />
            
            <ActiveFilter
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
            />
            
            {(selectedTags.length > 0 || selectedCities.length > 0 || selectedZipcodes.length > 0 || selectedStatus !== null) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedTags([]);
                  setSelectedCities([]);
                  setSelectedZipcodes([]);
                  setSelectedStatus(null);
                }}
                className="hover-elevate"
                data-testid="button-clear-all-filters"
              >
                Clear All Filters
              </Button>
            )}
          </div>
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
