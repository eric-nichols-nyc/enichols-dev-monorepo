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
import { BadButton } from "./components/bad-button";
import { GoodButton, SuccessButton, WarningButton } from "./components/good-button";

const badCode = `"use client";

import { Button } from "@repo/design-system/components/ui/button";

/**
 * ❌ BAD: Must modify this component to add new button types
 */
type BadButtonProps = {
  type: "primary" | "secondary" | "danger";
  label: string;
  onClick: () => void;
};

export const BadButton = ({ type, label, onClick }: BadButtonProps) => {
  // Must modify this component to add new types
  const getStyles = () => {
    switch (type) {
      case "primary":
        return "bg-blue-500 hover:bg-blue-600";
      case "secondary":
        return "bg-gray-500 hover:bg-gray-600";
      case "danger":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "";
    }
  };

  return (
    <Button onClick={onClick} className={getStyles()}>
      {label}
    </Button>
  );
};`;

const goodCode = `"use client";

import { Button } from "@repo/design-system/components/ui/button";
import type { ComponentProps } from "react";

/**
 * ✅ GOOD: Open for extension via composition
 * Can extend without modifying this component
 */
type GoodButtonProps = ComponentProps<typeof Button> & {
  label: string;
};

export const GoodButton = ({ label, ...buttonProps }: GoodButtonProps) => {
  return <Button {...buttonProps}>{label}</Button>;
};

// Extended without modifying GoodButton:
export const SuccessButton = (props: Omit<GoodButtonProps, "variant">) => (
  <GoodButton {...props} variant="default" className="bg-green-600 hover:bg-green-700" />
);

export const WarningButton = (props: Omit<GoodButtonProps, "variant">) => (
  <GoodButton {...props} variant="outline" className="border-yellow-500 text-yellow-600" />
);`;

const OCPPage = () => (
  <div className="flex min-h-[calc(100vh-4rem)] flex-col">
    <div className="shrink-0 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Open/Closed Principle</CardTitle>
          <CardDescription>
            Software entities should be open for extension but closed for
            modification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="mb-2 font-semibold">Definition</h3>
            <p className="text-muted-foreground text-sm">
              The Open/Closed Principle states that software entities (classes,
              modules, functions, etc.) should be open for extension but closed
              for modification. This means you should be able to add new
              functionality without changing existing code.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Benefits</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>Reduced risk of breaking existing functionality</li>
              <li>Easier to add new features</li>
              <li>Better code stability</li>
              <li>Promotes use of abstractions</li>
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
              <div className="space-y-2">
                <BadButton type="primary" label="Primary" onClick={() => {}} />
                <BadButton type="secondary" label="Secondary" onClick={() => {}} />
                <BadButton type="danger" label="Danger" onClick={() => {}} />
              </div>
            }
            code={badCode}
            title="❌ Bad Component"
            description="Must modify component to add new button types"
          />
        }
        right={
          <ComponentCodeLayout
            component={
              <div className="space-y-2">
                <GoodButton label="Base Button" onClick={() => {}} />
                <SuccessButton label="Success (Extended)" onClick={() => {}} />
                <WarningButton label="Warning (Extended)" onClick={() => {}} />
              </div>
            }
            code={goodCode}
            title="✅ Good Component"
            description="Extended without modifying base component"
          />
        }
      />
    </div>
  </div>
);

export default OCPPage;

