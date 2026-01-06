"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@repo/design-system/components/ui/card";

/**
 * ❌ BAD: Depends on concrete implementation (localStorage)
 * Hard to test, hard to swap implementations
 */
export const BadUserList = () => {
  const [users, setUsers] = useState<string[]>([]);

  useEffect(() => {
    // Direct dependency on localStorage
    const stored = localStorage.getItem("users");
    if (stored) {
      setUsers(JSON.parse(stored));
    }
  }, []);

  const addUser = (name: string) => {
    const newUsers = [...users, name];
    setUsers(newUsers);
    // Direct dependency on localStorage
    localStorage.setItem("users", JSON.stringify(newUsers));
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          {users.map((user, i) => (
            <div key={i} className="p-2 border rounded">
              {user}
            </div>
          ))}
        </div>
        <button
          onClick={() => addUser(`User ${users.length + 1}`)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded"
        >
          Add User
        </button>
      </CardContent>
    </Card>
  );
};

