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
import { BadUserList } from "./components/bad-user-list";
import { GoodUserList } from "./components/good-user-list";

const badCode = `"use client";

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
          onClick={() => addUser(\`User \${users.length + 1}\`)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded"
        >
          Add User
        </button>
      </CardContent>
    </Card>
  );
};`;

const goodCode = `"use client";

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
          onClick={() => addUser(\`User \${users.length + 1}\`)}
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
};`;

const DIPPage = () => (
  <div className="flex min-h-[calc(100vh-4rem)] flex-col">
    <div className="shrink-0 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Dependency Inversion Principle</CardTitle>
          <CardDescription>
            Depend on abstractions, not concretions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="mb-2 font-semibold">Definition</h3>
            <p className="text-muted-foreground text-sm">
              The Dependency Inversion Principle states that high-level modules
              should not depend on low-level modules. Both should depend on
              abstractions. Abstractions should not depend on details; details
              should depend on abstractions.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Benefits</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>Reduced coupling between modules</li>
              <li>Easier to test and mock</li>
              <li>More flexible architecture</li>
              <li>Better code reusability</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>

    <div className="flex-1">
      <SplitLayout
        left={
          <ComponentCodeLayout
            component={<BadUserList />}
            code={badCode}
            title="❌ Bad Component"
            description="Directly depends on localStorage - hard to test or swap"
          />
        }
        right={
          <ComponentCodeLayout
            component={<GoodUserList />}
            code={goodCode}
            title="✅ Good Component"
            description="Depends on Storage abstraction - easy to test and swap implementations"
          />
        }
      />
    </div>
  </div>
);

export default DIPPage;

