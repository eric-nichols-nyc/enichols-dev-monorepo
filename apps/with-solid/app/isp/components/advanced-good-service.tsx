"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/design-system/components/ui/card";
import { ReadOnlyService } from "./services/read-only-service";
import { FullService } from "./services/full-service";
import { EmailService } from "./services/email-service";

/**
 * ✅ GOOD: Segregated interfaces - clients only implement what they need
 */
export const AdvancedGoodService = () => {
  const readOnlyService = new ReadOnlyService();
  const fullService = new FullService();
  const emailService = new EmailService();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Interfaces</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <button
            className="w-full p-2 border rounded text-left hover:bg-accent"
            onClick={() => readOnlyService.read()}
          >
            ReadOnlyService.read()
          </button>
          <button
            className="w-full p-2 border rounded text-left hover:bg-accent"
            onClick={() => fullService.create()}
          >
            FullService.create()
          </button>
          <button
            className="w-full p-2 border rounded text-left hover:bg-accent"
            onClick={() => emailService.sendEmail()}
          >
            EmailService.sendEmail()
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Each service only implements what it needs
        </p>
      </CardContent>
    </Card>
  );
};





