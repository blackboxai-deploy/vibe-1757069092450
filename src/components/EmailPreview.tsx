'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, User, Mail, Phone, MessageSquare, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

interface CustomerQuery {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subject: string;
  message: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
  assignedTo?: string;
  tags?: string[];
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'acknowledgment' | 'response' | 'follow-up' | 'resolution';
}

interface EmailPreviewProps {
  query: CustomerQuery;
  template: EmailTemplate;
  customContent?: string;
  onSend?: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
}

const EmailPreview: React.FC<EmailPreviewProps> = ({
  query,
  template,
  customContent,
  onSend,
  onEdit,
  onCancel
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'closed': return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const processEmailContent = (content: string) => {
    return content
      .replace(/\{customerName\}/g, query.customerName)
      .replace(/\{subject\}/g, query.subject)
      .replace(/\{queryId\}/g, query.id)
      .replace(/\{category\}/g, query.category)
      .replace(/\{assignedTo\}/g, query.assignedTo || 'Support Team')
      .replace(/\{createdDate\}/g, new Date(query.createdAt).toLocaleDateString())
      .replace(/\{originalMessage\}/g, query.message);
  };

  const emailContent = customContent || template.content;
  const processedContent = processEmailContent(emailContent);
  const processedSubject = processEmailContent(template.subject);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Query Information Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Customer Query Details
            </CardTitle>
            <div className="flex items-center gap-2">
              {getStatusIcon(query.status)}
              <Badge variant="outline" className={getPriorityColor(query.priority)}>
                {query.priority.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Customer:</span>
                <span>{query.customerName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Email:</span>
                <span>{query.customerEmail}</span>
              </div>
              {query.customerPhone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Phone:</span>
                  <span>{query.customerPhone}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Created:</span>
                <span>{new Date(query.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Category:</span>
                <Badge variant="secondary">{query.category}</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Query ID:</span>
                <code className="px-2 py-1 bg-gray-100 rounded text-xs">{query.id}</code>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium mb-2">Subject:</h4>
            <p className="text-sm bg-gray-50 p-3 rounded">{query.subject}</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Message:</h4>
            <div className="text-sm bg-gray-50 p-3 rounded max-h-32 overflow-y-auto">
              {query.message}
            </div>
          </div>

          {query.tags && query.tags.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Tags:</h4>
              <div className="flex flex-wrap gap-1">
                {query.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Preview - {template.name}
          </CardTitle>
          <Badge variant="outline" className="w-fit">
            {template.type.charAt(0).toUpperCase() + template.type.slice(1)} Email
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email Headers */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-600">To:</span>
              <span>{query.customerEmail}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-600">From:</span>
              <span>support@company.com</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-600">Subject:</span>
              <span className="font-medium">{processedSubject}</span>
            </div>
          </div>

          {/* Email Body */}
          <div className="border rounded-lg">
            <div className="bg-blue-600 text-white p-4 rounded-t-lg">
              <h3 className="text-lg font-semibold">Customer Support</h3>
              <p className="text-blue-100 text-sm">We're here to help</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: processedContent.replace(/\n/g, '<br>') 
                }}
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-b-lg border-t">
              <div className="text-xs text-gray-600 space-y-1">
                <p>Best regards,</p>
                <p>Customer Support Team</p>
                <p>Company Name | support@company.com | 1-800-SUPPORT</p>
                <Separator className="my-2" />
                <p className="text-xs">
                  This email was sent in response to your query #{query.id}. 
                  If you have any questions, please don't hesitate to contact us.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="outline" onClick={onEdit}>
          Edit Email
        </Button>
        <Button onClick={onSend} className="bg-blue-600 hover:bg-blue-700">
          <Mail className="h-4 w-4 mr-2" />
          Send Email
        </Button>
      </div>

      {/* Email Sending Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-blue-900">Email Automation Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• This email will be automatically logged in the customer's history</li>
                <li>• The query status will be updated based on the email type</li>
                <li>• Customer will receive a copy with tracking for follow-up</li>
                <li>• You can schedule this email to be sent at a specific time</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailPreview;