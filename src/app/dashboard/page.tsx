'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Users, Clock, TrendingUp, Plus, Search, Filter, Send, Eye, BarChart3 } from 'lucide-react';

interface CustomerQuery {
  id: string;
  customerName: string;
  email: string;
  subject: string;
  query: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'resolved';
  createdAt: string;
  responseTemplate?: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
}

interface DashboardStats {
  totalQueries: number;
  pendingQueries: number;
  resolvedToday: number;
  avgResponseTime: string;
}

export default function Dashboard() {
  const [queries, setQueries] = useState<CustomerQuery[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalQueries: 0,
    pendingQueries: 0,
    resolvedToday: 0,
    avgResponseTime: '2.5h'
  });
  const [selectedQuery, setSelectedQuery] = useState<CustomerQuery | null>(null);
  const [emailContent, setEmailContent] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const queriesResponse = await fetch('/api/customer-queries');
      const templatesResponse = await fetch('/api/email-templates');
      
      if (queriesResponse.ok && templatesResponse.ok) {
        const queriesData = await queriesResponse.json();
        const templatesData = await templatesResponse.json();
        
        setQueries(queriesData);
        setTemplates(templatesData);
        
        const pendingCount = queriesData.filter((q: CustomerQuery) => q.status === 'pending').length;
        const resolvedToday = queriesData.filter((q: CustomerQuery) => {
          const today = new Date().toDateString();
          return q.status === 'resolved' && new Date(q.createdAt).toDateString() === today;
        }).length;
        
        setStats({
          totalQueries: queriesData.length,
          pendingQueries: pendingCount,
          resolvedToday,
          avgResponseTime: '2.5h'
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleQuerySelect = (query: CustomerQuery) => {
    setSelectedQuery(query);
    setEmailSubject(`Re: ${query.subject}`);
    
    const template = templates.find(t => t.category === query.category);
    if (template) {
      setEmailContent(template.content.replace('{{customerName}}', query.customerName));
    } else {
      setEmailContent(`Dear ${query.customerName},\n\nThank you for contacting us regarding "${query.subject}".\n\n\n\nBest regards,\nCustomer Support Team`);
    }
  };

  const generateAIResponse = async () => {
    if (!selectedQuery) return;
    
    try {
      const response = await fetch('/api/generate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: selectedQuery.query,
          category: selectedQuery.category,
          customerName: selectedQuery.customerName
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setEmailContent(data.content);
        setEmailSubject(data.subject);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
    }
  };

  const sendEmail = async () => {
    if (!selectedQuery) return;
    
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedQuery.email,
          subject: emailSubject,
          content: emailContent,
          queryId: selectedQuery.id
        })
      });
      
      if (response.ok) {
        setQueries(prev => prev.map(q => 
          q.id === selectedQuery.id 
            ? { ...q, status: 'resolved' as const }
            : q
        ));
        setSelectedQuery(null);
        setEmailContent('');
        setEmailSubject('');
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const filteredQueries = queries.filter(query => {
    const matchesSearch = query.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         query.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         query.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || query.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || query.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Query Email Automation</h1>
          <p className="text-gray-600">Manage and respond to customer queries with AI-powered email automation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQueries}</div>
              <p className="text-xs text-muted-foreground">All time queries</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Queries</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingQueries}</div>
              <p className="text-xs text-muted-foreground">Awaiting response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.resolvedToday}</div>
              <p className="text-xs text-muted-foreground">Completed today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgResponseTime}</div>
              <p className="text-xs text-muted-foreground">Average response</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Queries</CardTitle>
              <CardDescription>Manage incoming customer queries and automate responses</CardDescription>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search queries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="complaint">Complaint</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredQueries.map((query) => (
                  <div
                    key={query.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedQuery?.id === query.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => handleQuerySelect(query)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{query.customerName}</h4>
                        <p className="text-sm text-gray-600">{query.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(query.priority)}>
                          {query.priority}
                        </Badge>
                        <Badge className={getStatusColor(query.status)}>
                          {query.status}
                        </Badge>
                      </div>
                    </div>
                    <h5 className="font-medium text-sm mb-1">{query.subject}</h5>
                    <p className="text-sm text-gray-600 line-clamp-2">{query.query}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">
                        {new Date(query.createdAt).toLocaleDateString()}
                      </span>
                      <Badge variant="outline">{query.category}</Badge>
                    </div>
                  </div>
                ))}
                
                {filteredQueries.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No queries found matching your filters</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Response</CardTitle>
              <CardDescription>
                {selectedQuery 
                  ? `Responding to ${selectedQuery.customerName}'s query`
                  : 'Select a query to compose a response'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedQuery ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Original Query:</h4>
                    <p className="text-sm text-gray-700">{selectedQuery.query}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <Input
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Email subject"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Response</label>
                    <Textarea
                      value={emailContent}
                      onChange={(e) => setEmailContent(e.target.value)}
                      placeholder="Type your response here..."
                      rows={8}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={generateAIResponse} variant="outline" className="flex-1">
                      <Plus className="h-4 w-4 mr-2" />
                      Generate AI Response
                    </Button>
                    <Button onClick={sendEmail} className="flex-1">
                      <Send className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a customer query to start composing a response</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}