```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Search, Mail, Clock, User, MessageSquare, Send, Eye, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerQuery {
  id: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  message: string;
  status: 'new' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'general' | 'technical' | 'billing' | 'product' | 'complaint';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  tags: string[];
  responseCount: number;
  lastResponse?: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
}

const QueryList: React.FC = () => {
  const [queries, setQueries] = useState<CustomerQuery[]>([]);
  const [filteredQueries, setFilteredQueries] = useState<CustomerQuery[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedQuery, setSelectedQuery] = useState<CustomerQuery | null>(null);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueries();
    fetchEmailTemplates();
  }, []);

  useEffect(() => {
    filterQueries();
  }, [queries, searchTerm, statusFilter, priorityFilter, categoryFilter]);

  const fetchQueries = async () => {
    try {
      const response = await fetch('/api/customer-queries');
      const data = await response.json();
      setQueries(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching queries:', error);
      setLoading(false);
      toast.error('Failed to fetch customer queries');
    }
  };

  const fetchEmailTemplates = async () => {
    try {
      const response = await fetch('/api/email-templates');
      const data = await response.json();
      setEmailTemplates(data);
    } catch (error) {
      console.error('Error fetching email templates:', error);
    }
  };

  const filterQueries = () => {
    let filtered = queries;

    if (searchTerm) {
      filtered = filtered.filter(query =>
        query.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(query => query.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(query => query.priority === priorityFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(query => query.category === categoryFilter);
    }

    setFilteredQueries(filtered);
  };

  const updateQueryStatus = async (queryId: string, newStatus: CustomerQuery['status']) => {
    try {
      const response = await fetch(`/api/customer-queries/${queryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setQueries(queries.map(query =>
          query.id === queryId ? { ...query, status: newStatus, updatedAt: new Date().toISOString() } : query
        ));
        toast.success('Query status updated successfully');
      }
    } catch (error) {
      console.error('Error updating query status:', error);
      toast.error('Failed to update query status');
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (template && selectedQuery) {
      setEmailSubject(template.subject.replace('{customerName}', selectedQuery.customerName));
      setEmailContent(template.content
        .replace('{customerName}', selectedQuery.customerName)
        .replace('{querySubject}', selectedQuery.subject)
        .replace('{queryMessage}', selectedQuery.message)
      );
    }
  };

  const sendAutomatedEmail = async () => {
    if (!selectedQuery || !emailSubject || !emailContent) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/send-automated-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          queryId: selectedQuery.id,
          to: selectedQuery.customerEmail,
          subject: emailSubject,
          content: emailContent,
          templateId: selectedTemplate,
        }),
      });

      if (response.ok) {
        toast.success('Automated email sent successfully');
        setIsEmailDialogOpen(false);
        setEmailSubject('');
        setEmailContent('');
        setSelectedTemplate('');
        updateQueryStatus(selectedQuery.id, 'in-progress');
      } else {
        toast.error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    }
  };

  const generateAIResponse = async () => {
    if (!selectedQuery) return;

    try {
      const response = await fetch('/api/generate-ai-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: selectedQuery.message,
          subject: selectedQuery.subject,
          category: selectedQuery.category,
          customerName: selectedQuery.customerName,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setEmailSubject(data.subject);
        setEmailContent(data.content);
        toast.success('AI response generated successfully');
      } else {
        toast.error('Failed to generate AI response');
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast.error('Failed to generate AI response');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Queries</h2>
          <p className="text-gray-600">Manage and respond to customer inquiries with automated emails</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {filteredQueries.length} queries
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search queries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="complaint">Complaint</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setPriorityFilter('all');
              setCategoryFilter('all');
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Query List */}
      <div className="grid gap-4">
        {filteredQueries.map((query) => (
          <Card key={query.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{query.customerName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{query.customerEmail}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {new Date(query.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{query.subject}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{query.message}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge className={getPriorityColor(query.priority)}>
                      {query.priority}
                    </Badge>
                    <Badge className={getStatusColor(query.status)}>
                      {query.status}
                    </Badge>
                    <Badge variant="outline">
                      {query.category}
                    </Badge>
                    {query.responseCount > 0 && (
                      <Badge variant="outline">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {query.responseCount} responses
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedQuery(query);
                      setIsViewDialogOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      setSelectedQuery(query);
                      setIsEmailDialogOpen(true);
                    }}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Reply
                  </Button>
                  <Select
                    value={query.status}
                    onValueChange={(value) => updateQueryStatus(query.id, value as CustomerQuery['status'])}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQueries.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No queries found</h3>
              <p className="text-gray-600">No customer queries match your current filters.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Query Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Query Details</DialogTitle>
          </DialogHeader>
          {selectedQuery && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Customer Name</Label>
                  <p className="text-sm text-gray-900">{selectedQuery.customerName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Email</Label>
                  <p className="text-sm text-gray-900">{selectedQuery.customerEmail}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Priority</Label>
                  <Badge className={getPriorityColor(selectedQuery.priority)}>
                    {selectedQuery.priority}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Status</Label>
                  <Badge className={getStatusColor(selectedQuery.status)}>
                    {selectedQuery.status}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Subject</Label>
                <p className="text-sm text-gray-900 mt-1">{selectedQuery.subject}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Message</Label>
                <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{selectedQuery.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Created</Label>
                  <p className="text-sm text-gray-900">{new Date(selectedQuery.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Last Updated</Label>
                  <p className="text-sm text-gray-900">{new Date(selectedQuery.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Email Reply Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Send Automated Email Response</DialogTitle>
          </DialogHeader>
          {selectedQuery && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">To</Label>
                  <p className="text-sm text-gray-900">{selectedQuery.customerEmail}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Customer</Label>
                  <p className="text-sm text-gray-900">{selectedQuery.customerName}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="template-select">Email Template</Label>
                <Select value={selectedTemplate} onValueChange={(value) => {
                  setSelectedTemplate(value);
                  handleTemplateSelect(value);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template or write custom email" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={generateAIResponse}
                  className="flex-1"
                >
                  Generate AI Response
                </Button>
              </div>

              <div>
                <Label htmlFor="email-subject">Subject</Label>
                <Input
                  id="email-subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject"
                />
              </div>

              <div>
                <Label htmlFor="email-content">Email Content</Label>
                <Textarea
                  id="email-content"
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  placeholder="Enter your email content here..."
                  rows={10}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEmailDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={sendAutomatedEmail}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QueryList;
```