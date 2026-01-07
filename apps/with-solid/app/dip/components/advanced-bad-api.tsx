"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/design-system/components/ui/card";
import { useState } from "react";

/**
 * ❌ BAD: Depends on concrete implementation (fetch API)
 * Hard to test, hard to swap implementations
 */
export const AdvancedBadApi = () => {
  const [data, setData] = useState<string>("");

  const fetchData = async () => {
    // Direct dependency on fetch API
    const response = await fetch("https://api.example.com/data");
    const json = await response.json();
    setData(JSON.stringify(json));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Client</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <button
          className="w-full p-2 border rounded hover:bg-accent"
          onClick={fetchData}
        >
          Fetch Data (Direct fetch dependency)
        </button>
        {data && (
          <div className="p-2 border rounded text-sm">
            <pre>{data}</pre>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Hard to test or swap with mock API
        </p>
      </CardContent>
    </Card>
  );
};





