'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Eye, Edit, Copy, Trash2, Mail, Clock, Users, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: 'customer-query' | 'welcome' | 'follow-up' | 'support' | 'feedback';
  type: 'automated' | 'manual';
  variables: string[];
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
}

const defaultTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Customer Query Acknowledgment',
    subject: 'We received your inquiry - {{customerName}}',
    content: `Dear {{customerName}},

Thank you for contacting us regarding {{querySubject}}. We have received your inquiry and our team is reviewing it carefully.

Your query details:
- Reference ID: {{ticketId}}
- Submitted on: {{submissionDate}}
- Category: {{queryCategory}}

We understand the importance of your concern and are committed to providing you with a comprehensive response. Our typical response time is 24-48 hours for general inquiries.

What happens next:
1. Our support team will review your query within 2 hours
2. You'll receive a detailed response within 24-48 hours
3. If needed, we may reach out for additional information

In the meantime, you might find these resources helpful:
- FAQ Section: {{faqLink}}
- Knowledge Base: {{knowledgeBaseLink}}
- Live Chat: Available 9 AM - 6 PM EST

If your matter is urgent, please don't hesitate to call us at {{supportPhone}}.

Best regards,
{{agentName}}
Customer Support Team
{{companyName}}`,
    category: 'customer-query',
    type: 'automated',
    variables: ['customerName', 'querySubject', 'ticketId', 'submissionDate', 'queryCategory', 'faqLink', 'knowledgeBaseLink', 'supportPhone', 'agentName', 'companyName'],
    createdAt: '2024-01-15',
    lastUsed: '2024-01-20',
    usageCount: 156
  },
  {
    id: '2',
    name: 'Query Resolution Follow-up',
    subject: 'How did we do? Your query {{ticketId}} resolution feedback',
    content: `Hi {{customerName}},

We hope this email finds you well. We recently resolved your inquiry (Reference: {{ticketId}}) regarding {{querySubject}}.

Resolution Summary:
- Issue: {{querySubject}}
- Resolution provided on: {{resolutionDate}}
- Handled by: {{agentName}}

We want to ensure that our solution met your expectations and fully addressed your concern.

Please take a moment to let us know:
✓ Was your issue completely resolved?
✓ How would you rate our response time?
✓ Was our support team helpful and professional?

[Rate Our Service] {{feedbackLink}}

Your feedback is invaluable in helping us improve our customer service. If you have any additional questions or concerns, please don't hesitate to reach out.

Thank you for choosing {{companyName}}. We appreciate your business and look forward to serving you again.

Warm regards,
{{agentName}}
Customer Success Team
{{companyName}}

P.S. Follow us on social media for updates and tips: {{socialLinks}}`,
    category: 'follow-up',
    type: 'automated',
    variables: ['customerName', 'ticketId', 'querySubject', 'resolutionDate', 'agentName', 'feedbackLink', 'companyName', 'socialLinks'],
    createdAt: '2024-01-10',
    lastUsed: '2024-01-19',
    usageCount: 89
  },
  {
    id: '3',
    name: 'Complex Query Escalation',
    subject: 'Your inquiry requires specialized attention - {{ticketId}}',
    content: `Dear {{customerName}},

Thank you for your patience regarding your inquiry (Reference: {{ticketId}}) about {{querySubject}}.

After careful review, we've determined that your query requires specialized attention from our {{departmentName}} team to ensure you receive the most accurate and comprehensive solution.

Here's what's happening:
- Your case has been escalated to: {{specialistName}}
- Expected response time: {{expectedResponseTime}}
- Priority level: {{priorityLevel}}

Our specialist will:
• Conduct a thorough analysis of your specific situation
• Provide detailed recommendations tailored to your needs
• Ensure all aspects of your inquiry are fully addressed

You can expect to hear from {{specialistName}} within {{expectedResponseTime}}. They will contact you via {{contactMethod}} at {{contactInfo}}.

In the meantime:
- Your case remains our top priority
- You can track progress at: {{trackingLink}}
- For urgent matters, contact: {{urgentContact}}

We apologize for any inconvenience and appreciate your understanding as we work to provide you with the best possible solution.

Best regards,
{{agentName}}
Customer Support Team
{{companyName}}`,
    category: 'support',
    type: 'automated',
    variables: ['customerName', 'ticketId', 'querySubject', 'departmentName', 'specialistName', 'expectedResponseTime', 'priorityLevel', 'contactMethod', 'contactInfo', 'trackingLink', 'urgentContact', 'agentName', 'companyName'],
    createdAt: '2024-01-12',
    lastUsed: '2024-01-18',
    usageCount: 34
  }
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<EmailTemplate>>({
    name: '',
    subject: '',
    content: '',
    category: 'customer-query',
    type: 'automated',
    variables: []
  });

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const extractVariables = (content: string, subject: string): string[] => {
    const text = content + ' ' + subject;
    const matches = text.match(/\{\{([^}]+)\}\}/g);
    if (!matches) return [];
    return [...new Set(matches.map(match => match.replace(/[{}]/g, '')))];
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    const variables = extractVariables(newTemplate.content || '', newTemplate.subject || '');
    const template: EmailTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name,
      subject: newTemplate.subject,
      content: newTemplate.content,
      category: newTemplate.category as EmailTemplate['category'],
      type: newTemplate.type as EmailTemplate['type'],
      variables,
      createdAt: new Date().toISOString().split('T')[0],
      usageCount: 0
    };

    setTemplates([...templates, template]);
    setNewTemplate({
      name: '',
      subject: '',
      content: '',
      category: 'customer-query',
      type: 'automated',
      variables: []
    });
    setIsCreateDialogOpen(false);
    toast.success('Template created successfully');
  };

  const handleDuplicateTemplate = (template: EmailTemplate) => {
    const duplicated: EmailTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString().split('T')[0],
      usageCount: 0,
      lastUsed: undefined
    };
    setTemplates([...templates, duplicated]);
    toast.success('Template duplicated successfully');
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId));
    toast.success('Template deleted successfully');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'customer-query': return <Mail className="h-4 w-4" />;
      case 'welcome': return <Users className="h-4 w-4" />;
      case 'follow-up': return <Clock className="h-4 w-4" />;
      case 'support': return <Zap className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'customer-query': return 'bg-blue-100 text-blue-800';
      case 'welcome': return 'bg-green-100 text-green-800';
      case 'follow-up': return 'bg-yellow-100 text-yellow-800';
      case 'support': return 'bg-red-100 text-red-800';
      case 'feedback': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Email Templates</h1>
          <p className="text-muted-foreground">Manage your automated email templates for customer queries</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Email Template</DialogTitle>
              <DialogDescription>
                Create a new automated email template for customer queries
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={newTemplate.name || ''}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                    placeholder="e.g., Customer Query Response"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate({...newTemplate, category: value as EmailTemplate['category']})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer-query">Customer Query</SelectItem>
                      <SelectItem value="welcome">Welcome</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={newTemplate.subject || ''}
                  onChange={(e) => setNewTemplate({...newTemplate, subject: e.target.value})}
                  placeholder="Use {{variableName}} for dynamic content"
                />
              </div>
              <div>
                <Label htmlFor="content">Email Content</Label>
                <Textarea
                  id="content"
                  value={newTemplate.content || ''}
                  onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                  placeholder="Write your email content here. Use {{variableName}} for dynamic content."
                  rows={12}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTemplate}>
                  Create Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="customer-query">Customer Query</SelectItem>
            <SelectItem value="welcome">Welcome</SelectItem>
            <SelectItem value="follow-up">Follow-up</SelectItem>
            <SelectItem value="support">Support</SelectItem>
            <SelectItem value="feedback">Feedback</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(template.category)}
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                </div>
                <Badge className={getCategoryColor(template.category)}>
                  {template.category.replace('-', ' ')}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2">
                {template.subject}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <p>Variables: {template.variables.length}</p>
                  <p>Used: {template.usageCount} times</p>
                  <p>Created: {template.createdAt}</p>
                  {template.lastUsed && <p>Last used: {template.lastUsed}</p>}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setIsPreviewOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicateTemplate(template)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              Template preview with variables highlighted
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <Label>Subject Line:</Label>
                <div className="p-3 bg-muted rounded-md">
                  {selectedTemplate.subject}
                </div>
              </div>
              <div>
                <Label>Email Content:</Label>
                <div className="p-4 bg-muted rounded-md whitespace-pre-wrap">
                  {selectedTemplate.content}
                </div>
              </div>
              <div>
                <Label>Variables ({selectedTemplate.variables.length}):</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTemplate.variables.map((variable) => (
                    <Badge key={variable} variant="secondary">
                      {variable}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}