'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Save, Wand2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerQuery {
  id: string;
  customerName: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: string;
  status: 'pending' | 'in-progress' | 'resolved';
}

interface ResponseTemplate {
  id: string;
  name: string;
  category: string;
  template: string;
}

interface ResponseGeneratorProps {
  query: CustomerQuery;
  onResponseSent: (queryId: string, response: string) => void;
  onSaveDraft: (queryId: string, response: string) => void;
}

const ResponseGenerator: React.FC<ResponseGeneratorProps> = ({
  query,
  onResponseSent,
  onSaveDraft
}) => {
  const [response, setResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [tone, setTone] = useState('professional');
  const [copied, setCopied] = useState(false);
  const [templates, setTemplates] = useState<ResponseTemplate[]>([]);

  const responseTemplates: ResponseTemplate[] = [
    {
      id: '1',
      name: 'General Inquiry',
      category: 'general',
      template: 'Thank you for contacting us. We have received your inquiry and will get back to you within 24 hours.'
    },
    {
      id: '2',
      name: 'Technical Support',
      category: 'technical',
      template: 'We understand you are experiencing technical difficulties. Our support team is investigating this issue and will provide a solution shortly.'
    },
    {
      id: '3',
      name: 'Billing Question',
      category: 'billing',
      template: 'Thank you for your billing inquiry. We are reviewing your account and will provide detailed information about your charges.'
    },
    {
      id: '4',
      name: 'Product Information',
      category: 'product',
      template: 'Thank you for your interest in our products. We would be happy to provide you with detailed information about our offerings.'
    },
    {
      id: '5',
      name: 'Complaint Resolution',
      category: 'complaint',
      template: 'We sincerely apologize for any inconvenience caused. Your feedback is important to us and we are taking immediate action to resolve this matter.'
    }
  ];

  useEffect(() => {
    setTemplates(responseTemplates);
  }, []);

  const generateAIResponse = async () => {
    setIsGenerating(true);
    try {
      const systemPrompt = `You are a professional customer service representative. Generate a helpful, empathetic, and solution-oriented email response to the customer query. 

      Customer Details:
      - Name: ${query.customerName}
      - Email: ${query.email}
      - Subject: ${query.subject}
      - Category: ${query.category}
      - Priority: ${query.priority}
      
      Customer Message: "${query.message}"
      
      Response Tone: ${tone}
      
      Guidelines:
      - Be professional and empathetic
      - Address the customer by name
      - Acknowledge their concern specifically
      - Provide a clear solution or next steps
      - Include appropriate contact information
      - Keep the tone ${tone}
      - End with a professional closing`;

      const response = await fetch('https://oi-server.onrender.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer xxx',
          'customerId': 'roshanb693@gmail.com'
        },
        body: JSON.stringify({
          model: 'openrouter/anthropic/claude-sonnet-4',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: `Generate a professional email response for this customer query: ${query.message}`
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI response');
      }

      const data = await response.json();
      const generatedResponse = data.choices[0].message.content;
      setResponse(generatedResponse);
      toast.success('AI response generated successfully!');
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast.error('Failed to generate AI response. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const personalizedTemplate = `Dear ${query.customerName},\n\n${template.template}\n\nBest regards,\nCustomer Support Team`;
      setResponse(personalizedTemplate);
      setSelectedTemplate(templateId);
    }
  };

  const handleSendResponse = async () => {
    if (!response.trim()) {
      toast.error('Please enter a response before sending.');
      return;
    }

    setIsSending(true);
    try {
      // Simulate sending email
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onResponseSent(query.id, response);
      toast.success('Response sent successfully!');
      setResponse('');
    } catch (error) {
      console.error('Error sending response:', error);
      toast.error('Failed to send response. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveDraft = () => {
    if (!response.trim()) {
      toast.error('Please enter a response before saving.');
      return;
    }

    onSaveDraft(query.id, response);
    toast.success('Draft saved successfully!');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      toast.success('Response copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Customer Query Display */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Customer Query</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{query.category}</Badge>
              <Badge className={getPriorityColor(query.priority)}>
                {query.priority.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Customer Name</Label>
              <p className="text-sm">{query.customerName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Email</Label>
              <p className="text-sm">{query.email}</p>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Subject</Label>
            <p className="text-sm font-medium">{query.subject}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Message</Label>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm">{query.message}</p>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Received</Label>
            <p className="text-sm">{new Date(query.timestamp).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Response Generation Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generate Response</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="template-select">Quick Templates</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tone-select">Response Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="empathetic">Empathetic</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={generateAIResponse} 
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              {isGenerating ? 'Generating...' : 'Generate AI Response'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Response Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Email Response</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              disabled={!response.trim()}
              className="flex items-center gap-2"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email-subject">Subject Line</Label>
            <Input
              id="email-subject"
              value={`Re: ${query.subject}`}
              readOnly
              className="bg-gray-50"
            />
          </div>
          <div>
            <Label htmlFor="email-response">Response</Label>
            <Textarea
              id="email-response"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Type your response here or use the AI generator above..."
              className="min-h-[300px]"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {response.length} characters
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={!response.trim()}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Draft
              </Button>
              <Button
                onClick={handleSendResponse}
                disabled={!response.trim() || isSending}
                className="flex items-center gap-2"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isSending ? 'Sending...' : 'Send Response'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResponseGenerator;