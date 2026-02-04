'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  Star,
  StarOff,
  MessageSquare,
  Share2,
  TrendingUp,
  TrendingDown,
  Building2,
  Calendar,
  FileText,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Briefcase,
  MapPin,
  Clock,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, ScoreBadge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useReportsStore } from '@/store';
import { formatCurrency, anonymizeBorrowerId, cn } from '@/lib/utils';

// Mock report data
const mockReport = {
  id: 'brw-a1b2c3d4',
  score: 85,
  letterGrade: 'B+',
  annualIncome: 72500,
  monthlyIncome: 6042,
  sources: 3,
  yearsActive: 2.5,
  state: 'CA',
  city: 'Los Angeles',
  loanType: 'mortgage',
  trend: 'growing' as const,
  verified: true,
  lastUpdated: '2024-01-15',
  createdAt: '2023-06-20',

  // Score breakdown
  scoreBreakdown: {
    incomeStability: 82,
    diversification: 88,
    consistency: 85,
    growth: 90,
    verification: 80,
  },

  // Income sources
  incomeSources: [
    {
      name: 'Uber',
      monthlyAvg: 3200,
      yearlyTotal: 38400,
      percentage: 53,
      trend: 'growing',
      verified: true,
      months: 24,
    },
    {
      name: 'DoorDash',
      monthlyAvg: 1800,
      yearlyTotal: 21600,
      percentage: 30,
      trend: 'stable',
      verified: true,
      months: 18,
    },
    {
      name: 'Freelance Web Dev',
      monthlyAvg: 1042,
      yearlyTotal: 12500,
      percentage: 17,
      trend: 'growing',
      verified: true,
      months: 12,
    },
  ],

  // Monthly income history
  monthlyHistory: [
    { month: 'Aug', income: 5800, projected: 5500 },
    { month: 'Sep', income: 6200, projected: 5700 },
    { month: 'Oct', income: 5900, projected: 5900 },
    { month: 'Nov', income: 6500, projected: 6100 },
    { month: 'Dec', income: 6800, projected: 6300 },
    { month: 'Jan', income: 6042, projected: 6500 },
  ],

  // Verification status
  verificationDetails: {
    bankConnected: true,
    taxReturnsVerified: true,
    platformsLinked: 3,
    lastVerification: '2024-01-15',
    verificationScore: 95,
  },

  // Risk factors
  riskFactors: [
    { factor: 'Income volatility', level: 'low', description: 'Monthly variation within 15%' },
    { factor: 'Platform dependency', level: 'medium', description: '53% from single source' },
    { factor: 'Experience', level: 'low', description: '2.5 years in gig economy' },
  ],

  // Positive indicators
  positiveIndicators: [
    'Consistent income growth over 12 months',
    'Multiple diversified income sources',
    'All platforms verified and linked',
    'No gaps in income history',
  ],
};

const pieColors = ['#1B4D3E', '#34D399', '#A8E6CF'];

