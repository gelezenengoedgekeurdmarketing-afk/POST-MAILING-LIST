import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, ArrowUpDown, Pencil, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Business } from "./EditBusinessDialog";

interface BusinessTableProps {
  data: Business[];
  onEdit: (business: Business) => void;
  onDelete: (id: string) => void;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export function BusinessTable({ data, onEdit, onDelete, selectedIds, onSelectionChange }: BusinessTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [editingComments, setEditingComments] = useState<Map<string, string>>(new Map());
  const { toast } = useToast();

  const updateCommentMutation = useMutation({
    mutationFn: async ({ id, comment }: { id: string; comment: string }) => {
      const res = await apiRequest("PATCH", `/api/businesses/${id}`, { comment });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/businesses'] });
      toast({
        title: "Comment updated",
        description: "The comment has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCommentEdit = (businessId: string, currentComment: string) => {
    setEditingComments(new Map(editingComments.set(businessId, currentComment || '')));
  };

  const handleCommentSave = async (businessId: string) => {
    const newComment = editingComments.get(businessId);
    if (newComment !== undefined) {
      await updateCommentMutation.mutateAsync({ id: businessId, comment: newComment.trim() });
      const newMap = new Map(editingComments);
      newMap.delete(businessId);
      setEditingComments(newMap);
    }
  };

  const handleCommentCancel = (businessId: string) => {
    const newMap = new Map(editingComments);
    newMap.delete(businessId);
    setEditingComments(newMap);
  };

  const handleCommentChange = (businessId: string, value: string) => {
    setEditingComments(new Map(editingComments.set(businessId, value)));
  };

  const columns: ColumnDef<Business>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            if (value) {
              onSelectionChange(data.map(b => b.id));
            } else {
              onSelectionChange([]);
            }
          }}
          data-testid="checkbox-select-all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedIds.includes(row.original.id)}
          onCheckedChange={(value) => {
            if (value) {
              onSelectionChange([...selectedIds, row.original.id]);
            } else {
              onSelectionChange(selectedIds.filter(id => id !== row.original.id));
            }
          }}
          data-testid={`checkbox-select-${row.original.id}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover-elevate"
          data-testid="sort-name"
        >
          Business Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium" data-testid={`text-name-${row.original.id}`}>
          {row.getValue("name")}
        </div>
      ),
    },
    {
      accessorKey: "streetName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover-elevate"
          data-testid="sort-streetName"
        >
          Street Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-muted-foreground text-data">
          {row.getValue("streetName")}
        </div>
      ),
    },
    {
      accessorKey: "zipcode",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover-elevate"
          data-testid="sort-zipcode"
        >
          Zipcode
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-data">{row.getValue("zipcode")}</div>
      ),
    },
    {
      accessorKey: "city",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover-elevate"
          data-testid="sort-city"
        >
          City
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-data">{row.getValue("city")}</div>
      ),
    },
    {
      accessorKey: "tags",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover-elevate"
          data-testid="sort-tags"
        >
          Tags
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const tags = row.getValue("tags") as string[];
        return (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const tagsA = ((rowA.getValue("tags") as string[]) || []).join(", ");
        const tagsB = ((rowB.getValue("tags") as string[]) || []).join(", ");
        return tagsA.localeCompare(tagsB);
      },
    },
    {
      accessorKey: "comment",
      header: "Info",
      cell: ({ row }) => {
        const business = row.original;
        const isEditing = editingComments.has(business.id);
        const isPending = updateCommentMutation.isPending;

        if (isEditing) {
          return (
            <div className="flex items-center gap-2">
              <Input
                value={editingComments.get(business.id) || ''}
                onChange={(e) => handleCommentChange(business.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCommentSave(business.id);
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    handleCommentCancel(business.id);
                  }
                }}
                onBlur={() => {
                  if (!isPending) {
                    handleCommentCancel(business.id);
                  }
                }}
                autoFocus
                disabled={isPending}
                className="h-8 text-sm"
                data-testid={`input-comment-${business.id}`}
              />
              {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
          );
        }

        return (
          <div
            className="text-muted-foreground text-sm cursor-pointer hover-elevate rounded px-2 py-1 min-h-8 flex items-center group"
            onDoubleClick={() => handleCommentEdit(business.id, business.comment || '')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCommentEdit(business.id, business.comment || '');
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Edit comment for ${business.name}`}
            data-testid={`comment-${business.id}`}
          >
            <span className="flex-1">{business.comment || 'Double-click to add info...'}</span>
            <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity ml-2" />
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row.original)}
            data-testid={`button-edit-${row.original.id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(row.original.id)}
            data-testid={`button-delete-${row.original.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={selectedIds.includes(row.original.id) && "selected"}
                className={`hover-elevate ${!row.original.isActive ? 'bg-destructive/10' : ''}`}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <div className="text-muted-foreground">
                  No businesses found. Import an Excel file to get started.
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
