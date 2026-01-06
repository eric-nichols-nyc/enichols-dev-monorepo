"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { SplitLayout } from "@/components/split-layout";
import { BadForm } from "./components/bad-form";
import { BaseForm, DeletableForm, ExportableForm } from "./components/good-form";

const ISPPage = () => (
  <SplitLayout
    left={
      <>
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
      </>
    }
    right={
      <>
        <CardHeader>
          <CardTitle>Example</CardTitle>
          <CardDescription>Segregated interfaces</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-3 font-semibold text-destructive">❌ Bad Component</h3>
            <p className="mb-3 text-xs text-muted-foreground">
              Forces all components to implement unused props
            </p>
            <BadForm
              onSubmit={() => {}}
              onCancel={() => {}}
              onDelete={() => {}}
              onExport={() => {}}
              onPrint={() => {}}
            />
          </div>
          <div>
            <h3 className="mb-3 font-semibold text-green-600 dark:text-green-400">
              ✅ Good Component
            </h3>
            <p className="mb-3 text-xs text-muted-foreground">
              Segregated - components only use what they need
            </p>
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
          </div>
        </CardContent>
      </>
    }
  />
);

export default ISPPage;

