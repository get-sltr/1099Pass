'use client';

import { useState } from 'react';
import { CreditCard, PaymentForm } from 'react-square-web-payments-sdk';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SquarePaymentFormProps {
  applicationId: string;
  locationId: string;
  planId: string;
  planName: string;
  priceLabel: string;
  onSuccess: (data: { subscriptionId: string; tier: string }) => void;
  onError: (msg: string) => void;
  onCancel: () => void;
}

export function SquarePaymentForm({
  applicationId,
  locationId,
  planId,
  planName,
  priceLabel,
  onSuccess,
  onError,
  onCancel,
}: SquarePaymentFormProps) {
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-4">
      <div className="text-center pb-2">
        <p className="text-sm text-muted-foreground">
          Subscribe to <span className="font-semibold text-foreground">{planName}</span>
        </p>
        <p className="text-2xl font-bold mt-1">{priceLabel}/month</p>
      </div>

      <PaymentForm
        applicationId={applicationId}
        locationId={locationId}
        cardTokenizeResponseReceived={async (token) => {
          const tokenAny = token as any;
          if (tokenAny.errors?.length) {
            onError(tokenAny.errors.map((e: any) => e.message).join(', '));
            return;
          }

          setLoading(true);
          try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
            const res = await fetch(`${apiUrl}/subscriptions/subscribe`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ planId, sourceId: tokenAny.token }),
            });

            const json = await res.json();

            if (!res.ok) {
              onError(json?.error?.message || 'Subscription failed');
              return;
            }

            onSuccess(json.data);
          } catch (err: any) {
            onError(err.message || 'Network error');
          } finally {
            setLoading(false);
          }
        }}
      >
        <CreditCard
          style={{
            '.input-container': {
              borderRadius: '6px',
            },
          }}
          render={(Button: any) => (
            <div className="flex gap-3 mt-4">
              <Button css={{ backgroundColor: '#000', fontSize: '14px', padding: '12px' }}>
                {loading ? 'Processing...' : `Subscribe — ${priceLabel}/mo`}
              </Button>
            </div>
          )}
        />
      </PaymentForm>

      <div className="flex justify-center pt-2">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Setting up your subscription...
        </div>
      )}

      <p className="text-xs text-center text-muted-foreground">
        Payments are processed securely by Square. Your card details never touch our servers.
      </p>
    </div>
  );
}
