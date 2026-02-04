'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Download,
  Star,
  StarOff,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Save,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge, ScoreBadge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useReportsStore } from '@/store';
import { formatCurrency, anonymizeBorrowerId } from '@/lib/utils';

// Mock data for reports
const mockReports = [
  {
    id: 'brw-a1b2c3d4',
    score: 85,
    income: 72500,
    sources: 3,
    primarySource: 'Uber',
    loanType: 'mortgage',
    state: 'CA',
    yearsActive: 2.5,
    trend: 'growing' as const,
    lastUpdated: '2024-01-15',
    verified: true,
  },
  {
    id: 'brw-e5f6g7h8',
    score: 78,
    income: 58200,
    sources: 2,
    primarySource: 'DoorDash',
    loanType: 'auto',
    state: 'TX',
    yearsActive: 1.8,
    trend: 'stable' as const,
    lastUpdated: '2024-01-14',
    verified: true,
  },
  {
    id: 'brw-i9j0k1l2',
    score: 72,
    income: 45800,
    sources: 4,
    primarySource: 'Freelance',
    loanType: 'mortgage',
    state: 'FL',
    yearsActive: 3.2,
    trend: 'growing' as const,
    lastUpdated: '2024-01-14',
    verified: true,
  },
  {
    id: 'brw-m3n4o5p6',
    score: 68,
    income: 62100,
    sources: 2,
    primarySource: 'Lyft',
    loanType: 'personal',
    state: 'NY',
    yearsActive: 1.2,
    trend: 'declining' as const,
    lastUpdated: '2024-01-13',
    verified: false,
  },
  {
    id: 'brw-q7r8s9t0',
    score: 91,
    income: 95400,
    sources: 5,
    primarySource: 'Multiple',
    loanType: 'mortgage',
    state: 'WA',
    yearsActive: 4.1,
    trend: 'growing' as const,
    lastUpdated: '2024-01-13',
    verified: true,
  },
  {
    id: 'brw-u1v2w3x4',
    score: 65,
    income: 38900,
    sources: 1,
    primarySource: 'Instacart',
    loanType: 'auto',
    state: 'AZ',
    yearsActive: 0.8,
    trend: 'stable' as const,
    lastUpdated: '2024-01-12',
    verified: true,
  },
  {
    id: 'brw-y5z6a7b8',
    score: 82,
    income: 67300,
    sources: 3,
    primarySource: 'Etsy',
    loanType: 'mortgage',
    state: 'OR',
    yearsActive: 2.9,
    trend: 'growing' as const,
    lastUpdated: '2024-01-12',
    verified: true,
  },
  {
    id: 'brw-c9d0e1f2',
    score: 74,
    income: 51600,
    sources: 2,
    primarySource: 'Uber',
    loanType: 'personal',
    state: 'CO',
    yearsActive: 1.5,
    trend: 'stable' as const,
    lastUpdated: '2024-01-11',
    verified: true,
  },
];

const incomeSourceOptions = [
  'Uber',
  'Lyft',
  'DoorDash',
  'Instacart',
  'Etsy',
  'Freelance',
  'Multiple',
];

const stateOptions = ['CA', 'TX', 'FL', 'NY', 'WA', 'AZ', 'OR', 'CO'];

const savedSearches = [
  { id: '1', name: 'High Score Mortgage', count: 23 },
  { id: '2', name: 'CA Borrowers', count: 15 },
  { id: '3', name: 'Growing Income', count: 42 },
];

