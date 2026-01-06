"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Card, CardContent } from "@repo/design-system/components/ui/card";

/**
 * ✅ GOOD: Segregated interfaces - components only use what they need
 */
type BaseFormProps = {
  onSubmit: () => void;
  onCancel: () => void;
};

type DeletableFormProps = {
  onDelete: () => void;
};

type ExportableFormProps = {
  onExport: () => void;
};

type PrintableFormProps = {
  onPrint: () => void;
};

export const BaseForm = ({ onSubmit, onCancel }: BaseFormProps) => {
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
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export const DeletableForm = (props: BaseFormProps & DeletableFormProps) => (
  <div>
    <BaseForm onSubmit={props.onSubmit} onCancel={props.onCancel} />
    <div className="mt-2">
      <Button variant="destructive" onClick={props.onDelete}>
        Delete
      </Button>
    </div>
  </div>
);

export const ExportableForm = (props: BaseFormProps & ExportableFormProps) => (
  <div>
    <BaseForm onSubmit={props.onSubmit} onCancel={props.onCancel} />
    <div className="mt-2">
      <Button variant="outline" onClick={props.onExport}>
        Export
      </Button>
    </div>
  </div>
);

