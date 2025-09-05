"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Plus, Edit, Trash2, Copy, Eye, Sparkles, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'acknowledgment' | 'follow-up' | 'resolution' | 'escalation';
  category: 'customer-query' | 'support' | 'sales' | 'general';
  variables: string[];
  createdAt: string;
  lastUsed?: string;
  isActive: boolean;
}

interface QueryType {
  id: string;
  name: string;
  description: string;
  templates: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  autoResponse: boolean;
  escalationTime: number;
}

const defaultTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Query Acknowledgment',
    subject: 'We received your inquiry - Ticket #{ticketNumber}',
    content: `Dear {customerName},

Thank you for contacting us. We have received your inquiry regarding {querySubject} and have assigned it ticket number #{ticketNumber}.

Our support team is reviewing your request and will respond within {responseTime} business hours. If your inquiry is urgent, please don't hesitate to call us at {supportPhone}.

Query Details:
- Submitted: {submissionDate}
- Category: {queryCategory}
- Priority: {priority}

We appreciate your patience and look forward to assisting you.

Best regards,
{agentName}
Customer Support Team
{companyName}`,
    type: 'acknowledgment',
    category: 'customer-query',
    variables: ['customerName', 'querySubject', 'ticketNumber', 'responseTime', 'supportPhone', 'submissionDate', 'queryCategory', 'priority', 'agentName', 'companyName'],
    createdAt: '2024-01-15',
    isActive: true
  },
  {
    id: '2',
    name: 'Follow-up Response',
    subject: 'Update on your inquiry - Ticket #{ticketNumber}',
    content: `Dear {customerName},

I hope this email finds you well. I'm writing to provide you with an update on your inquiry (Ticket #{ticketNumber}) regarding {querySubject}.

Current Status: {currentStatus}

{updateDetails}

Next Steps:
{nextSteps}

If you have any additional questions or concerns, please don't hesitate to reach out. You can reply to this email or contact us at {supportPhone}.

Thank you for your continued patience.

Best regards,
{agentName}
Customer Support Team
{companyName}`,
    type: 'follow-up',
    category: 'customer-query',
    variables: ['customerName', 'ticketNumber', 'querySubject', 'currentStatus', 'updateDetails', 'nextSteps', 'supportPhone', 'agentName', 'companyName'],
    createdAt: '2024-01-16',
    isActive: true
  },
  {
    id: '3',
    name: 'Query Resolution',
    subject: 'Your inquiry has been resolved - Ticket #{ticketNumber}',
    content: `Dear {customerName},

Great news! We have successfully resolved your inquiry (Ticket #{ticketNumber}) regarding {querySubject}.

Resolution Summary:
{resolutionDetails}

What we did:
{actionsTaken}

To ensure everything is working correctly, please {verificationSteps}.

We hope this resolution meets your expectations. If you experience any further issues or have additional questions, please don't hesitate to contact us.

We value your feedback! Please take a moment to rate your support experience: {feedbackLink}

Thank you for choosing {companyName}.

Best regards,
{agentName}
Customer Support Team
{companyName}`,
    type: 'resolution',
    category: 'customer-query',
    variables: ['customerName', 'ticketNumber', 'querySubject', 'resolutionDetails', 'actionsTaken', 'verificationSteps', 'feedbackLink', 'companyName', 'agentName'],
    createdAt: '2024-01-17',
    isActive: true
  },
  {
    id: '4',
    name: 'Escalation Notice',
    subject: 'Your inquiry requires additional attention - Ticket #{ticketNumber}',
    content: `Dear {customerName},

Thank you for your patience regarding your inquiry (Ticket #{ticketNumber}) about {querySubject}.

Due to the complexity of your request, we are escalating your case to our {escalationTeam} team for specialized assistance. This ensures you receive the most accurate and comprehensive solution.

Escalation Details:
- Escalated to: {escalationTeam}
- New point of contact: {escalationAgent}
- Expected resolution timeframe: {escalationTimeframe}
- Priority level: {escalationPriority}

{escalationAgent} will be in touch with you within {contactTimeframe} to discuss your case in detail and provide next steps.

We apologize for any inconvenience and appreciate your understanding as we work to provide you with the best possible solution.

If you have any immediate concerns, please contact {escalationAgent} directly at {escalationEmail} or {escalationPhone}.

Best regards,
{agentName}
Customer Support Team
{companyName}`,
    type: 'escalation',
    category: 'customer-query',
    variables: ['customerName', 'ticketNumber', 'querySubject', 'escalationTeam', 'escalationAgent', 'escalationTimeframe', 'escalationPriority', 'contactTimeframe', 'escalationEmail', 'escalationPhone', 'agentName', 'companyName'],
    createdAt: '2024-01-18',
    isActive: true
  }
];

