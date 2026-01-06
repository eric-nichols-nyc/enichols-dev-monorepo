"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Card, CardContent } from "@repo/design-system/components/ui/card";

type User = {
  name: string;
  email: string;
  lastUpdated: Date;
};

type UserProfileProps = {
  user: User;
  onSave?: () => void;
  isSaving?: boolean;
};

/**
 * ✅ GOOD: Single Responsibility - Only displays user data
 */
export const UserProfile = ({ user, onSave, isSaving }: UserProfileProps) => {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div>
          <h3 className="font-semibold">{user.name}</h3>
          <p className="text-muted-foreground text-sm">{user.email}</p>
          <p className="text-muted-foreground text-xs mt-2">
            Last updated: {user.lastUpdated.toLocaleDateString()}
          </p>
        </div>
        {onSave && (
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save User"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

