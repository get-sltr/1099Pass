'use client';

import { useState } from 'react';
import {
  Search,
  MoreVertical,
  Mail,
  Shield,
  Trash2,
  Edit,
  UserPlus,
  Users,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store';
import { cn } from '@/lib/utils';

// Mock team data
const mockTeamMembers = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@quickmortgage.com',
    role: 'admin' as const,
    status: 'active' as const,
    lastActive: '2 min ago',
    reportsViewed: 245,
    contactsMade: 48,
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@quickmortgage.com',
    role: 'loan_officer' as const,
    status: 'active' as const,
    lastActive: '15 min ago',
    reportsViewed: 198,
    contactsMade: 42,
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Davis',
    email: 'mike.davis@quickmortgage.com',
    role: 'loan_officer' as const,
    status: 'active' as const,
    lastActive: '1 hour ago',
    reportsViewed: 167,
    contactsMade: 35,
  },
  {
    id: '4',
    firstName: 'Emily',
    lastName: 'Brown',
    email: 'emily.brown@quickmortgage.com',
    role: 'underwriter' as const,
    status: 'inactive' as const,
    lastActive: '3 days ago',
    reportsViewed: 142,
    contactsMade: 28,
  },
];

const mockInvitations = [
  {
    id: '1',
    email: 'alex.wilson@quickmortgage.com',
    role: 'loan_officer',
    invitedAt: '2024-01-14',
    status: 'pending',
  },
  {
    id: '2',
    email: 'jennifer.lee@quickmortgage.com',
    role: 'underwriter',
    invitedAt: '2024-01-12',
    status: 'expired',
  },
];

const roleLabels = {
  admin: 'Admin',
  loan_officer: 'Loan Officer',
  underwriter: 'Underwriter',
};

const roleDescriptions = {
  admin: 'Full access to all features, team management, and billing',
  loan_officer: 'View reports, contact borrowers, manage personal criteria',
  underwriter: 'View reports and verification details, read-only access',
};

export default function TeamPage() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('loan_officer');

  const filteredMembers = mockTeamMembers.filter(
    (member) =>
      member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvite = () => {
    // In a real app, this would send the invitation
    setShowInviteDialog(false);
    setInviteEmail('');
    setInviteRole('loan_officer');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">
            Manage your organization's team members and permissions
          </p>
        </div>
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Team Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to join your organization on 1099Pass.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="loan_officer">Loan Officer</SelectItem>
                    <SelectItem value="underwriter">Underwriter</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {roleDescriptions[inviteRole as keyof typeof roleDescriptions]}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleInvite} disabled={!inviteEmail}>
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold">{mockTeamMembers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-positive/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-positive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">
                  {mockTeamMembers.filter((m) => m.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Invites</p>
                <p className="text-2xl font-bold">
                  {mockInvitations.filter((i) => i.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="invitations">Pending Invitations</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>

        {/* Team Members */}
        <TabsContent value="members" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="loan_officer">Loan Officers</SelectItem>
                <SelectItem value="underwriter">Underwriters</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Active</th>
                    <th>Activity</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr key={member.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-accent/10 text-accent text-xs">
                              {member.firstName[0]}
                              {member.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {member.firstName} {member.lastName}
                              {member.id === user?.id && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  You
                                </Badge>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge
                          variant={member.role === 'admin' ? 'default' : 'secondary'}
                        >
                          {roleLabels[member.role]}
                        </Badge>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              'h-2 w-2 rounded-full',
                              member.status === 'active'
                                ? 'bg-positive'
                                : 'bg-muted-foreground'
                            )}
                          />
                          <span className="capitalize">{member.status}</span>
                        </div>
                      </td>
                      <td className="text-muted-foreground">{member.lastActive}</td>
                      <td>
                        <div className="text-sm">
                          <span className="font-mono">{member.reportsViewed}</span>{' '}
                          views,{' '}
                          <span className="font-mono">{member.contactsMade}</span>{' '}
                          contacts
                        </div>
                      </td>
                      <td>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Shield className="mr-2 h-4 w-4" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-negative">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Invitations */}
        <TabsContent value="invitations" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {mockInvitations.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Invited</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockInvitations.map((invite) => (
                      <tr key={invite.id}>
                        <td className="font-medium">{invite.email}</td>
                        <td>
                          <Badge variant="secondary">
                            {roleLabels[invite.role as keyof typeof roleLabels]}
                          </Badge>
                        </td>
                        <td className="text-muted-foreground">{invite.invitedAt}</td>
                        <td>
                          <Badge
                            variant={
                              invite.status === 'pending' ? 'warning' : 'secondary'
                            }
                          >
                            {invite.status}
                          </Badge>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              Resend
                            </Button>
                            <Button variant="ghost" size="sm">
                              <XCircle className="h-4 w-4 text-negative" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center">
                  <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pending invitations</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles & Permissions */}
        <TabsContent value="roles" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(roleLabels).map(([role, label]) => (
              <Card key={role}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    {label}
                  </CardTitle>
                  <CardDescription>
                    {roleDescriptions[role as keyof typeof roleDescriptions]}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {role === 'admin' && (
                      <>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-positive" />
                          Manage team members
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-positive" />
                          Access billing & subscription
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-positive" />
                          Configure organization settings
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-positive" />
                          View all reports & analytics
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-positive" />
                          Contact borrowers
                        </li>
                      </>
                    )}
                    {role === 'loan_officer' && (
                      <>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-positive" />
                          View borrower reports
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-positive" />
                          Contact borrowers
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-positive" />
                          Manage personal criteria
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-positive" />
                          View own analytics
                        </li>
                        <li className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-negative" />
                          Team management
                        </li>
                      </>
                    )}
                    {role === 'underwriter' && (
                      <>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-positive" />
                          View borrower reports
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-positive" />
                          View verification details
                        </li>
                        <li className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-negative" />
                          Contact borrowers
                        </li>
                        <li className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-negative" />
                          Manage criteria
                        </li>
                        <li className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-negative" />
                          Team management
                        </li>
                      </>
                    )}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
