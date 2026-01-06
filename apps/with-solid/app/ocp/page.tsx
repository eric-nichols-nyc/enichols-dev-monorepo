"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { SplitLayout } from "@/components/split-layout";
import { BadButton } from "./components/bad-button";
import { GoodButton, SuccessButton, WarningButton } from "./components/good-button";

const OCPPage = () => (
  <SplitLayout
    left={
      <>
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
      </>
    }
    right={
      <>
        <CardHeader>
          <CardTitle>Example</CardTitle>
          <CardDescription>Using interfaces and abstractions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-3 font-semibold text-destructive">❌ Bad Component</h3>
            <p className="mb-3 text-xs text-muted-foreground">
              Must modify component to add new button types
            </p>
            <div className="space-y-2">
              <BadButton type="primary" label="Primary" onClick={() => {}} />
              <BadButton type="secondary" label="Secondary" onClick={() => {}} />
              <BadButton type="danger" label="Danger" onClick={() => {}} />
            </div>
          </div>
          <div>
            <h3 className="mb-3 font-semibold text-green-600 dark:text-green-400">
              ✅ Good Component
            </h3>
            <p className="mb-3 text-xs text-muted-foreground">
              Extended without modifying base component
            </p>
            <div className="space-y-2">
              <GoodButton label="Base Button" onClick={() => {}} />
              <SuccessButton label="Success (Extended)" onClick={() => {}} />
              <WarningButton label="Warning (Extended)" onClick={() => {}} />
            </div>
          </div>
        </CardContent>
      </>
    }
  />
);

export default OCPPage;

