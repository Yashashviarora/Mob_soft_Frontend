"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFieldConfigForCategory } from "@/lib/category-fields";

let rowIdCounter = 0;
function newRowId() {
  rowIdCounter += 1;
  return `row-${rowIdCounter}`;
}

function rowsFromSpecs(specs) {
  return Object.entries(specs || {}).map(([k, v]) => ({
    id: newRowId(),
    key: k,
    value: String(v),
  }));
}

/**
 * Renders either:
 *  - a set of typed inputs, one per FieldDef, when the selected category has
 *    a predefined config in lib/category-fields.ts, or
 *  - a generic, repeatable key/value row editor when it doesn't (e.g. a
 *    brand-new category nobody has configured yet).
 * Both paths write into the same flat `specifications` object.
 */
export function SpecFields({ categoryName, value, onChange }) {
  const fieldConfig = categoryName ? getFieldConfigForCategory(categoryName) : null;

  const [rows, setRows] = useState(() => rowsFromSpecs(value));

  // Reset the generic editor's rows whenever the category changes (a fresh
  // category has a fresh, unrelated set of specifications).
  useEffect(() => {
    if (!fieldConfig) {
      setRows(rowsFromSpecs(value));
    }
    // Only re-seed on category switches, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryName, fieldConfig]);

  if (fieldConfig) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fieldConfig.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <Label>
              {field.label}
              {field.required && <span className="text-destructive"> *</span>}
              {field.unit ? (
                <span className="text-muted-foreground font-normal"> ({field.unit})</span>
              ) : null}
            </Label>
            <FieldInput field={field} value={value} onChange={onChange} />
          </div>
        ))}
      </div>
    );
  }

  function commitRows(next) {
    setRows(next);
    const specs = {};
    for (const row of next) {
      if (row.key.trim()) specs[row.key.trim()] = row.value;
    }
    onChange(specs);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Specifications</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => commitRows([...rows, { id: newRowId(), key: "", value: "" }])}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Specification
        </Button>
      </div>
      {rows.length === 0 && (
        <p className="text-sm text-muted-foreground">
          This category has no predefined fields yet. Add free-form
          specification rows below, or add a proper field config in
          lib/category-fields.ts for a better editing experience.
        </p>
      )}
      <div className="space-y-2">
        {rows.map((row, idx) => (
          <div key={row.id} className="flex gap-2 items-center">
            <Input
              placeholder="Label (e.g. Material)"
              value={row.key}
              onChange={(e) => {
                const next = [...rows];
                next[idx] = { ...row, key: e.target.value };
                commitRows(next);
              }}
            />
            <Input
              placeholder="Value"
              value={row.value}
              onChange={(e) => {
                const next = [...rows];
                next[idx] = { ...row, value: e.target.value };
                commitRows(next);
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => commitRows(rows.filter((r) => r.id !== row.id))}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function FieldInput({ field, value, onChange }) {
  const current = value?.[field.key];

  const setField = (v) => {
    onChange({ ...value, [field.key]: v });
  };

  if (field.type === "boolean") {
    return (
      <div className="flex items-center h-10">
        <Checkbox
          checked={Boolean(current)}
          onCheckedChange={(checked) => setField(Boolean(checked))}
        />
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <Select
        value={current !== undefined ? String(current) : undefined}
        onValueChange={(v) => setField(v)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          {field.options?.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (field.type === "number") {
    return (
      <Input
        type="number"
        value={current !== undefined ? String(current) : ""}
        onChange={(e) =>
          setField(e.target.value === "" ? "" : Number(e.target.value))
        }
      />
    );
  }

  return (
    <Input
      type="text"
      value={current !== undefined ? String(current) : ""}
      onChange={(e) => setField(e.target.value)}
    />
  );
}
