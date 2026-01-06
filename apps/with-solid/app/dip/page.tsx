import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { SplitLayout } from "@/components/split-layout";
import { BadUserList } from "./components/bad-user-list";
import { GoodUserList } from "./components/good-user-list";

const DIPPage = () => (
  <SplitLayout
    left={
      <>
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
      </>
    }
    right={
      <>
        <CardHeader>
          <CardTitle>Example</CardTitle>
          <CardDescription>Dependency injection and abstractions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-3 font-semibold text-destructive">❌ Bad Component</h3>
            <p className="mb-3 text-xs text-muted-foreground">
              Directly depends on localStorage - hard to test or swap
            </p>
            <BadUserList />
          </div>
          <div>
            <h3 className="mb-3 font-semibold text-green-600 dark:text-green-400">
              ✅ Good Component
            </h3>
            <p className="mb-3 text-xs text-muted-foreground">
              Depends on Storage abstraction - easy to test and swap implementations
            </p>
            <GoodUserList />
          </div>
        </CardContent>
      </>
    }
  />
);

export default DIPPage;

