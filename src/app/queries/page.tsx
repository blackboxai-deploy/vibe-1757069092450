'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Mail, Clock, CheckCircle, X, Plus, Settings, Send, Eye, Edit } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CustomerQuery {
  id: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  message: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
  lastUpdated: string;
  assignedTo?: string;
  autoResponseSent: boolean;
  followUpScheduled?: string;
}

interface AutoResponseTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  content: string;
  isActive: boolean;
  responseTime: number; // minutes
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  conditions: any[];
  actions: any[];
  isActive: boolean;
}

export default function CustomerQueriesPage() {
  const [queries, setQueries] = useState<CustomerQuery[]>([]);
  const [templates, setTemplates] = useState<AutoResponseTemplate[]>([]);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<CustomerQuery | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<AutoResponseTemplate>>({});
  const [newRule, setNewRule] = useState<Partial<AutomationRule>>({});

  useEffect(() => {
    loadQueries();
    loadTemplates();
    loadAutomationRules();
  }, []);

  const loadQueries = async () => {
    try {
      const response = await fetch('/api/queries');
      const data = await response.json();
      setQueries(data);
    } catch (error) {
      console.error('Failed to load queries:', error);
      setQueries(mockQueries);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/templates/auto-response');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
      setTemplates(mockTemplates);
    }
  };

  const loadAutomationRules = async () => {
    try {
      const response = await fetch('/api/automation-rules');
      const data = await response.json();
      setAutomationRules(data);
    } catch (error) {
      console.error('Failed to load automation rules:', error);
      setAutomationRules(mockRules);
    }
  };

  const handleSendAutoResponse = async (queryId: string, templateId: string) => {
    try {
      const response = await fetch('/api/queries/auto-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryId, templateId })
      });
      
      if (response.ok) {
        loadQueries();
        alert('Auto-response sent successfully!');
      }
    } catch (error) {
      console.error('Failed to send auto-response:', error);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const response = await fetch('/api/templates/auto-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate)
      });
      
      if (response.ok) {
        loadTemplates();
        setIsTemplateDialogOpen(false);
        setNewTemplate({});
      }
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  const handleCreateRule = async () => {
    try {
      const response = await fetch('/api/automation-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule)
      });
      
      if (response.ok) {
        loadAutomationRules();
        setIsRuleDialogOpen(false);
        setNewRule({});
      }
    } catch (error) {
      console.error('Failed to create rule:', error);
    }
  };

  const filteredQueries = queries.filter(query => {
    const matchesStatus = filterStatus === 'all' || query.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || query.category === filterCategory;
    const matchesSearch = query.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         query.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         query.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'in-progress': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const mockQueries: CustomerQuery[] = [
    {
      id: '1',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      subject: 'Product inquiry about pricing',
      message: 'I would like to know more about your premium plan pricing and features.',
      category: 'pricing',
      priority: 'medium',
      status: 'new',
      createdAt: '2024-01-15T10:30:00Z',
      lastUpdated: '2024-01-15T10:30:00Z',
      autoResponseSent: false
    },
    {
      id: '2',
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      subject: 'Technical support needed',
      message: 'I am experiencing issues with email delivery. Emails are not being sent.',
      category: 'technical',
      priority: 'high',
      status: 'in-progress',
      createdAt: '2024-01-15T09:15:00Z',
      lastUpdated: '2024-01-15T11:45:00Z',
      autoResponseSent: true,
      assignedTo: 'Support Team'
    }
  ];

  const mockTemplates: AutoResponseTemplate[] = [
    {
      id: '1',
      name: 'General Inquiry Response',
      category: 'general',
      subject: 'Thank you for contacting us',
      content: 'Dear {{customerName}},\n\nThank you for reaching out to us. We have received your inquiry and will get back to you within 24 hours.\n\nBest regards,\nCustomer Support Team',
      isActive: true,
      responseTime: 5
    },
    {
      id: '2',
      name: 'Technical Support Response',
      category: 'technical',
      subject: 'Technical Support - We\'re here to help',
      content: 'Dear {{customerName}},\n\nWe have received your technical support request. Our technical team is reviewing your issue and will provide a solution within 4 hours.\n\nTicket ID: {{queryId}}\n\nBest regards,\nTechnical Support Team',
      isActive: true,
      responseTime: 2
    }
  ];

  const mockRules: AutomationRule[] = [
    {
      id: '1',
      name: 'High Priority Auto-Response',
      trigger: 'query_received',
      conditions: [{ field: 'priority', operator: 'equals', value: 'high' }],
      actions: [{ type: 'send_template', templateId: '2' }, { type: 'assign_to', value: 'Support Team' }],
      isActive: true
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Customer Query Automation</h1>
          <p className="text-gray-600">Manage and automate responses to customer inquiries</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Auto-Response Template</DialogTitle>
                <DialogDescription>
                  Create a new template for automated customer responses
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    value={newTemplate.name || ''}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                    placeholder="Enter template name"
                  />
                </div>
                <div>
                  <Label htmlFor="template-category">Category</Label>
                  <Select value={newTemplate.category || ''} onValueChange={(value) => setNewTemplate({...newTemplate, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="pricing">Pricing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="template-subject">Email Subject</Label>
                  <Input
                    id="template-subject"
                    value={newTemplate.subject || ''}
                    onChange={(e) => setNewTemplate({...newTemplate, subject: e.target.value})}
                    placeholder="Enter email subject"
                  />
                </div>
                <div>
                  <Label htmlFor="template-content">Email Content</Label>
                  <Textarea
                    id="template-content"
                    value={newTemplate.content || ''}
                    onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                    placeholder="Enter email content (use {{customerName}} and {{queryId}} for personalization)"
                    rows={6}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="template-active"
                    checked={newTemplate.isActive || false}
                    onCheckedChange={(checked) => setNewTemplate({...newTemplate, isActive: checked})}
                  />
                  <Label htmlFor="template-active">Active Template</Label>
                </div>
                <Button onClick={handleCreateTemplate} className="w-full">
                  Create Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Settings className="w-4 h-4 mr-2" />
                New Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Automation Rule</DialogTitle>
                <DialogDescription>
                  Set up automated actions based on query conditions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rule-name">Rule Name</Label>
                  <Input
                    id="rule-name"
                    value={newRule.name || ''}
                    onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                    placeholder="Enter rule name"
                  />
                </div>
                <div>
                  <Label>Trigger</Label>
                  <Select value={newRule.trigger || ''} onValueChange={(value) => setNewRule({...newRule, trigger: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="query_received">Query Received</SelectItem>
                      <SelectItem value="priority_high">High Priority Query</SelectItem>
                      <SelectItem value="category_match">Category Match</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="rule-active"
                    checked={newRule.isActive || false}
                    onCheckedChange={(checked) => setNewRule({...newRule, isActive: checked})}
                  />
                  <Label htmlFor="rule-active">Active Rule</Label>
                </div>
                <Button onClick={handleCreateRule} className="w-full">
                  Create Rule
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="queries" className="space-y-4">
        <TabsList>
          <TabsTrigger value="queries">Customer Queries</TabsTrigger>
          <TabsTrigger value="templates">Response Templates</TabsTrigger>
          <TabsTrigger value="automation">Automation Rules</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="queries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Query Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 flex-wrap">
                <Input
                  placeholder="Search queries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="pricing">Pricing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {filteredQueries.map((query) => (
              <Card key={query.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{query.subject}</h3>
                        <Badge className={`${getPriorityColor(query.priority)} text-white`}>
                          {query.priority}
                        </Badge>
                        <Badge className={`${getStatusColor(query.status)} text-white`}>
                          {query.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        From: {query.customerName} ({query.customerEmail})
                      </p>
                      <p className="text-gray-700 mb-3">{query.message}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(query.createdAt).toLocaleDateString()}
                        </span>
                        {query.autoResponseSent && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            Auto-response sent
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {!query.autoResponseSent && (
                        <Select onValueChange={(templateId) => handleSendAutoResponse(query.id, templateId)}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Send Response" />
                          </SelectTrigger>
                          <SelectContent>
                            {templates
                              .filter(t => t.isActive && (t.category === query.category || t.category === 'general'))
                              .map(template => (
                                <SelectItem key={template.id} value={template.id}>
                                  {template.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {template.name}
                        <Badge variant={template.isActive ? "default" : "secondary"}>
                          {template.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Category: {template.category} | Response time: {template.responseTime} minutes
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium">Subject:</Label>
                      <p className="text-sm text-gray-700">{template.subject}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Content Preview:</Label>
                      <p className="text-sm text-gray-700 line-clamp-3">{template.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <div className="grid gap-4">
            {automationRules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {rule.name}
                        <Badge variant={rule.isActive ? "default" : "secondary"}>
                          {rule.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Trigger: {rule.trigger}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Switch checked={rule.isActive} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium">Conditions:</Label>
                      <p className="text-sm text-gray-700">{rule.conditions.length} condition(s) configured</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Actions:</Label>
                      <p className="text-sm text-gray-700">{rule.actions.length} action(s) configured</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Auto-Responses Sent</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">987</div>
                <p className="text-xs text-muted-foreground">80% automation rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.2m</div>
                <p className="text-xs text-muted-foreground">-45% improvement</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.5%</div>
                <p className="text-xs text-muted-foreground">+2.1% from last month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Query Volume Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-500">
                Chart visualization would be implemented here using a charting library
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}