'use client';

import { useState } from 'react';
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Archive,
  Trash2,
  Star,
  StarOff,
  CheckCheck,
  Clock,
  FileText,
  User,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge, ScoreBadge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn, anonymizeBorrowerId, formatCurrency } from '@/lib/utils';

// Mock conversations
const mockConversations = [
  {
    id: '1',
    borrowerId: 'brw-a1b2c3d4',
    score: 85,
    income: 72500,
    lastMessage: 'Thank you for your interest! I would like to learn more about your mortgage options.',
    timestamp: '10 min ago',
    unread: true,
    starred: true,
  },
  {
    id: '2',
    borrowerId: 'brw-e5f6g7h8',
    score: 78,
    income: 58200,
    lastMessage: 'What documents would I need to provide for the application?',
    timestamp: '1 hour ago',
    unread: true,
    starred: false,
  },
  {
    id: '3',
    borrowerId: 'brw-i9j0k1l2',
    score: 72,
    income: 45800,
    lastMessage: 'Yes, I am currently looking at properties in the $350-400k range.',
    timestamp: '3 hours ago',
    unread: false,
    starred: false,
  },
  {
    id: '4',
    borrowerId: 'brw-m3n4o5p6',
    score: 68,
    income: 62100,
    lastMessage: 'I appreciate the quick response. Let me review the terms.',
    timestamp: 'Yesterday',
    unread: false,
    starred: true,
  },
  {
    id: '5',
    borrowerId: 'brw-q7r8s9t0',
    score: 91,
    income: 95400,
    lastMessage: 'Great! I would like to schedule a call to discuss further.',
    timestamp: '2 days ago',
    unread: false,
    starred: false,
  },
];

// Mock messages for selected conversation
const mockMessages = [
  {
    id: '1',
    senderId: 'lender',
    content: 'Hello! I noticed your income profile on 1099Pass and I think you might be a great fit for our mortgage products. Would you like to learn more?',
    timestamp: '2024-01-15 10:30 AM',
    read: true,
  },
  {
    id: '2',
    senderId: 'borrower',
    content: 'Hi! Yes, I am interested in exploring mortgage options. I have been working as a gig worker for 2.5 years now.',
    timestamp: '2024-01-15 10:45 AM',
    read: true,
  },
  {
    id: '3',
    senderId: 'lender',
    content: 'That is great to hear! Based on your verified income of $72,500 annually and your score of 85, you would qualify for several of our programs. We offer competitive rates for 1099 workers.',
    timestamp: '2024-01-15 11:00 AM',
    read: true,
  },
  {
    id: '4',
    senderId: 'borrower',
    content: 'That sounds promising! What would the typical down payment requirement be?',
    timestamp: '2024-01-15 11:15 AM',
    read: true,
  },
  {
    id: '5',
    senderId: 'lender',
    content: 'For borrowers with your profile, we typically require 10-20% down depending on the loan amount. We also have some programs with as low as 5% down for well-qualified applicants.',
    timestamp: '2024-01-15 11:30 AM',
    read: true,
  },
  {
    id: '6',
    senderId: 'borrower',
    content: 'Thank you for your interest! I would like to learn more about your mortgage options.',
    timestamp: '2024-01-15 11:45 AM',
    read: false,
  },
];

