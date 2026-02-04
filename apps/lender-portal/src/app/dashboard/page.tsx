'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  Users,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Eye,
  ArrowRight,
  Clock,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, ScoreBadge } from '@/components/ui/badge';
import { formatCurrency, anonymizeBorrowerId } from '@/lib/utils';

// Mock data
const stats = [
  {
    title: 'New Reports',
    value: '47',
    change: '+12',
    changeType: 'positive' as const,
    subtitle: 'This week',
    icon: FileText,
  },
  {
    title: 'Reports Viewed',
    value: '128',
    change: '+23%',
    changeType: 'positive' as const,
    subtitle: 'vs last week',
    icon: Eye,
  },
  {
    title: 'Borrowers Contacted',
    value: '18',
    change: '+5',
    changeType: 'positive' as const,
    subtitle: 'This week',
    icon: Users,
  },
  {
    title: 'Pending Messages',
    value: '6',
    change: '-2',
    changeType: 'negative' as const,
    subtitle: 'Awaiting response',
    icon: MessageSquare,
  },
];

const recentReports = [
  {
    id: 'brw-a1b2c3d4',
    score: 85,
    income: 72500,
    sources: 3,
    date: '2 hours ago',
    trend: 'growing',
  },
  {
    id: 'brw-e5f6g7h8',
    score: 78,
    income: 58200,
    sources: 2,
    date: '4 hours ago',
    trend: 'stable',
  },
  {
    id: 'brw-i9j0k1l2',
    score: 72,
    income: 45800,
    sources: 4,
    date: '6 hours ago',
    trend: 'growing',
  },
  {
    id: 'brw-m3n4o5p6',
    score: 68,
    income: 62100,
    sources: 2,
    date: 'Yesterday',
    trend: 'declining',
  },
  {
    id: 'brw-q7r8s9t0',
    score: 91,
    income: 95400,
    sources: 5,
    date: 'Yesterday',
    trend: 'growing',
  },
];

const chartData = [
  { name: 'Mon', reports: 12 },
  { name: 'Tue', reports: 19 },
  { name: 'Wed', reports: 15 },
  { name: 'Thu', reports: 22 },
  { name: 'Fri', reports: 18 },
  { name: 'Sat', reports: 8 },
  { name: 'Sun', reports: 5 },
];

const loanTypeData = [
  { name: 'Mortgage', value: 68, color: '#1B4D3E' },
  { name: 'Auto', value: 32, color: '#A8E6CF' },
];

const scoreDistribution = [
  { range: '90+', count: 15, fill: '#10B981' },
  { range: '80-89', count: 28, fill: '#34D399' },
  { range: '70-79', count: 42, fill: '#F59E0B' },
  { range: '60-69', count: 25, fill: '#F97316' },
  { range: '<60', count: 12, fill: '#EF4444' },
];

const activityFeed = [
  { type: 'view', message: 'Viewed report for BRW-A1B2C3', time: '10 min ago' },
  { type: 'contact', message: 'Sent interest to BRW-E5F6G7', time: '1 hour ago' },
  { type: 'message', message: 'New message from BRW-I9J0K1', time: '2 hours ago' },
  { type: 'match', message: '5 new reports match your criteria', time: '3 hours ago' },
  { type: 'view', message: 'Viewed report for BRW-M3N4O5', time: '5 hours ago' },
];

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold font-mono mt-1">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {stat.changeType === 'positive' ? (
                        <TrendingUp className="h-3 w-3 text-positive" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-negative" />
                      )}
                      <span
                        className={`text-xs font-medium ${
                          stat.changeType === 'positive'
                            ? 'text-positive'
                            : 'text-negative'
                        }`}
                      >
                        {stat.change}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {stat.subtitle}
                      </span>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Reports Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Borrower Reports</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/reports">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Borrower ID</th>
                    <th>Score</th>
                    <th>Annual Income</th>
                    <th>Sources</th>
                    <th>Trend</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recentReports.map((report) => (
                    <tr
                      key={report.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/dashboard/reports/${report.id}`)}
                    >
                      <td className="font-mono text-sm">
                        {anonymizeBorrowerId(report.id)}
                      </td>
                      <td>
                        <ScoreBadge score={report.score} />
                      </td>
                      <td className="font-mono">
                        {formatCurrency(report.income)}
                      </td>
                      <td>{report.sources}</td>
                      <td>
                        <Badge
                          variant={
                            report.trend === 'growing'
                              ? 'success'
                              : report.trend === 'declining'
                              ? 'error'
                              : 'secondary'
                          }
                        >
                          {report.trend}
                        </Badge>
                      </td>
                      <td className="text-muted-foreground">{report.date}</td>
                      <td>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activity Feed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityFeed.map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Line Chart - Reports Over Time */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">New Matching Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="name"
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="reports"
                    stroke="#1B4D3E"
                    strokeWidth={2}
                    dot={{ fill: '#1B4D3E', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart - Loan Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Views by Loan Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={loanTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {loanTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {loanTypeData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {item.name} ({item.value}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Borrower Score Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="range"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {scoreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
