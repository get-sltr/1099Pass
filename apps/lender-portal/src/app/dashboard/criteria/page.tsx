'use client';

import { useState } from 'react';
import {
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useCriteriaStore, usStates } from '@/store';
import { formatCurrency, cn } from '@/lib/utils';

export default function CriteriaPage() {
  const { criteria, updateCriteria, resetCriteria } = useCriteriaStore();
  const [hasChanges, setHasChanges] = useState(false);

  const handleUpdate = (updates: Partial<typeof criteria>) => {
    updateCriteria(updates);
    setHasChanges(true);
  };

  const handleSave = () => {
    // In a real app, this would save to the backend
    setHasChanges(false);
  };

  const handleReset = () => {
    resetCriteria();
    setHasChanges(false);
  };

  const toggleIncomeSource = (source: string) => {
    const current = criteria.acceptedIncomeSources;
    const updated = current.includes(source)
      ? current.filter((s) => s !== source)
      : [...current, source];
    handleUpdate({ acceptedIncomeSources: updated });
  };

  const toggleState = (state: string) => {
    const current = criteria.targetStates;
    const updated = current.includes(state)
      ? current.filter((s) => s !== state)
      : [...current, state];
    handleUpdate({ targetStates: updated });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lending Criteria</h1>
          <p className="text-muted-foreground">
            Configure your preferences to receive matching borrower reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="warning" className="mr-2">
              Unsaved changes
            </Badge>
          )}
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="mr-2 h-4 w-4" />
            Save Criteria
          </Button>
        </div>
      </div>

      <Tabs defaultValue="income" className="space-y-6">
        <TabsList>
          <TabsTrigger value="income">Income Requirements</TabsTrigger>
          <TabsTrigger value="sources">Income Sources</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Income Requirements */}
        <TabsContent value="income" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Minimum Score</CardTitle>
                <CardDescription>
                  Set the minimum 1099Pass score required for matches
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Minimum Score: {criteria.minScore}</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Higher scores indicate more stable, verified income. Scores
                            above 80 are considered excellent.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Slider
                    value={[criteria.minScore]}
                    onValueChange={([value]) => handleUpdate({ minScore: value })}
                    min={0}
                    max={100}
                    step={5}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0 (All)</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-sm">
                    <span className="font-medium">Estimated matches:</span>{' '}
                    {criteria.minScore >= 80
                      ? '~150 reports/month'
                      : criteria.minScore >= 60
                      ? '~450 reports/month'
                      : '~800 reports/month'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Income Range</CardTitle>
                <CardDescription>
                  Set the annual income range you're interested in
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Minimum Income</Label>
                    <Input
                      type="number"
                      value={criteria.minIncome}
                      onChange={(e) =>
                        handleUpdate({ minIncome: parseInt(e.target.value) || 0 })
                      }
                      placeholder="$0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Maximum Income</Label>
                    <Input
                      type="number"
                      value={criteria.maxIncome}
                      onChange={(e) =>
                        handleUpdate({ maxIncome: parseInt(e.target.value) || 500000 })
                      }
                      placeholder="No limit"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>
                    Range: {formatCurrency(criteria.minIncome)} -{' '}
                    {formatCurrency(criteria.maxIncome)}
                  </Label>
                  <Slider
                    value={[criteria.minIncome, criteria.maxIncome]}
                    onValueChange={([min, max]) =>
                      handleUpdate({ minIncome: min, maxIncome: max })
                    }
                    min={0}
                    max={500000}
                    step={10000}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Loan Types</CardTitle>
                <CardDescription>
                  Select the loan types you want to receive matches for
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mortgage"
                    checked={criteria.loanTypes.includes('mortgage')}
                    onCheckedChange={(checked) => {
                      const types = checked
                        ? [...criteria.loanTypes, 'mortgage']
                        : criteria.loanTypes.filter((t) => t !== 'mortgage');
                      handleUpdate({ loanTypes: types });
                    }}
                  />
                  <Label htmlFor="mortgage" className="cursor-pointer">
                    Mortgage / Home Loans
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="auto"
                    checked={criteria.loanTypes.includes('auto')}
                    onCheckedChange={(checked) => {
                      const types = checked
                        ? [...criteria.loanTypes, 'auto']
                        : criteria.loanTypes.filter((t) => t !== 'auto');
                      handleUpdate({ loanTypes: types });
                    }}
                  />
                  <Label htmlFor="auto" className="cursor-pointer">
                    Auto Loans
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="personal"
                    checked={criteria.loanTypes.includes('personal')}
                    onCheckedChange={(checked) => {
                      const types = checked
                        ? [...criteria.loanTypes, 'personal']
                        : criteria.loanTypes.filter((t) => t !== 'personal');
                      handleUpdate({ loanTypes: types });
                    }}
                  />
                  <Label htmlFor="personal" className="cursor-pointer">
                    Personal Loans
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="business"
                    checked={criteria.loanTypes.includes('business')}
                    onCheckedChange={(checked) => {
                      const types = checked
                        ? [...criteria.loanTypes, 'business']
                        : criteria.loanTypes.filter((t) => t !== 'business');
                      handleUpdate({ loanTypes: types });
                    }}
                  />
                  <Label htmlFor="business" className="cursor-pointer">
                    Small Business Loans
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Income Stability</CardTitle>
                <CardDescription>
                  Minimum requirements for income history
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Minimum Years Active</Label>
                  <Select
                    value={criteria.minYearsActive.toString()}
                    onValueChange={(value) =>
                      handleUpdate({ minYearsActive: parseFloat(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No minimum</SelectItem>
                      <SelectItem value="0.5">6 months</SelectItem>
                      <SelectItem value="1">1 year</SelectItem>
                      <SelectItem value="2">2 years</SelectItem>
                      <SelectItem value="3">3 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Minimum Income Sources</Label>
                  <Select
                    value={criteria.minIncomeSources.toString()}
                    onValueChange={(value) =>
                      handleUpdate({ minIncomeSources: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 source</SelectItem>
                      <SelectItem value="2">2 sources</SelectItem>
                      <SelectItem value="3">3 sources</SelectItem>
                      <SelectItem value="4">4+ sources</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verified-only"
                    checked={criteria.verifiedOnly}
                    onCheckedChange={(checked) =>
                      handleUpdate({ verifiedOnly: checked as boolean })
                    }
                  />
                  <Label htmlFor="verified-only" className="cursor-pointer">
                    Only show verified reports
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Income Sources */}
        <TabsContent value="sources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Accepted Income Sources</CardTitle>
              <CardDescription>
                Select which gig economy platforms and income sources you accept
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label className="mb-3 block">Rideshare & Delivery</Label>
                  <div className="flex flex-wrap gap-2">
                    {['Uber', 'Lyft', 'DoorDash', 'Grubhub', 'Instacart', 'Amazon Flex'].map(
                      (source) => (
                        <Badge
                          key={source}
                          variant={
                            criteria.acceptedIncomeSources.includes(source)
                              ? 'default'
                              : 'outline'
                          }
                          className="cursor-pointer px-3 py-1"
                          onClick={() => toggleIncomeSource(source)}
                        >
                          {source}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
                <div>
                  <Label className="mb-3 block">Freelance & Creative</Label>
                  <div className="flex flex-wrap gap-2">
                    {['Upwork', 'Fiverr', 'Freelance', 'Etsy', 'Shopify'].map((source) => (
                      <Badge
                        key={source}
                        variant={
                          criteria.acceptedIncomeSources.includes(source)
                            ? 'default'
                            : 'outline'
                        }
                        className="cursor-pointer px-3 py-1"
                        onClick={() => toggleIncomeSource(source)}
                      >
                        {source}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="mb-3 block">Professional Services</Label>
                  <div className="flex flex-wrap gap-2">
                    {['TaskRabbit', 'Thumbtack', 'Rover', 'Care.com', 'Consulting'].map(
                      (source) => (
                        <Badge
                          key={source}
                          variant={
                            criteria.acceptedIncomeSources.includes(source)
                              ? 'default'
                              : 'outline'
                          }
                          className="cursor-pointer px-3 py-1"
                          onClick={() => toggleIncomeSource(source)}
                        >
                          {source}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
                <div>
                  <Label className="mb-3 block">Other</Label>
                  <div className="flex flex-wrap gap-2">
                    {['Airbnb', 'Turo', 'YouTube', 'Twitch', 'Patreon', 'Other'].map(
                      (source) => (
                        <Badge
                          key={source}
                          variant={
                            criteria.acceptedIncomeSources.includes(source)
                              ? 'default'
                              : 'outline'
                          }
                          className="cursor-pointer px-3 py-1"
                          onClick={() => toggleIncomeSource(source)}
                        >
                          {source}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleUpdate({
                        acceptedIncomeSources: [
                          'Uber',
                          'Lyft',
                          'DoorDash',
                          'Grubhub',
                          'Instacart',
                          'Amazon Flex',
                          'Upwork',
                          'Fiverr',
                          'Freelance',
                          'Etsy',
                          'Shopify',
                          'TaskRabbit',
                          'Thumbtack',
                          'Rover',
                          'Care.com',
                          'Consulting',
                          'Airbnb',
                          'Turo',
                          'YouTube',
                          'Twitch',
                          'Patreon',
                          'Other',
                        ],
                      })
                    }
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdate({ acceptedIncomeSources: [] })}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geography */}
        <TabsContent value="geography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Target States</CardTitle>
              <CardDescription>
                Select the states where you're licensed to lend
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {usStates.map((state) => (
                    <Badge
                      key={state.value}
                      variant={
                        criteria.targetStates.includes(state.value)
                          ? 'default'
                          : 'outline'
                      }
                      className="cursor-pointer px-3 py-1"
                      onClick={() => toggleState(state.value)}
                    >
                      {state.value}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleUpdate({
                        targetStates: usStates.map((s) => s.value),
                      })
                    }
                  >
                    Select All States
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdate({ targetStates: [] })}
                  >
                    Clear All
                  </Button>
                </div>
                <div className="p-3 rounded-lg bg-muted mt-4">
                  <p className="text-sm">
                    <span className="font-medium">Selected:</span>{' '}
                    {criteria.targetStates.length === 0
                      ? 'None (no matches will be shown)'
                      : criteria.targetStates.length === usStates.length
                      ? 'All states'
                      : `${criteria.targetStates.length} state${
                          criteria.targetStates.length !== 1 ? 's' : ''
                        }`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notification Preferences</CardTitle>
              <CardDescription>
                Configure how you receive alerts about new matches
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="email-alerts" defaultChecked />
                <Label htmlFor="email-alerts" className="cursor-pointer">
                  Email alerts for new matches
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="daily-digest" defaultChecked />
                <Label htmlFor="daily-digest" className="cursor-pointer">
                  Daily digest summary
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="high-score-alerts" defaultChecked />
                <Label htmlFor="high-score-alerts" className="cursor-pointer">
                  Instant alerts for high-score matches (80+)
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Auto-Actions</CardTitle>
              <CardDescription>
                Automatically perform actions on matching reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="auto-shortlist" />
                <Label htmlFor="auto-shortlist" className="cursor-pointer">
                  Auto-add high-score matches to shortlist
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="auto-message" />
                <Label htmlFor="auto-message" className="cursor-pointer">
                  Send automatic interest message for score 90+
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Status Bar */}
      <Card className={cn('border-2', hasChanges ? 'border-warning' : 'border-positive')}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasChanges ? (
                <>
                  <AlertCircle className="h-5 w-5 text-warning" />
                  <span className="font-medium">You have unsaved changes</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 text-positive" />
                  <span className="font-medium">Criteria saved and active</span>
                </>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Matching ~{criteria.minScore >= 80 ? '150' : criteria.minScore >= 60 ? '450' : '800'}{' '}
              reports per month
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
