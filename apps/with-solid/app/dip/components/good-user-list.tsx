"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@repo/design-system/components/ui/card";

/**
 * ✅ GOOD: Depends on abstraction (Storage interface)
 * Easy to test, easy to swap implementations
 */
type Storage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

type GoodUserListProps = {
  storage?: Storage;
};

export const GoodUserList = ({ storage = localStorage }: GoodUserListProps) => {
  const [users, setUsers] = useState<string[]>([]);

  useEffect(() => {
    // Depends on abstraction, not concrete implementation
    const stored = storage.getItem("users");
    if (stored) {
      setUsers(JSON.parse(stored));
    }
  }, [storage]);

  const addUser = (name: string) => {
    const newUsers = [...users, name];
    setUsers(newUsers);
    // Depends on abstraction
    storage.setItem("users", JSON.stringify(newUsers));
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

// Easy to create mock storage for testing
export const createMockStorage = (): Storage => {
  const data: Record<string, string> = {};
  return {
    getItem: (key: string) => data[key] || null,
    setItem: (key: string, value: string) => {
      data[key] = value;
    },
  };
};

