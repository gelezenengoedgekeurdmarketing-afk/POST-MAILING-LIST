import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (format: string, type: string, customName: string) => void;
  selectedCount: number;
}

export function ExportDialog({ open, onOpenChange, onExport, selectedCount }: ExportDialogProps) {
  const [format, setFormat] = useState("xlsx");
  const [exportType, setExportType] = useState(selectedCount > 0 ? "selected" : "all");
  const [customName, setCustomName] = useState("");

  useEffect(() => {
    if (open) {
      setExportType(selectedCount > 0 ? "selected" : "all");
      setCustomName("");
    }
  }, [open, selectedCount]);

  const handleExport = () => {
    onExport(format, exportType, customName);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" data-testid="dialog-export">
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
          <DialogDescription>
            Choose your export format and which records to export.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label htmlFor="custom-name">List Name</Label>
            <Input
              id="custom-name"
              placeholder="Enter custom name (optional)"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              data-testid="input-custom-name"
            />
            <p className="text-xs text-muted-foreground">
              Filename will be: Post Mailing List - {customName || "export"}.{format === "word" ? "docx" : format}
            </p>
          </div>

          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={setFormat}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="xlsx" id="xlsx" data-testid="radio-xlsx" />
                <Label htmlFor="xlsx" className="font-normal cursor-pointer">
                  Excel (.xlsx)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" data-testid="radio-csv" />
                <Label htmlFor="csv" className="font-normal cursor-pointer">
                  CSV (.csv)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="word" id="word" data-testid="radio-word" />
                <Label htmlFor="word" className="font-normal cursor-pointer">
                  Word (.docx)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Records to Export</Label>
            <RadioGroup value={exportType} onValueChange={setExportType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" data-testid="radio-all" />
                <Label htmlFor="all" className="font-normal cursor-pointer">
                  All records
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="selected"
                  id="selected"
                  disabled={selectedCount === 0}
                  data-testid="radio-selected"
                />
                <Label htmlFor="selected" className="font-normal cursor-pointer">
                  Selected records ({selectedCount})
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-export"
          >
            Cancel
          </Button>
          <Button onClick={handleExport} data-testid="button-confirm-export">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
