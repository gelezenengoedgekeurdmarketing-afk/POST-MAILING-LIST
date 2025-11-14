import { useState } from "react";
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

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (format: string, type: string) => void;
  selectedCount: number;
}

export function ExportDialog({ open, onOpenChange, onExport, selectedCount }: ExportDialogProps) {
  const [format, setFormat] = useState("xlsx");
  const [exportType, setExportType] = useState("all");

  const handleExport = () => {
    onExport(format, exportType);
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
                  Word (.docx) - Formatted addresses
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mailing" id="mailing" data-testid="radio-mailing" />
                <Label htmlFor="mailing" className="font-normal cursor-pointer">
                  Mailing List (CSV with address formatting)
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
