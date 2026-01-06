"use client";

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
);

