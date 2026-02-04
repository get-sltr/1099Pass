'use client';

import { useState } from 'react';
import {
  Download,
  Calendar,
  Eye,
  MessageSquare,
  FileText,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, cn } from '@/lib/utils';

// Mock analytics data
const overviewStats = [
  {
    title: 'Reports Viewed',
    value: 847,
    change: 12.5,
    changeType: 'positive' as const,
    period: 'vs last month',
    icon: Eye,
  },
  {
    title: 'Borrowers Contacted',
    value: 156,
    change: 8.3,
    changeType: 'positive' as const,
    period: 'vs last month',
    icon: MessageSquare,
  },
  {
    title: 'Response Rate',
    value: '68%',
    change: 5.2,
    changeType: 'positive' as const,
    period: 'vs last month',
    icon: Users,
  },
  {
    title: 'Avg. Time to Contact',
    value: '2.4h',
    change: -15.8,
    changeType: 'positive' as const,
    period: 'vs last month',
    icon: FileText,
  },
];

const activityTrend = [
  { date: 'Jan 1', views: 45, contacts: 12, responses: 8 },
  { date: 'Jan 8', views: 52, contacts: 15, responses: 11 },
  { date: 'Jan 15', views: 68, contacts: 22, responses: 16 },
  { date: 'Jan 22', views: 71, contacts: 18, responses: 14 },
  { date: 'Jan 29', views: 85, contacts: 28, responses: 20 },
  { date: 'Feb 5', views: 92, contacts: 32, responses: 24 },
];

const scoreDistribution = [
  { range: '90-100', count: 45, fill: '#10B981' },
  { range: '80-89', count: 82, fill: '#34D399' },
  { range: '70-79', count: 156, fill: '#F59E0B' },
  { range: '60-69', count: 98, fill: '#F97316' },
  { range: '<60', count: 42, fill: '#EF4444' },
];

const incomeDistribution = [
  { range: '<$30k', count: 25, fill: '#94A3B8' },
  { range: '$30-50k', count: 85, fill: '#64748B' },
  { range: '$50-75k', count: 145, fill: '#475569' },
  { range: '$75-100k', count: 98, fill: '#334155' },
  { range: '>$100k', count: 70, fill: '#1E293B' },
];

const conversionFunnel = [
  { stage: 'Reports Viewed', value: 847 },
  { stage: 'Shortlisted', value: 312 },
  { stage: 'Contacted', value: 156 },
  { stage: 'Responded', value: 106 },
  { stage: 'Application Started', value: 48 },
  { stage: 'Loan Closed', value: 12 },
];

const topSources = [
  { name: 'Uber', value: 28, color: '#1B4D3E' },
  { name: 'DoorDash', value: 22, color: '#34D399' },
  { name: 'Freelance', value: 18, color: '#A8E6CF' },
  { name: 'Lyft', value: 15, color: '#6EE7B7' },
  { name: 'Other', value: 17, color: '#D1FAE5' },
];

const monthlyComparison = [
  { month: 'Oct', thisYear: 620, lastYear: 480 },
  { month: 'Nov', thisYear: 750, lastYear: 520 },
  { month: 'Dec', thisYear: 680, lastYear: 590 },
  { month: 'Jan', thisYear: 847, lastYear: 610 },
];

