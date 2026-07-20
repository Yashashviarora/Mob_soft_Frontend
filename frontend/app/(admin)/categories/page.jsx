"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  ApiRequestError,
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CategoriesPage() {
  const { token, isSuperAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState(null);
  const [listError, setListError] = useState(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(token),
    enabled: Boolean(token),
  });

  function openCreate() {
    setEditing(null);
    setName("");
    setDescription("");
    setFormError(null);
    setDialogOpen(true);
  }

  function openEdit(category) {
    setEditing(category);
    setName(category.name);
    setDescription(category.description ?? "");
    setFormError(null);
    setDialogOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { name, description: description || null };
      if (editing) {
        return updateCategory(editing.id, payload, token);
      }
      return createCategory(payload, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDialogOpen(false);
    },
    onError: (err) => {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteCategory(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setListError(null);
    },
    onError: (err) => {
      setListError(
        err instanceof ApiRequestError
          ? err.message
          : "Could not delete category"
      );
    },
  });

  function handleDelete(category) {
    if (
      !window.confirm(
        `Delete category "${category.name}"? This cannot be undone.`
      )
    ) {
      return;
    }
    deleteMutation.mutate(category.id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Organize products into categories.
          </p>
        </div>
        {isSuperAdmin ? (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button disabled>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>View only</TooltipContent>
          </Tooltip>
        )}
      </div>

      {listError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {listError}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : !categories || categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No categories yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-32 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {category.description || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {isSuperAdmin ? (
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(category)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(category)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs text-muted-foreground">
                              View only
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            Only super admins can edit categories
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setFormError(null);
              saveMutation.mutate();
            }}
          >
            {formError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Name *</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-description">Description</Label>
              <Textarea
                id="cat-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