const queryTypes: QueryType[] = [
  {
    id: '1',
    name: 'Technical Support',
    description: 'Product issues, bugs, technical difficulties',
    templates: ['1', '2', '3', '4'],
    priority: 'high',
    autoResponse: true,
    escalationTime: 24
  },
  {
    id: '2',
    name: 'Billing Inquiry',
    description: 'Payment issues, billing questions, refunds',
    templates: ['1', '2', '3'],
    priority: 'medium',
    autoResponse: true,
    escalationTime: 48
  },
  {
    id: '3',
    name: 'General Information',
    description: 'Product information, company policies, general questions',
    templates: ['1', '2', '3'],
    priority: 'low',
    autoResponse: true,
    escalationTime: 72
  },
  {
    id: '4',
    name: 'Account Issues',
    description: 'Login problems, account access, profile updates',
    templates: ['1', '2', '3', '4'],
    priority: 'high',
    autoResponse: true,
    escalationTime: 12
  }
];

export default function TemplateManager() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [previewData, setPreviewData] = useState<Record<string, string>>({});
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const [newTemplate, setNewTemplate] = useState<Partial<EmailTemplate>>({
    name: '',
    subject: '',
    content: '',
    type: 'acknowledgment',
    category: 'customer-query',
    variables: [],
    isActive: true
  });

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || template.type === filterType;
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{([^}]+)\}/g);
    return matches ? [...new Set(matches.map(match => match.slice(1, -1)))] : [];
  };

  const generateAITemplate = async (queryType: string, templateType: string) => {
    setIsGeneratingAI(true);
    try {
      const response = await fetch('/api/ai/generate-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queryType,
          templateType,
          context: 'customer service email automation'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setNewTemplate(prev => ({
          ...prev,
          subject: data.subject,
          content: data.content,
          variables: extractVariables(data.content)
        }));
        toast.success('AI template generated successfully!');
      }
    } catch (error) {
      toast.error('Failed to generate AI template');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const saveTemplate = () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    const template: EmailTemplate = {
      id: isEditing ? selectedTemplate!.id : Date.now().toString(),
      name: newTemplate.name!,
      subject: newTemplate.subject!,
      content: newTemplate.content!,
      type: newTemplate.type as EmailTemplate['type'],
      category: newTemplate.category as EmailTemplate['category'],
      variables: extractVariables(newTemplate.content!),
      createdAt: isEditing ? selectedTemplate!.createdAt : new Date().toISOString().split('T')[0],
      isActive: newTemplate.isActive!
    };

    if (isEditing) {
      setTemplates(prev => prev.map(t => t.id === template.id ? template : t));
      toast.success('Template updated successfully!');
    } else {
      setTemplates(prev => [...prev, template]);
      toast.success('Template created successfully!');
    }

    resetForm();
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast.success('Template deleted successfully!');
  };

  const duplicateTemplate = (template: EmailTemplate) => {
    const newTemplate: EmailTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTemplates(prev => [...prev, newTemplate]);
    toast.success('Template duplicated successfully!');
  };

  const resetForm = () => {
    setNewTemplate({
      name: '',
      subject: '',
      content: '',
      type: 'acknowledgment',
      category: 'customer-query',
      variables: [],
      isActive: true
    });
    setSelectedTemplate(null);
    setIsEditing(false);
    setIsCreating(false);
  };

  const startEditing = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setNewTemplate(template);
    setIsEditing(true);
    setIsCreating(true);
  };

  const previewTemplate = (template: EmailTemplate) => {
    const sampleData: Record<string, string> = {
      customerName: 'John Smith',
      querySubject: 'Product installation issue',
      ticketNumber: 'SUP-2024-001',
      responseTime: '24',
      supportPhone: '+1-800-SUPPORT',
      submissionDate: new Date().toLocaleDateString(),
      queryCategory: 'Technical Support',
      priority: 'High',
      agentName: 'Sarah Johnson',
      companyName: 'TechCorp Solutions',
      currentStatus: 'In Progress',
      updateDetails: 'Our technical team has identified the root cause and is working on a solution.',
      nextSteps: 'We will deploy the fix and test it in your environment within the next 2 business days.',
      resolutionDetails: 'The installation issue was caused by a compatibility conflict with your system configuration.',
      actionsTaken: 'Updated the installation package and provided custom configuration settings.',
      verificationSteps: 'test the installation process and confirm everything is working correctly',
      feedbackLink: 'https://feedback.techcorp.com/survey/12345',
      escalationTeam: 'Senior Technical Specialists',
      escalationAgent: 'Michael Chen',
      escalationTimeframe: '48 hours',
      escalationPriority: 'High',
      contactTimeframe: '4 hours',
      escalationEmail: 'michael.chen@techcorp.com',
      escalationPhone: '+1-800-ESCALATE'
    };
    setPreviewData(sampleData);
    setSelectedTemplate(template);
  };

  const renderPreview = (content: string, data: Record<string, string>) => {
    let preview = content;
    Object.entries(data).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    });
    return preview;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Email Templates</h2>
          <p className="text-muted-foreground">
            Manage automated email templates for customer query responses
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Template
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="acknowledgment">Acknowledgment</SelectItem>
            <SelectItem value="follow-up">Follow-up</SelectItem>
            <SelectItem value="resolution">Resolution</SelectItem>
            <SelectItem value="escalation">Escalation</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="customer-query">Customer Query</SelectItem>
            <SelectItem value="support">Support</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="general">General</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {template.subject}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant={template.isActive ? "default" : "secondary"}>
                    {template.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {template.type}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {template.category}
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-3 w-3" />
                  Created: {template.createdAt}
                </div>
                {template.lastUsed && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    Last used: {template.lastUsed}
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                Variables: {template.variables.length}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => previewTemplate(template)}
                  className="flex-1"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEditing(template)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => duplicateTemplate(template)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteTemplate(template.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isCreating} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
            <DialogDescription>
              Create or modify email templates for automated customer query responses
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="editor" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="editor">Template Editor</TabsTrigger>
              <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      value={newTemplate.name || ''}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter template name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Template Type</Label>
                    <Select
                      value={newTemplate.type}
                      onValueChange={(value) => setNewTemplate(prev => ({ ...prev, type: value as EmailTemplate['type'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="acknowledgment">Acknowledgment</SelectItem>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                        <SelectItem value="resolution">Resolution</SelectItem>
                        <SelectItem value="escalation">Escalation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input
                    id="subject"
                    value={newTemplate.subject || ''}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter email subject line"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Email Content</Label>
                  <Textarea
                    id="content"
                    value={newTemplate.content || ''}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter email content with variables like {customerName}, {ticketNumber}, etc."
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>

                {newTemplate.content && (
                  <div className="space-y-2">
                    <Label>Detected Variables</Label>
                    <div className="flex flex-wrap gap-2">
                      {extractVariables(newTemplate.content).map((variable) => (
                        <Badge key={variable} variant="secondary" className="text-xs">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button onClick={saveTemplate}>
                    {isEditing ? 'Update Template' : 'Create Template'}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ai-assistant" className="space-y-4">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Use AI to generate professional email templates based on your requirements.
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Query Type</Label>
                    <Select defaultValue="technical-support">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical-support">Technical Support</SelectItem>
                        <SelectItem value="billing-inquiry">Billing Inquiry</SelectItem>
                        <SelectItem value="general-information">General Information</SelectItem>
                        <SelectItem value="account-issues">Account Issues</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Template Type</Label>
                    <Select defaultValue="acknowledgment">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="acknowledgment">Acknowledgment</SelectItem>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                        <SelectItem value="resolution">Resolution</SelectItem>
                        <SelectItem value="escalation">Escalation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={() => generateAITemplate('technical-support', 'acknowledgment')}
                  disabled={isGeneratingAI}
                  className="w-full"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isGeneratingAI ? 'Generating...' : 'Generate AI Template'}
                </Button>

                <div className="text-xs text-muted-foreground">
                  The AI will generate a professional email template with appropriate variables and content structure.
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedTemplate && !isCreating} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Preview: {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              Preview how this template will look with sample data
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Subject Line</Label>
                <div className="p-3 bg-muted rounded-md font-medium">
                  {renderPreview(selectedTemplate.subject, previewData)}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email Content</Label>
                <div className="p-4 bg-muted rounded-md whitespace-pre-wrap text-sm">
                  {renderPreview(selectedTemplate.content, previewData)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label>Template Info</Label>
                  <div className="space-y-1 text-muted-foreground">
                    <div>Type: {selectedTemplate.type}</div>
                    <div>Category: {selectedTemplate.category}</div>
                    <div>Variables: {selectedTemplate.variables.length}</div>
                  </div>
                </div>
                <div>
                  <Label>Usage Stats</Label>
                  <div className="space-y-1 text-muted-foreground">
                    <div>Created: {selectedTemplate.createdAt}</div>
                    <div>Status: {selectedTemplate.isActive ? 'Active' : 'Inactive'}</div>
                    <div>Last used: {selectedTemplate.lastUsed || 'Never'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}