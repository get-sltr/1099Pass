'use client';

import { useState } from 'react';
import {
  Search,
  Download,
  Star,
  SlidersHorizontal,
  Inbox,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useReportsStore } from '@/store';
import { formatCurrency } from '@/lib/utils';

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

export default function ReportsPage() {
  const { shortlist } = useReportsStore();

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
            </CardContent>
          </Card>
        )}

        {/* Results */}
        <div className="flex-1 space-y-4">
          {/* Empty State */}
          <Card>
            <CardContent className="p-0">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground mb-1">No borrower reports yet</p>
                <p className="text-muted-foreground max-w-md">
                  Borrower income packages will appear here when they are shared with you. Set your lending criteria to receive matched reports.
                </p>
              </div>
            </CardContent>
          </Card>

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
