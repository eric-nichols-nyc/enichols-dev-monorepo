"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/design-system/components/ui/card";

/**
 * ❌ BAD: Advanced example violating LSP
 * CreditCardPayment throws error when used in place of Payment
 */
type Payment = {
  amount: number;
  process: () => void;
};

export const AdvancedBadPayment = () => {
  const processPayment = (payment: Payment) => {
    // This should work for all payment types
    payment.process();
  };

  const creditCardPayment: Payment = {
    amount: 100,
    process: () => {
      // Violates LSP: Throws error instead of processing
      throw new Error("Credit card processing not implemented");
    },
  };

  const cashPayment: Payment = {
    amount: 100,
    process: () => {
      console.log("Processing cash payment of $100");
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Processing</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <button
            className="w-full p-2 border rounded text-left"
            onClick={() => {
              try {
                processPayment(cashPayment);
              } catch (e) {
                console.error(e);
              }
            }}
          >
            Process Cash Payment
          </button>
          <button
            className="w-full p-2 border rounded text-left text-red-600"
            onClick={() => {
              try {
                processPayment(creditCardPayment);
              } catch (e) {
                console.error("Error:", e);
              }
            }}
          >
            Process Credit Card (Breaks LSP)
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          CreditCardPayment cannot substitute Payment - violates LSP
        </p>
      </CardContent>
    </Card>
  );
};