const teamPerformance = [
  { name: 'John Smith', views: 245, contacts: 48, closedLoans: 5, revenue: 125000 },
  { name: 'Sarah Johnson', views: 198, contacts: 42, closedLoans: 4, revenue: 98000 },
  { name: 'Mike Davis', views: 167, contacts: 35, closedLoans: 2, revenue: 52000 },
  { name: 'Emily Brown', views: 142, contacts: 28, closedLoans: 1, revenue: 28000 },
];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Track your lending activity and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-36">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold font-mono mt-1">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {stat.changeType === 'positive' ? (
                        <ArrowUpRight className="h-3 w-3 text-positive" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-negative" />
                      )}
                      <span
                        className={cn(
                          'text-xs font-medium',
                          stat.changeType === 'positive'
                            ? 'text-positive'
                            : 'text-negative'
                        )}
                      >
                        {Math.abs(stat.change)}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {stat.period}
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

      <Tabs defaultValue="activity" className="space-y-6">
        <TabsList>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Activity Trend */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Activity Trend</CardTitle>
                <CardDescription>
                  Views, contacts, and responses over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
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
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="views"
                        stackId="1"
                        stroke="#1B4D3E"
                        fill="#1B4D3E"
                        fillOpacity={0.6}
                        name="Views"
                      />
                      <Area
                        type="monotone"
                        dataKey="contacts"
                        stackId="2"
                        stroke="#34D399"
                        fill="#34D399"
                        fillOpacity={0.6}
                        name="Contacts"
                      />
                      <Area
                        type="monotone"
                        dataKey="responses"
                        stackId="3"
                        stroke="#A8E6CF"
                        fill="#A8E6CF"
                        fillOpacity={0.6}
                        name="Responses"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Income Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Income Sources</CardTitle>
                <CardDescription>Borrowers contacted by source</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topSources}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {topSources.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {topSources.map((source) => (
                    <div
                      key={source.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: source.color }}
                        />
                        <span className="text-sm">{source.name}</span>
                      </div>
                      <span className="text-sm font-mono">{source.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Year over Year Comparison */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-lg">Year over Year Comparison</CardTitle>
                <CardDescription>Monthly activity comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyComparison}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="month"
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
                      <Legend />
                      <Bar
                        dataKey="thisYear"
                        fill="#1B4D3E"
                        name="This Year"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="lastYear"
                        fill="#94A3B8"
                        name="Last Year"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Score Distribution</CardTitle>
                <CardDescription>Borrowers contacted by score range</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scoreDistribution} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis
                        dataKey="range"
                        type="category"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {scoreDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Income Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Income Distribution</CardTitle>
                <CardDescription>Borrowers contacted by income range</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={incomeDistribution} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis
                        dataKey="range"
                        type="category"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {incomeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conversion Tab */}
        <TabsContent value="conversion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conversion Funnel</CardTitle>
              <CardDescription>
                Track borrowers through your lending pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionFunnel.map((stage, i) => {
                  const prevValue = i > 0 ? conversionFunnel[i - 1].value : stage.value;
                  const convRate = i > 0 ? ((stage.value / prevValue) * 100).toFixed(1) : 100;
                  const widthPercent = (stage.value / conversionFunnel[0].value) * 100;

                  return (
                    <div key={stage.stage} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{stage.stage}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono">{stage.value}</span>
                          {i > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {convRate}% conv.
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="h-8 bg-muted rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-accent to-accent/70 rounded-lg flex items-center justify-end pr-2"
                          style={{ width: `${widthPercent}%` }}
                        >
                          {widthPercent > 15 && (
                            <span className="text-xs text-white font-medium">
                              {widthPercent.toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 p-4 rounded-lg bg-muted">
                <p className="text-sm">
                  <span className="font-medium">Overall conversion:</span>{' '}
                  {((conversionFunnel[conversionFunnel.length - 1].value /
                    conversionFunnel[0].value) *
                    100).toFixed(2)}
                  % of viewed reports result in closed loans
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team Performance</CardTitle>
              <CardDescription>
                Individual loan officer activity and results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Team Member</th>
                    <th>Reports Viewed</th>
                    <th>Contacts Made</th>
                    <th>Loans Closed</th>
                    <th>Revenue</th>
                    <th>Conversion</th>
                  </tr>
                </thead>
                <tbody>
                  {teamPerformance.map((member) => (
                    <tr key={member.name}>
                      <td className="font-medium">{member.name}</td>
                      <td className="font-mono">{member.views}</td>
                      <td className="font-mono">{member.contacts}</td>
                      <td className="font-mono">{member.closedLoans}</td>
                      <td className="font-mono">{formatCurrency(member.revenue)}</td>
                      <td>
                        <Badge
                          variant={
                            (member.closedLoans / member.contacts) * 100 >= 10
                              ? 'success'
                              : 'secondary'
                          }
                        >
                          {((member.closedLoans / member.contacts) * 100).toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