const messageTemplates = [
  {
    id: '1',
    name: 'Initial Interest',
    content: 'Hello! I noticed your income profile on 1099Pass and I think you might be a great fit for our loan products. Would you like to learn more?',
  },
  {
    id: '2',
    name: 'Rate Quote',
    content: 'Based on your profile, you may qualify for rates starting at [RATE]. Would you like me to provide a detailed quote?',
  },
  {
    id: '3',
    name: 'Document Request',
    content: 'To proceed with your application, we would need the following documents: 1) Last 2 years of tax returns, 2) Bank statements for the last 3 months, 3) Proof of identity.',
  },
  {
    id: '4',
    name: 'Follow Up',
    content: 'Just following up on our conversation. Please let me know if you have any questions or would like to proceed with an application.',
  },
];

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  const filteredConversations = mockConversations.filter((conv) =>
    conv.borrowerId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // In a real app, this would send to the backend
      setMessageInput('');
    }
  };

  const handleTemplateSelect = (template: typeof messageTemplates[0]) => {
    setMessageInput(template.content);
    setShowTemplates(false);
  };

  return (
    <div className="h-[calc(100vh-10rem)]">
      <div className="flex h-full gap-6">
        {/* Conversations List */}
        <Card className="w-96 shrink-0 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Messages</CardTitle>
              <Badge variant="secondary">
                {mockConversations.filter((c) => c.unread).length} unread
              </Badge>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-0">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
                <TabsTrigger value="starred">Starred</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="m-0">
                <div className="divide-y">
                  {filteredConversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={cn(
                        'flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors',
                        selectedConversation.id === conv.id && 'bg-muted',
                        conv.unread && 'bg-accent/5'
                      )}
                      onClick={() => setSelectedConversation(conv)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-accent/10 text-accent">
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={cn('font-mono text-sm', conv.unread && 'font-semibold')}>
                            {anonymizeBorrowerId(conv.borrowerId)}
                          </span>
                          <div className="flex items-center gap-1">
                            {conv.starred && (
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            )}
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {conv.timestamp}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <ScoreBadge score={conv.score} size="sm" />
                          <span className="text-xs text-muted-foreground">
                            {formatCurrency(conv.income)}
                          </span>
                        </div>
                        <p className={cn(
                          'text-sm mt-1 truncate',
                          conv.unread ? 'text-foreground' : 'text-muted-foreground'
                        )}>
                          {conv.lastMessage}
                        </p>
                      </div>
                      {conv.unread && (
                        <div className="h-2 w-2 rounded-full bg-accent shrink-0 mt-2" />
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="unread" className="m-0">
                <div className="divide-y">
                  {filteredConversations
                    .filter((c) => c.unread)
                    .map((conv) => (
                      <div
                        key={conv.id}
                        className={cn(
                          'flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors bg-accent/5',
                          selectedConversation.id === conv.id && 'bg-muted'
                        )}
                        onClick={() => setSelectedConversation(conv)}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-accent/10 text-accent">
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-sm font-semibold">
                              {anonymizeBorrowerId(conv.borrowerId)}
                            </span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {conv.timestamp}
                            </span>
                          </div>
                          <p className="text-sm mt-1 truncate">{conv.lastMessage}</p>
                        </div>
                        <div className="h-2 w-2 rounded-full bg-accent shrink-0 mt-2" />
                      </div>
                    ))}
                </div>
              </TabsContent>
              <TabsContent value="starred" className="m-0">
                <div className="divide-y">
                  {filteredConversations
                    .filter((c) => c.starred)
                    .map((conv) => (
                      <div
                        key={conv.id}
                        className={cn(
                          'flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors',
                          selectedConversation.id === conv.id && 'bg-muted'
                        )}
                        onClick={() => setSelectedConversation(conv)}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-accent/10 text-accent">
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-sm">
                              {anonymizeBorrowerId(conv.borrowerId)}
                            </span>
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 truncate">
                            {conv.lastMessage}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col">
          {/* Chat Header */}
          <CardHeader className="border-b py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-accent/10 text-accent">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium">
                      {anonymizeBorrowerId(selectedConversation.borrowerId)}
                    </span>
                    <ScoreBadge score={selectedConversation.score} size="sm" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(selectedConversation.income)} annual income
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  View Report
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      {selectedConversation.starred ? (
                        <>
                          <StarOff className="mr-2 h-4 w-4" />
                          Remove star
                        </>
                      ) : (
                        <>
                          <Star className="mr-2 h-4 w-4" />
                          Star conversation
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Archive className="mr-2 h-4 w-4" />
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-negative">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 overflow-auto p-4 space-y-4">
            {mockMessages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.senderId === 'lender' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[70%] rounded-lg px-4 py-2',
                    message.senderId === 'lender'
                      ? 'bg-accent text-white'
                      : 'bg-muted'
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  <div
                    className={cn(
                      'flex items-center gap-1 mt-1',
                      message.senderId === 'lender' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <span
                      className={cn(
                        'text-xs',
                        message.senderId === 'lender'
                          ? 'text-white/70'
                          : 'text-muted-foreground'
                      )}
                    >
                      {message.timestamp.split(' ').slice(1).join(' ')}
                    </span>
                    {message.senderId === 'lender' && (
                      message.read ? (
                        <CheckCheck className="h-3 w-3 text-white/70" />
                      ) : (
                        <Clock className="h-3 w-3 text-white/70" />
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>

          {/* Message Input */}
          <div className="border-t p-4">
            {showTemplates && (
              <div className="mb-3 p-3 rounded-lg border bg-muted/50">
                <p className="text-sm font-medium mb-2">Quick Templates</p>
                <div className="flex flex-wrap gap-2">
                  {messageTemplates.map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      {template.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <textarea
                  className="w-full min-h-[80px] rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowTemplates(!showTemplates)}
                >
                  <FileText className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
