"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { SplitLayout } from "@/components/split-layout";
import { ComponentCodeLayout } from "@/components/component-code-layout";
import { BadForm } from "./components/bad-form";
import { BaseForm, DeletableForm, ExportableForm } from "./components/good-form";

const badCode = `"use client";

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
};`;

const goodCode = `"use client";

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
);`;

const ISPPage = () => (
  <div className="flex min-h-[calc(100vh-4rem)] flex-col">
    <div className="shrink-0 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Interface Segregation Principle</CardTitle>
          <CardDescription>
            Clients should not be forced to depend on interfaces they do not
            use
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="mb-2 font-semibold">Definition</h3>
            <p className="text-muted-foreground text-sm">
              The Interface Segregation Principle states that clients should not
              be forced to implement interfaces they don't use. Instead of one
              fat interface, many small, specific interfaces are preferred.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Benefits</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>Reduces coupling</li>
              <li>Prevents unnecessary dependencies</li>
              <li>More flexible and maintainable code</li>
              <li>Easier to understand interfaces</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>

    <div className="flex-1">
      <SplitLayout
        left={
          <ComponentCodeLayout
            component={
              <BadForm
                onSubmit={() => {}}
                onCancel={() => {}}
                onDelete={() => {}}
                onExport={() => {}}
                onPrint={() => {}}
              />
            }
            code={badCode}
            title="❌ Bad Component"
            description="Forces all components to implement unused props"
          />
        }
        right={
          <ComponentCodeLayout
            component={
              <div className="space-y-4">
                <BaseForm onSubmit={() => {}} onCancel={() => {}} />
                <DeletableForm
                  onSubmit={() => {}}
                  onCancel={() => {}}
                  onDelete={() => {}}
                />
                <ExportableForm
                  onSubmit={() => {}}
                  onCancel={() => {}}
                  onExport={() => {}}
                />
              </div>
            }
            code={goodCode}
            title="✅ Good Component"
            description="Segregated - components only use what they need"
          />
        }
      />
    </div>
  </div>
);

export default ISPPage;