export default function ReportDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isInShortlist, addToShortlist, removeFromShortlist } = useReportsStore();
  const [showContactDialog, setShowContactDialog] = useState(false);

  const inShortlist = isInShortlist(params.id);

  const toggleShortlist = () => {
    if (inShortlist) {
      removeFromShortlist(params.id);
    } else {
      addToShortlist(params.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-mono">
                {anonymizeBorrowerId(mockReport.id)}
              </h1>
              <ScoreBadge score={mockReport.score} size="lg" />
              {mockReport.verified && (
                <Badge variant="success">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Last updated {mockReport.lastUpdated}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={toggleShortlist}>
            {inShortlist ? (
              <>
                <Star className="mr-2 h-4 w-4 fill-yellow-400 text-yellow-400" />
                Saved
              </>
            ) : (
              <>
                <StarOff className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
            <DialogTrigger asChild>
              <Button>
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact Borrower
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Contact Borrower</DialogTitle>
                <DialogDescription>
                  Send a message expressing interest in this borrower. They will receive
                  your institution's information and contact details.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Loan Type Interest</Label>
                  <Input placeholder="e.g., 30-year fixed mortgage" />
                </div>
                <div className="space-y-2">
                  <Label>Message (Optional)</Label>
                  <textarea
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[100px]"
                    placeholder="Add a personalized message..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowContactDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowContactDialog(false)}>
                  Send Interest
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Annual Income</p>
                <p className="text-xl font-bold font-mono">
                  {formatCurrency(mockReport.annualIncome)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Income Sources</p>
                <p className="text-xl font-bold">{mockReport.sources} Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Experience</p>
                <p className="text-xl font-bold">{mockReport.yearsActive} Years</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="text-xl font-bold">
                  {mockReport.city}, {mockReport.state}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="income">Income Details</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Score Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Score Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(mockReport.scoreBreakdown).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="font-mono font-medium">{value}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          value >= 80 ? 'bg-score-excellent' :
                          value >= 70 ? 'bg-score-good' :
                          value >= 60 ? 'bg-score-fair' : 'bg-score-poor'
                        )}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Income Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Income Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockReport.monthlyHistory}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={(value) => `$${value / 1000}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Line
                        type="monotone"
                        dataKey="income"
                        stroke="#1B4D3E"
                        strokeWidth={2}
                        dot={{ fill: '#1B4D3E' }}
                        name="Actual"
                      />
                      <Line
                        type="monotone"
                        dataKey="projected"
                        stroke="#94A3B8"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        dot={false}
                        name="Projected"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Positive Indicators */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Positive Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {mockReport.positiveIndicators.map((indicator, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-positive mt-0.5 shrink-0" />
                      <span className="text-sm">{indicator}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Risk Factors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {mockReport.riskFactors.map((risk, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Badge
                        variant={
                          risk.level === 'low'
                            ? 'success'
                            : risk.level === 'medium'
                            ? 'warning'
                            : 'error'
                        }
                        className="mt-0.5 shrink-0"
                      >
                        {risk.level}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">{risk.factor}</p>
                        <p className="text-xs text-muted-foreground">
                          {risk.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Income Details Tab */}
        <TabsContent value="income" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Income Sources Table */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Income Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Source</th>
                      <th>Monthly Avg</th>
                      <th>Yearly Total</th>
                      <th>Share</th>
                      <th>Trend</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockReport.incomeSources.map((source) => (
                      <tr key={source.name}>
                        <td className="font-medium">{source.name}</td>
                        <td className="font-mono">{formatCurrency(source.monthlyAvg)}</td>
                        <td className="font-mono">{formatCurrency(source.yearlyTotal)}</td>
                        <td>{source.percentage}%</td>
                        <td>
                          <div className="flex items-center gap-1">
                            {source.trend === 'growing' ? (
                              <TrendingUp className="h-4 w-4 text-positive" />
                            ) : source.trend === 'declining' ? (
                              <TrendingDown className="h-4 w-4 text-negative" />
                            ) : (
                              <span className="h-4 w-4 flex items-center justify-center text-muted-foreground">
                                —
                              </span>
                            )}
                            <span className="text-sm capitalize">{source.trend}</span>
                          </div>
                        </td>
                        <td>
                          {source.verified ? (
                            <Badge variant="success">Verified</Badge>
                          ) : (
                            <Badge variant="warning">Pending</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Income Distribution Pie */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockReport.incomeSources.map((s) => ({
                          name: s.name,
                          value: s.percentage,
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {mockReport.incomeSources.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {mockReport.incomeSources.map((source, i) => (
                    <div key={source.name} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: pieColors[i] }}
                      />
                      <span className="text-sm">{source.name}</span>
                      <span className="text-sm text-muted-foreground ml-auto">
                        {source.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly History Chart */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-lg">Monthly Income History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockReport.monthlyHistory}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={(value) => `$${value / 1000}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Bar dataKey="income" fill="#1B4D3E" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value="verification" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Verification Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-accent" />
                    <span>Bank Account Connected</span>
                  </div>
                  {mockReport.verificationDetails.bankConnected ? (
                    <CheckCircle className="h-5 w-5 text-positive" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-negative" />
                  )}
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-accent" />
                    <span>Tax Returns Verified</span>
                  </div>
                  {mockReport.verificationDetails.taxReturnsVerified ? (
                    <CheckCircle className="h-5 w-5 text-positive" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-negative" />
                  )}
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-accent" />
                    <span>Platforms Linked</span>
                  </div>
                  <span className="font-mono font-medium">
                    {mockReport.verificationDetails.platformsLinked}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-accent" />
                    <span>Last Verification</span>
                  </div>
                  <span className="text-sm">
                    {mockReport.verificationDetails.lastVerification}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Verification Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center h-32 w-32 rounded-full bg-accent/10">
                    <span className="text-4xl font-bold text-accent">
                      {mockReport.verificationDetails.verificationScore}%
                    </span>
                  </div>
                  <p className="mt-4 text-muted-foreground">
                    All income sources have been independently verified through bank
                    connections and platform integrations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Risk Analysis Tab */}
        <TabsContent value="risk" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Risk Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {mockReport.riskFactors.map((risk, i) => (
                    <li
                      key={i}
                      className="p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{risk.factor}</span>
                        <Badge
                          variant={
                            risk.level === 'low'
                              ? 'success'
                              : risk.level === 'medium'
                              ? 'warning'
                              : 'error'
                          }
                        >
                          {risk.level} risk
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {risk.description}
                      </p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lending Recommendation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-positive/10 border border-positive/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-positive" />
                      <span className="font-medium text-positive">
                        Recommended for Approval
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This borrower has a strong income score with diversified sources
                      and verified documentation. The risk profile is favorable for
                      standard lending terms.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Suggested Loan Parameters</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Maximum loan amount: {formatCurrency(mockReport.annualIncome * 4)}</li>
                      <li>• Recommended DTI: 36-43%</li>
                      <li>• Standard interest rates applicable</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
