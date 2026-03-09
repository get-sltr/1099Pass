'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Save,
  Building2,
  User,
  Bell,
  Shield,
  CreditCard,
  Check,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/store';
import { formatCurrency, cn } from '@/lib/utils';
import { SquarePaymentForm } from '@/components/billing/square-payment-form';

const SQUARE_APP_ID = process.env.NEXT_PUBLIC_SQUARE_APP_ID || '';
const SQUARE_LOCATION_ID = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || '';

const subscriptionPlans = [
  {
    id: 'PRO',
    name: 'Monthly Pro',
    price: 49.99,
    priceHidden: false,
    features: [
      '500 report views/month',
      '150 borrower contacts/month',
      '5 team members',
      'Advanced analytics',
      'Priority support',
    ],
  },
  {
    id: 'ULTRA',
    name: 'Monthly Ultra',
    price: 499,
    priceHidden: true,
    features: [
      'Unlimited report views',
      'Unlimited contacts',
      'Unlimited team members',
      'Custom integrations',
      'Dedicated support',
      'API access',
    ],
  },
];


interface ActiveSubscription {
  subscriptionId: string;
  tier: string;
  status: string;
  currentPeriodEnd?: string;
}

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [hasChanges, setHasChanges] = useState(false);

  // Profile form state
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');

  // Organization form state
  const [orgName, setOrgName] = useState(user?.institutionName || '');
  const [orgPhone, setOrgPhone] = useState('');
  const [orgWebsite, setOrgWebsite] = useState('');

  // Billing state
  const [activeSub, setActiveSub] = useState<ActiveSubscription | null>(null);
  const [subLoading, setSubLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof subscriptionPlans[0] | null>(null);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [cancellingSubscription, setCancellingSubscription] = useState(false);

  const fetchSubscription = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiUrl}/subscriptions/current`, { credentials: 'include' });
      const json = await res.json();
      setActiveSub(json.data ?? null);
    } catch {
      setActiveSub(null);
    } finally {
      setSubLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubscription(); }, [fetchSubscription]);

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;
    setCancellingSubscription(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiUrl}/subscriptions/cancel`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        setActiveSub(null);
      }
    } catch {
      setBillingError('Failed to cancel subscription');
    } finally {
      setCancellingSubscription(false);
    }
  };

  const handleSave = () => {
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and organization settings
          </p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        )}
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and profile picture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback className="bg-accent text-white text-xl">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    Change Photo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    JPG, PNG or GIF. Max 2MB.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input value={user?.role || ''} disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization Tab */}
        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Organization Details
              </CardTitle>
              <CardDescription>
                Information displayed to borrowers when you contact them
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Organization Name</Label>
                  <Input
                    value={orgName}
                    onChange={(e) => {
                      setOrgName(e.target.value);
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    value={orgPhone}
                    onChange={(e) => {
                      setOrgPhone(e.target.value);
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Website</Label>
                  <Input
                    value={orgWebsite}
                    onChange={(e) => {
                      setOrgWebsite(e.target.value);
                      setHasChanges(true);
                    }}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <textarea
                    className="w-full min-h-[100px] rounded-md border bg-background px-3 py-2 text-sm"
                    placeholder="Tell borrowers about your organization..."
                    onChange={() => setHasChanges(true)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Licensing Information</CardTitle>
              <CardDescription>
                Your state licenses determine which borrowers you can contact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  No licenses configured yet. Add your state licenses to determine which borrowers you can contact.
                </p>
                <Button variant="outline" size="sm">
                  Add Licenses
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Email Notifications
              </CardTitle>
              <CardDescription>
                Choose what emails you'd like to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">New Matching Reports</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new reports match your criteria
                  </p>
                </div>
                <Checkbox defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">Daily Digest</p>
                  <p className="text-sm text-muted-foreground">
                    Summary of new matches and activity
                  </p>
                </div>
                <Checkbox defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">Borrower Messages</p>
                  <p className="text-sm text-muted-foreground">
                    Notifications when borrowers respond
                  </p>
                </div>
                <Checkbox defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">High-Score Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Instant alerts for borrowers with scores 90+
                  </p>
                </div>
                <Checkbox defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">Marketing & Updates</p>
                  <p className="text-sm text-muted-foreground">
                    Product updates and tips
                  </p>
                </div>
                <Checkbox />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Password
              </CardTitle>
              <CardDescription>Change your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input type="password" />
              </div>
              <Button>Update Password</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">2FA not configured</p>
                  <p className="text-sm text-muted-foreground">
                    Protect your account with two-factor authentication
                  </p>
                </div>
                <Button variant="outline">Enable 2FA</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          {subLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Current Plan */}
              {activeSub && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Current Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-accent/5 border border-accent/20">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold">
                            {subscriptionPlans.find((p) => p.id === activeSub.tier)?.name ?? activeSub.tier}
                          </h3>
                          <Badge variant="success">{activeSub.status}</Badge>
                        </div>
                        <p className="text-muted-foreground">
                          {formatCurrency(
                            subscriptionPlans.find((p) => p.id === activeSub.tier)?.price ?? 0,
                            { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                          )}
                          /month
                          {activeSub.currentPeriodEnd &&
                            ` • Renews ${new Date(activeSub.currentPeriodEnd).toLocaleDateString()}`}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleCancelSubscription}
                        disabled={cancellingSubscription}
                      >
                        {cancellingSubscription ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cancelling...</>
                        ) : (
                          'Cancel Plan'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {billingError && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                  {billingError}
                </div>
              )}

              {/* Available Plans */}
              <div className="grid gap-4 md:grid-cols-2 max-w-3xl mx-auto">
                {subscriptionPlans.map((plan) => {
                  const isCurrent = activeSub?.tier === plan.id;
                  const isUltra = plan.id === 'ULTRA';
                  return (
                    <Card
                      key={plan.id}
                      className={cn(
                        isCurrent && 'border-accent border-2',
                        isUltra && 'relative overflow-hidden',
                      )}
                    >
                      {isUltra && (
                        <div className="absolute top-3 right-3">
                          <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                          {isCurrent && <Badge>Current</Badge>}
                        </div>
                        <div className="mt-2">
                          {plan.priceHidden ? (
                            <span className="text-2xl font-bold text-muted-foreground">
                              Contact Sales
                            </span>
                          ) : (
                            <>
                              <span className="text-3xl font-bold">
                                {formatCurrency(plan.price, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                              <span className="text-muted-foreground">/month</span>
                            </>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {plan.features.map((feature) => (
                            <li
                              key={feature}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Check className="h-4 w-4 text-positive" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        {plan.priceHidden ? (
                          <Button className="w-full mt-4" variant="outline" disabled>
                            Contact Sales
                          </Button>
                        ) : (
                          <Button
                            className="w-full mt-4"
                            variant={isCurrent ? 'outline' : 'default'}
                            disabled={isCurrent || !SQUARE_APP_ID}
                            onClick={() => {
                              setSelectedPlan(plan);
                              setBillingError(null);
                              setPaymentDialogOpen(true);
                            }}
                          >
                            {isCurrent
                              ? 'Current Plan'
                              : activeSub
                                ? 'Switch Plan'
                                : 'Subscribe'}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {!SQUARE_APP_ID && (
                <p className="text-xs text-center text-muted-foreground">
                  Payment processing is not configured yet. Set NEXT_PUBLIC_SQUARE_APP_ID
                  and NEXT_PUBLIC_SQUARE_LOCATION_ID in your environment.
                </p>
              )}

              <p className="text-xs text-center text-muted-foreground">
                Payments processed securely by Square. Subscriptions renew monthly and
                can be cancelled any time.
              </p>
            </>
          )}

          {/* Square Payment Dialog */}
          <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Subscribe to {selectedPlan?.name}</DialogTitle>
              </DialogHeader>
              {selectedPlan && SQUARE_APP_ID && SQUARE_LOCATION_ID && (
                <SquarePaymentForm
                  applicationId={SQUARE_APP_ID}
                  locationId={SQUARE_LOCATION_ID}
                  planId={selectedPlan.id}
                  planName={selectedPlan.name}
                  priceLabel={formatCurrency(selectedPlan.price)}
                  onSuccess={(data) => {
                    setPaymentDialogOpen(false);
                    setActiveSub({
                      subscriptionId: data.subscriptionId,
                      tier: data.tier || selectedPlan.id,
                      status: 'ACTIVE',
                    });
                  }}
                  onError={(msg) => {
                    setBillingError(msg);
                    setPaymentDialogOpen(false);
                  }}
                  onCancel={() => setPaymentDialogOpen(false)}
                />
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