export default function ReportsPage() {
  const router = useRouter();
  const { shortlist, addToShortlist, removeFromShortlist, isInShortlist } =
    useReportsStore();

  // Filter state
  const [showFilters, setShowFilters] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreRange, setScoreRange] = useState([0, 100]);
  const [incomeRange, setIncomeRange] = useState([0, 200000]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedLoanType, setSelectedLoanType] = useState<string>('all');
  const [selectedTrend, setSelectedTrend] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Sort state
  const [sortField, setSortField] = useState<string>('score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter reports
  const filteredReports = useMemo(() => {
    return mockReports.filter((report) => {
      if (searchQuery && !report.id.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (report.score < scoreRange[0] || report.score > scoreRange[1]) {
        return false;
      }
      if (report.income < incomeRange[0] || report.income > incomeRange[1]) {
        return false;
      }
      if (selectedSources.length > 0 && !selectedSources.includes(report.primarySource)) {
        return false;
      }
      if (selectedStates.length > 0 && !selectedStates.includes(report.state)) {
        return false;
      }
      if (selectedLoanType !== 'all' && report.loanType !== selectedLoanType) {
        return false;
      }
      if (selectedTrend !== 'all' && report.trend !== selectedTrend) {
        return false;
      }
      if (verifiedOnly && !report.verified) {
        return false;
      }
      return true;
    });
  }, [
    searchQuery,
    scoreRange,
    incomeRange,
    selectedSources,
    selectedStates,
    selectedLoanType,
    selectedTrend,
    verifiedOnly,
  ]);

  // Sort reports
  const sortedReports = useMemo(() => {
    return [...filteredReports].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'score':
          comparison = a.score - b.score;
          break;
        case 'income':
          comparison = a.income - b.income;
          break;
        case 'sources':
          comparison = a.sources - b.sources;
          break;
        case 'yearsActive':
          comparison = a.yearsActive - b.yearsActive;
          break;
        default:
          comparison = 0;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredReports, sortField, sortDirection]);

  // Paginate
  const paginatedReports = sortedReports.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(sortedReports.length / pageSize);

  const clearFilters = () => {
    setSearchQuery('');
    setScoreRange([0, 100]);
    setIncomeRange([0, 200000]);
    setSelectedSources([]);
    setSelectedStates([]);
    setSelectedLoanType('all');
    setSelectedTrend('all');
    setVerifiedOnly(false);
  };

  const toggleSource = (source: string) => {
    setSelectedSources((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
    );
  };

  const toggleState = (state: string) => {
    setSelectedStates((prev) =>
      prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]
    );
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const toggleShortlist = (reportId: string) => {
    if (isInShortlist(reportId)) {
      removeFromShortlist(reportId);
    } else {
      addToShortlist(reportId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Borrower Reports</h1>
          <p className="text-muted-foreground">
            Browse and filter verified income reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filter Panel */}
        {showFilters && (
          <Card className="w-72 shrink-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search */}
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Borrower ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Score Range */}
              <div className="space-y-2">
                <Label>
                  Score Range: {scoreRange[0]} - {scoreRange[1]}
                </Label>
                <Slider
                  value={scoreRange}
                  onValueChange={setScoreRange}
                  min={0}
                  max={100}
                  step={5}
                />
              </div>

              {/* Income Range */}
              <div className="space-y-2">
                <Label>
                  Annual Income: {formatCurrency(incomeRange[0])} -{' '}
                  {formatCurrency(incomeRange[1])}
                </Label>
                <Slider
                  value={incomeRange}
                  onValueChange={setIncomeRange}
                  min={0}
                  max={200000}
                  step={5000}
                />
              </div>

              {/* Loan Type */}
              <div className="space-y-2">
                <Label>Loan Type</Label>
                <Select value={selectedLoanType} onValueChange={setSelectedLoanType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="mortgage">Mortgage</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Income Sources */}
              <div className="space-y-2">
                <Label>Income Sources</Label>
                <div className="flex flex-wrap gap-1">
                  {incomeSourceOptions.map((source) => (
                    <Badge
                      key={source}
                      variant={selectedSources.includes(source) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleSource(source)}
                    >
                      {source}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* States */}
              <div className="space-y-2">
                <Label>States</Label>
                <div className="flex flex-wrap gap-1">
                  {stateOptions.map((state) => (
                    <Badge
                      key={state}
                      variant={selectedStates.includes(state) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleState(state)}
                    >
                      {state}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Trend */}
              <div className="space-y-2">
                <Label>Income Trend</Label>
                <Select value={selectedTrend} onValueChange={setSelectedTrend}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Trends</SelectItem>
                    <SelectItem value="growing">Growing</SelectItem>
                    <SelectItem value="stable">Stable</SelectItem>
                    <SelectItem value="declining">Declining</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Verified Only */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  checked={verifiedOnly}
                  onCheckedChange={(checked) => setVerifiedOnly(checked as boolean)}
                />
                <Label htmlFor="verified" className="cursor-pointer">
                  Verified reports only
                </Label>
              </div>

              {/* Saved Searches */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <Label>Saved Searches</Label>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Save className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Save Search</DialogTitle>
                        <DialogDescription>
                          Save your current filter settings for quick access later.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Search Name</Label>
                          <Input placeholder="e.g., High Score CA Borrowers" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Save Search</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="space-y-1">
                  {savedSearches.map((search) => (
                    <div
                      key={search.id}
                      className="flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer"
                    >
                      <span className="text-sm">{search.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {search.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        <div className="flex-1 space-y-4">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {paginatedReports.length} of {sortedReports.length} reports
            </p>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Sort by:</Label>
              <Select value={sortField} onValueChange={setSortField}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Score</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="sources">Sources</SelectItem>
                  <SelectItem value="yearsActive">Experience</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
                }
              >
                {sortDirection === 'desc' ? '↓' : '↑'}
              </Button>
            </div>
          </div>

          {/* Results Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="w-10"></th>
                      <th>Borrower ID</th>
                      <th
                        className="cursor-pointer hover:text-foreground"
                        onClick={() => handleSort('score')}
                      >
                        Score {sortField === 'score' && (sortDirection === 'desc' ? '↓' : '↑')}
                      </th>
                      <th
                        className="cursor-pointer hover:text-foreground"
                        onClick={() => handleSort('income')}
                      >
                        Annual Income{' '}
                        {sortField === 'income' && (sortDirection === 'desc' ? '↓' : '↑')}
                      </th>
                      <th>Primary Source</th>
                      <th>Loan Type</th>
                      <th>State</th>
                      <th>Trend</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedReports.map((report) => (
                      <tr
                        key={report.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/dashboard/reports/${report.id}`)}
                      >
                        <td onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => toggleShortlist(report.id)}
                          >
                            {isInShortlist(report.id) ? (
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ) : (
                              <StarOff className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </td>
                        <td className="font-mono text-sm">
                          {anonymizeBorrowerId(report.id)}
                        </td>
                        <td>
                          <ScoreBadge score={report.score} />
                        </td>
                        <td className="font-mono">{formatCurrency(report.income)}</td>
                        <td>{report.primarySource}</td>
                        <td className="capitalize">{report.loanType}</td>
                        <td>{report.state}</td>
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
                        <td>
                          {report.verified ? (
                            <Badge variant="success">Verified</Badge>
                          ) : (
                            <Badge variant="warning">Pending</Badge>
                          )}
                        </td>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Shortlist Summary */}
          {shortlist.length > 0 && (
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">
                      {shortlist.length} report{shortlist.length !== 1 ? 's' : ''} in shortlist
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      View Shortlist
                    </Button>
                    <Button variant="outline" size="sm">
                      Contact All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
