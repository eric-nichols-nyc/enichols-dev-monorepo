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
import { Card as BadCard } from "./components/bad-card";
import { BaseCard, ClickableCard, HoverableCard } from "./components/good-card";

const badCode = `"use client";

import { Card as UICard, CardContent, CardHeader, CardTitle } from "@repo/design-system/components/ui/card";

/**
 * ❌ BAD: ClickableCard violates LSP
 * Cannot be used wherever Card is expected
 */
type CardProps = {
  title: string;
  children: React.ReactNode;
};

export const Card = ({ title, children }: CardProps) => (
  <UICard>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </UICard>
);

export const ClickableCard = ({ title, children, onClick }: CardProps & { onClick: () => void }) => {
  // Violates LSP: Adds required prop that base Card doesn't have
  return (
    <div onClick={onClick} className="cursor-pointer">
      <Card title={title}>{children}</Card>
    </div>
  );
};`;

const goodCode = `"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/design-system/components/ui/card";
import type { ComponentProps } from "react";

/**
 * ✅ GOOD: All variants can be used interchangeably
 */
type BaseCardProps = {
  title: string;
  children: React.ReactNode;
};

export const BaseCard = ({ title, children }: BaseCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

// Can be used wherever BaseCard is expected
export const ClickableCard = ({
  title,
  children,
  onClick,
  ...props
}: BaseCardProps & { onClick?: () => void } & ComponentProps<"div">) => {
  return (
    <div onClick={onClick} className={onClick ? "cursor-pointer" : ""} {...props}>
      <BaseCard title={title}>{children}</BaseCard>
    </div>
  );
};

// Also substitutable
export const HoverableCard = ({ title, children, ...props }: BaseCardProps & ComponentProps<"div">) => {
  return (
    <div className="hover:shadow-lg transition-shadow" {...props}>
      <BaseCard title={title}>{children}</BaseCard>
    </div>
  );
};`;

const LSPPage = () => (
  <div className="flex min-h-[calc(100vh-4rem)] flex-col">
    <div className="shrink-0 p-6">
      <Card>
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
      </Card>
    </div>

    <div className="flex-1">
      <SplitLayout
        left={
          <ComponentCodeLayout
            component={
              <div className="space-y-2">
                <BadCard title="Base Card">Can be used here</BadCard>
              </div>
            }
            code={badCode}
            title="❌ Bad Component"
            description="ClickableCard requires onClick prop, cannot substitute base Card"
          />
        }
        right={
          <ComponentCodeLayout
            component={
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
            }
            code={goodCode}
            title="✅ Good Component"
            description="All variants can be used interchangeably"
          />
        }
      />
    </div>
  </div>
);

export default LSPPage;

