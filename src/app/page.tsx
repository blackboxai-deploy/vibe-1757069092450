'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Users, Clock, TrendingUp, Plus, Send, Settings, BarChart3, MessageSquare, CheckCircle, AlertCircle, Timer } from 'lucide-react';

interface CustomerQuery {
  id: string;
  customerName: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'responded' | 'resolved';
  createdAt: string;
  responseTemplate?: string;
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  category: string;
  template: string;
  isActive: boolean;
  responseTime: number;
}

export default function HomePage() {
  const [queries, setQueries] = useState<CustomerQuery[]>([]);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [stats, setStats] = useState({
    totalQueries: 0,
    automatedResponses: 0,
    avgResponseTime: 0,
    satisfactionRate: 0
  });

  useEffect(() => {
    // Load sample data
    const sampleQueries: CustomerQuery[] = [
      {
        id: '1',
        customerName: 'John Doe',
        email: 'john@example.com',
        subject: 'Product Return Request',
        message: 'I would like to return my recent purchase. The item doesn\'t fit properly.',
        category: 'returns',
        priority: 'medium',
        status: 'responded',
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        customerName: 'Sarah Smith',
        email: 'sarah@example.com',
        subject: 'Billing Question',
        message: 'I see a charge on my account that I don\'t recognize. Can you help?',
        category: 'billing',
        priority: 'high',
        status: 'pending',
        createdAt: '2024-01-15T14:20:00Z'
      },
      {
        id: '3',
        customerName: 'Mike Johnson',
        email: 'mike@example.com',
        subject: 'Technical Support',
        message: 'The app keeps crashing when I try to upload photos.',
        category: 'technical',
        priority: 'high',
        status: 'resolved',
        createdAt: '2024-01-14T09:15:00Z'
      }
    ];

    const sampleRules: AutomationRule[] = [
      {
        id: '1',
        name: 'Return Request Auto-Response',
        trigger: 'keywords: return, refund, exchange',
        category: 'returns',
        template: 'Thank you for contacting us about your return request. We\'ve received your inquiry and will process it within 24 hours.',
        isActive: true,
        responseTime: 5
      },
      {
        id: '2',
        name: 'Billing Inquiry Response',
        trigger: 'keywords: billing, charge, payment',
        category: 'billing',
        template: 'We\'ve received your billing inquiry. Our finance team will review your account and respond within 2 business hours.',
        isActive: true,
        responseTime: 2
      },
      {
        id: '3',
        name: 'Technical Support Acknowledgment',
        trigger: 'keywords: bug, crash, error, technical',
        category: 'technical',
        template: 'Thank you for reporting this technical issue. Our support team is investigating and will provide a solution shortly.',
        isActive: true,
        responseTime: 1
      }
    ];

    setQueries(sampleQueries);
    setAutomationRules(sampleRules);
    setStats({
      totalQueries: sampleQueries.length,
      automatedResponses: sampleQueries.filter(q => q.status === 'responded').length,
      avgResponseTime: 45,
      satisfactionRate: 94
    });
  }, []);

  const handleSendAutomatedResponse = async (queryId: string) => {
    const query = queries.find(q => q.id === queryId);
    if (!query) return;

    const rule = automationRules.find(r => r.category === query.category && r.isActive);
    if (!rule) return;

    // Simulate API call
    setTimeout(() => {
      setQueries(prev => prev.map(q => 
        q.id === queryId 
          ? { ...q, status: 'responded' as const, responseTemplate: rule.template }
          : q
      ));
    }, 1000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'responded': return <Mail className="h-4 w-4 text-blue-600" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default: return <Timer className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Query Automation</h1>
          <p className="text-gray-600">Automate responses to customer inquiries with AI-powered email automation</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQueries}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Automated Responses</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.automatedResponses}</div>
              <p className="text-xs text-muted-foreground">85% automation rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgResponseTime}m</div>
              <p className="text-xs text-muted-foreground">-23% improvement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.satisfactionRate}%</div>
              <p className="text-xs text-muted-foreground">+5% this month</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="queries" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="queries">Customer Queries</TabsTrigger>
            <TabsTrigger value="automation">Automation Rules</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="queries" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Customer Queries</CardTitle>
                <CardDescription>Manage and respond to customer inquiries automatically</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {queries.map((query) => (
                    <div key={query.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(query.status)}
                          <div>
                            <h3 className="font-semibold">{query.subject}</h3>
                            <p className="text-sm text-gray-600">{query.customerName} • {query.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(query.priority)}>
                            {query.priority}
                          </Badge>
                          <Badge variant="outline">{query.category}</Badge>
                        </div>
                      </div>
                      
                      <p className="text-gray-700">{query.message}</p>
                      
                      {query.responseTemplate && (
                        <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                          <p className="text-sm font-medium text-blue-800">Automated Response Sent:</p>
                          <p className="text-sm text-blue-700 mt-1">{query.responseTemplate}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-gray-500">
                          {new Date(query.createdAt).toLocaleString()}
                        </span>
                        {query.status === 'pending' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleSendAutomatedResponse(query.id)}
                            className="flex items-center space-x-1"
                          >
                            <Send className="h-3 w-3" />
                            <span>Send Auto Response</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Automation Rules</h2>
                <p className="text-gray-600">Configure automated responses for different query types</p>
              </div>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Rule</span>
              </Button>
            </div>

            <div className="grid gap-6">
              {automationRules.map((rule) => (
                <Card key={rule.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <span>{rule.name}</span>
                        {rule.isActive ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </CardTitle>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription>
                      Trigger: {rule.trigger} • Response time: {rule.responseTime} minutes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">Email Template:</p>
                      <p className="text-sm text-gray-600">{rule.template}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Query Categories</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Technical Support</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: '45%'}}></div>
                        </div>
                        <span className="text-sm text-gray-600">45%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Billing</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{width: '30%'}}></div>
                        </div>
                        <span className="text-sm text-gray-600">30%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Returns</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-600 h-2 rounded-full" style={{width: '25%'}}></div>
                        </div>
                        <span className="text-sm text-gray-600">25%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Response Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Automated Responses</span>
                      <span className="text-sm font-semibold">85%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Manual Responses</span>
                      <span className="text-sm font-semibold">15%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Avg First Response</span>
                      <span className="text-sm font-semibold">12 minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Resolution Rate</span>
                      <span className="text-sm font-semibold">92%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}