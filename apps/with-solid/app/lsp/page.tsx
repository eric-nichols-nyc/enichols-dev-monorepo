"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { SplitLayout } from "@/components/split-layout";
import { Card as BadCard, ClickableCard as BadClickableCard } from "./components/bad-card";
import { BaseCard, ClickableCard, HoverableCard } from "./components/good-card";

const LSPPage = () => (
  <SplitLayout
    left={
      <>
        <CardHeader>
          <CardTitle>Liskov Substitution Principle</CardTitle>
          <CardDescription>
            Subtypes must be substitutable for their base types
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="mb-2 font-semibold">Definition</h3>
            <p className="text-muted-foreground text-sm">
              The Liskov Substitution Principle states that objects of a
              superclass should be replaceable with objects of its subclasses
              without breaking the application. Derived classes must be
              substitutable for their base classes.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Benefits</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>Ensures proper inheritance hierarchies</li>
              <li>Prevents unexpected behavior</li>
              <li>Maintains contract compliance</li>
              <li>Improves code reliability</li>
            </ul>
          </div>
        </CardContent>
      </>
    }
    right={
      <>
        <CardHeader>
          <CardTitle>Example</CardTitle>
          <CardDescription>Proper inheritance contracts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-3 font-semibold text-destructive">❌ Bad Component</h3>
            <p className="mb-3 text-xs text-muted-foreground">
              ClickableCard requires onClick prop, cannot substitute base Card
            </p>
            <div className="space-y-2">
              <BadCard title="Base Card">Can be used here</BadCard>
              {/* BadClickableCard requires onClick, breaks substitution */}
            </div>
          </div>
          <div>
            <h3 className="mb-3 font-semibold text-green-600 dark:text-green-400">
              ✅ Good Component
            </h3>
            <p className="mb-3 text-xs text-muted-foreground">
              All variants can be used interchangeably
            </p>
            <div className="space-y-2">
              <BaseCard title="Base Card">Base implementation</BaseCard>
              <ClickableCard
                title="Clickable Card"
                onClick={() => {
                  console.log("Clicked!");
                }}
              >
                Can substitute BaseCard
              </ClickableCard>
              <HoverableCard title="Hoverable Card">
                Also substitutable
              </HoverableCard>
            </div>
          </div>
        </CardContent>
      </>
    }
  />
);

export default LSPPage;

