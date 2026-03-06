'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, RefreshCw, AlertCircle, FileText, Receipt, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type RatesResponse = {
  conventional: {
    rate30yr: number | null;
    rate15yr: number | null;
    asOf: string | null;
    source: 'fred' | 'mock';
  };
  nonQm: {
    bankStatement: { min30: number; max30: number; min15: number; max15: number };
    '1099': { min30: number; max30: number; min15: number; max15: number };
    pnl: { min30: number; max30: number; min15: number; max15: number };
  };
  disclaimer: string;
};

function formatRate(n: number | null) {
  return n != null ? `${n.toFixed(2)}%` : '—';
}

function formatRange(min: number, max: number) {
  return `${min.toFixed(2)}% – ${max.toFixed(2)}%`;
}

export default function RatesPage() {
  const [data, setData] = useState<RatesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = async () => {
    setLoading(true);
    setError(null);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL;
      const url = base ? `${base.replace(/\/$/, '')}/rates` : '/api/rates';
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.statusText);
      const json: RatesResponse = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load rates');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Live Rates</h1>
          <p className="text-muted-foreground">
            Conventional and non-QM mortgage rates for reference
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchRates} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchRates}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {loading && !data && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}

      {data && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">30-Year Fixed</CardTitle>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold font-mono">{formatRate(data.conventional.rate30yr)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Conventional · {data.conventional.asOf ?? 'N/A'}
                  {data.conventional.source === 'mock' && (
                    <span className="ml-2 text-amber-600">(sample data)</span>
                  )}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">15-Year Fixed</CardTitle>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold font-mono">{formatRate(data.conventional.rate15yr)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Conventional · {data.conventional.asOf ?? 'N/A'}
                  {data.conventional.source === 'mock' && (
                    <span className="ml-2 text-amber-600">(sample data)</span>
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Non-QM Rate Ranges</CardTitle>
              <CardDescription>
                Indicative ranges above conventional (for education only; actual rates depend on lender and borrower)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <FileText className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">Bank Statement</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      30-yr: {formatRange(data.nonQm.bankStatement.min30, data.nonQm.bankStatement.max30)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      15-yr: {formatRange(data.nonQm.bankStatement.min15, data.nonQm.bankStatement.max15)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <Receipt className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">1099</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      30-yr: {formatRange(data.nonQm['1099'].min30, data.nonQm['1099'].max30)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      15-yr: {formatRange(data.nonQm['1099'].min15, data.nonQm['1099'].max15)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <BarChart3 className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">P&amp;L</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      30-yr: {formatRange(data.nonQm.pnl.min30, data.nonQm.pnl.max30)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      15-yr: {formatRange(data.nonQm.pnl.min15, data.nonQm.pnl.max15)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-muted bg-muted/30">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{data.disclaimer}</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
