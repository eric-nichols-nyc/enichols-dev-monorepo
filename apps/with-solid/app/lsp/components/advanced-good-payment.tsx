"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/design-system/components/ui/card";
import { CashPayment } from "./payments/cash-payment";
import { CreditCardPayment } from "./payments/credit-card-payment";
import { PayPalPayment } from "./payments/paypal-payment";

/**
 * ✅ GOOD: Advanced example following LSP
 * All payment types are substitutable
 */
type Payment = {
  amount: number;
  process: () => void;
};

export const AdvancedGoodPayment = () => {
  const processPayment = (payment: Payment) => {
    // Works for all payment types
    payment.process();
  };

  const payments: Payment[] = [
    new CashPayment(100),
    new CreditCardPayment(100, "1234-5678-9012-3456"),
    new PayPalPayment(100, "user@example.com"),
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Processing</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          {payments.map((payment, idx) => (
            <button
              key={idx}
              className="w-full p-2 border rounded text-left hover:bg-accent"
              onClick={() => processPayment(payment)}
            >
              Process ${payment.amount} Payment
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          All payment types are substitutable - follows LSP
        </p>
      </CardContent>
    </Card>
  );
};





