import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface CustomerQuery {
  id: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  message: string;
  category: 'general' | 'technical' | 'billing' | 'product' | 'complaint';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'acknowledged' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  responseTemplate?: string;
  autoResponseSent: boolean;
  followUpScheduled?: string;
}

interface AutoResponseTemplate {
  id: string;
  category: string;
  subject: string;
  template: string;
  delay: number;
}

const dataDir = path.join(process.cwd(), 'data');
const queriesFile = path.join(dataDir, 'queries.json');
const templatesFile = path.join(dataDir, 'response-templates.json');

async function ensureDataDirectory() {
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function readQueries(): Promise<CustomerQuery[]> {
  try {
    const data = await fs.readFile(queriesFile, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeQueries(queries: CustomerQuery[]): Promise<void> {
  await ensureDataDirectory();
  await fs.writeFile(queriesFile, JSON.stringify(queries, null, 2));
}

async function readTemplates(): Promise<AutoResponseTemplate[]> {
  try {
    const data = await fs.readFile(templatesFile, 'utf-8');
    return JSON.parse(data);
  } catch {
    const defaultTemplates: AutoResponseTemplate[] = [
      {
        id: '1',
        category: 'general',
        subject: 'Thank you for contacting us - We\'ve received your inquiry',
        template: `Dear {{customerName}},

Thank you for reaching out to us. We have received your inquiry regarding "{{subject}}" and our team will review it shortly.

Your query ID is: {{queryId}}

We typically respond to general inquiries within 24-48 hours. If your matter is urgent, please don't hesitate to call our support line.

Best regards,
Customer Support Team`,
        delay: 0
      },
      {
        id: '2',
        category: 'technical',
        subject: 'Technical Support - Your request has been received',
        template: `Dear {{customerName}},

We've received your technical support request about "{{subject}}".

Query ID: {{queryId}}

Our technical team has been notified and will investigate your issue. We aim to provide initial feedback within 4-6 hours for technical matters.

In the meantime, you might find our knowledge base helpful: [Knowledge Base Link]

Technical Support Team`,
        delay: 0
      },
      {
        id: '3',
        category: 'billing',
        subject: 'Billing Inquiry Received - We\'re here to help',
        template: `Dear {{customerName}},

Thank you for contacting us regarding your billing inquiry: "{{subject}}".

Query ID: {{queryId}}

Our billing department will review your account and respond within 24 hours. For immediate billing concerns, please have your account number ready when calling our billing hotline.

Billing Support Team`,
        delay: 0
      },
      {
        id: '4',
        category: 'product',
        subject: 'Product Inquiry - Thank you for your interest',
        template: `Dear {{customerName}},

Thank you for your product inquiry about "{{subject}}".

Query ID: {{queryId}}

Our product specialists will provide you with detailed information within 24 hours. We're excited to help you find the perfect solution for your needs.

Product Team`,
        delay: 0
      },
      {
        id: '5',
        category: 'complaint',
        subject: 'Your Feedback is Important - Complaint Acknowledged',
        template: `Dear {{customerName}},

We sincerely apologize for any inconvenience you've experienced. Your complaint regarding "{{subject}}" has been received and is being treated with high priority.

Query ID: {{queryId}}

A senior customer service representative will personally review your case and contact you within 2 hours. Your feedback helps us improve our service.

Senior Customer Service Team`,
        delay: 0
      }
    ];
    
    await ensureDataDirectory();
    await fs.writeFile(templatesFile, JSON.stringify(defaultTemplates, null, 2));
    return defaultTemplates;
  }
}

async function sendAutoResponse(query: CustomerQuery): Promise<void> {
  const templates = await readTemplates();
  const template = templates.find(t => t.category === query.category);
  
  if (!template) return;

  const personalizedSubject = template.subject.replace(/{{(\w+)}}/g, (match, key) => {
    switch (key) {
      case 'customerName': return query.customerName;
      case 'subject': return query.subject;
      case 'queryId': return query.id;
      default: return match;
    }
  });

  const personalizedMessage = template.template.replace(/{{(\w+)}}/g, (match, key) => {
    switch (key) {
      case 'customerName': return query.customerName;
      case 'subject': return query.subject;
      case 'queryId': return query.id;
      default: return match;
    }
  });

  console.log(`Auto-response sent to ${query.customerEmail}:`);
  console.log(`Subject: ${personalizedSubject}`);
  console.log(`Message: ${personalizedMessage}`);
}

async function scheduleFollowUp(query: CustomerQuery): Promise<void> {
  const followUpDelay = {
    'low': 7 * 24 * 60 * 60 * 1000,
    'medium': 3 * 24 * 60 * 60 * 1000,
    'high': 24 * 60 * 60 * 1000,
    'urgent': 2 * 60 * 60 * 1000
  };

  const followUpDate = new Date(Date.now() + followUpDelay[query.priority]);
  query.followUpScheduled = followUpDate.toISOString();
  
  console.log(`Follow-up scheduled for ${query.customerEmail} on ${followUpDate.toLocaleString()}`);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    
    let queries = await readQueries();
    
    if (status) {
      queries = queries.filter(q => q.status === status);
    }
    
    if (category) {
      queries = queries.filter(q => q.category === category);
    }
    
    if (priority) {
      queries = queries.filter(q => q.priority === priority);
    }
    
    queries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return NextResponse.json({ queries, total: queries.length });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch queries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, customerEmail, subject, message, category, priority } = body;
    
    if (!customerName || !customerEmail || !subject || !message || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const queries = await readQueries();
    
    const newQuery: CustomerQuery = {
      id: `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerName,
      customerEmail,
      subject,
      message,
      category,
      priority: priority || 'medium',
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      autoResponseSent: false
    };
    
    queries.push(newQuery);
    await writeQueries(queries);
    
    await sendAutoResponse(newQuery);
    newQuery.autoResponseSent = true;
    
    await scheduleFollowUp(newQuery);
    
    await writeQueries(queries);
    
    return NextResponse.json({ 
      message: 'Query submitted successfully',
      query: newQuery,
      autoResponseSent: true
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create query' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, assignedTo, responseTemplate } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Query ID is required' },
        { status: 400 }
      );
    }
    
    const queries = await readQueries();
    const queryIndex = queries.findIndex(q => q.id === id);
    
    if (queryIndex === -1) {
      return NextResponse.json(
        { error: 'Query not found' },
        { status: 404 }
      );
    }
    
    if (status) queries[queryIndex].status = status;
    if (assignedTo) queries[queryIndex].assignedTo = assignedTo;
    if (responseTemplate) queries[queryIndex].responseTemplate = responseTemplate;
    
    queries[queryIndex].updatedAt = new Date().toISOString();
    
    await writeQueries(queries);
    
    return NextResponse.json({ 
      message: 'Query updated successfully',
      query: queries[queryIndex]
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update query' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Query ID is required' },
        { status: 400 }
      );
    }
    
    const queries = await readQueries();
    const filteredQueries = queries.filter(q => q.id !== id);
    
    if (queries.length === filteredQueries.length) {
      return NextResponse.json(
        { error: 'Query not found' },
        { status: 404 }
      );
    }
    
    await writeQueries(filteredQueries);
    
    return NextResponse.json({ message: 'Query deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete query' },
      { status: 500 }
    );
  }
}