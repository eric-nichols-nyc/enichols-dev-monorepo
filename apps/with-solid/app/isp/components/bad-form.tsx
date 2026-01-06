"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Card, CardContent } from "@repo/design-system/components/ui/card";

/**
 * ❌ BAD: Forces components to implement unused props
 */
type BadFormProps = {
  onSubmit: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onExport: () => void;
  onPrint: () => void;
  showDelete?: boolean;
  showExport?: boolean;
  showPrint?: boolean;
};

export const BadForm = ({
  onSubmit,
  onCancel,
  onDelete,
  onExport,
  onPrint,
  showDelete,
  showExport,
  showPrint,
}: BadFormProps) => {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Name"
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button type="submit">Submit</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            {showDelete && (
              <Button type="button" variant="destructive" onClick={onDelete}>
                Delete
              </Button>
            )}
            {showExport && (
              <Button type="button" variant="outline" onClick={onExport}>
                Export
              </Button>
            )}
            {showPrint && (
              <Button type="button" variant="outline" onClick={onPrint}>
                Print
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

