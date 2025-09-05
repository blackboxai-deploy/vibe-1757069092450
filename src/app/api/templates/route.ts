import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'customer_query' | 'welcome' | 'follow_up' | 'resolution' | 'feedback';
  variables: string[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

const TEMPLATES_FILE = path.join(process.cwd(), 'data', 'templates.json');

async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function getTemplates(): Promise<EmailTemplate[]> {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(TEMPLATES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    const defaultTemplates: EmailTemplate[] = [
      {
        id: '1',
        name: 'Customer Query Acknowledgment',
        subject: 'We received your inquiry - Ticket #{{ticketId}}',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Thank you for contacting us!</h2>
            <p>Dear {{customerName}},</p>
            <p>We have received your inquiry and want to assure you that we're here to help. Your ticket has been assigned the reference number <strong>#{{ticketId}}</strong>.</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #374151;">Your Query Details:</h3>
              <p><strong>Subject:</strong> {{querySubject}}</p>
              <p><strong>Category:</strong> {{queryCategory}}</p>
              <p><strong>Priority:</strong> {{priority}}</p>
              <p><strong>Submitted:</strong> {{submissionDate}}</p>
            </div>

            <p><strong>What happens next?</strong></p>
            <ul>
              <li>Our support team will review your inquiry within {{responseTime}}</li>
              <li>You'll receive updates via email at {{customerEmail}}</li>
              <li>You can track your ticket status using reference #{{ticketId}}</li>
            </ul>

            <p>If you have any additional information or urgent concerns, please reply to this email with your ticket number.</p>
            
            <p>Best regards,<br>
            {{supportAgentName}}<br>
            Customer Support Team<br>
            {{companyName}}</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="font-size: 12px; color: #6b7280;">
              This is an automated response. Please do not reply to this email unless you need to add information to your existing ticket.
            </p>
          </div>
        `,
        type: 'customer_query',
        variables: ['customerName', 'ticketId', 'querySubject', 'queryCategory', 'priority', 'submissionDate', 'responseTime', 'customerEmail', 'supportAgentName', 'companyName'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: '2',
        name: 'Query Follow-up',
        subject: 'Update on your inquiry - Ticket #{{ticketId}}',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Update on Your Support Request</h2>
            <p>Dear {{customerName}},</p>
            <p>We wanted to provide you with an update regarding your support ticket <strong>#{{ticketId}}</strong>.</p>
            
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
              <h3 style="margin-top: 0; color: #1e40af;">Current Status: {{currentStatus}}</h3>
              <p>{{updateMessage}}</p>
            </div>

            <p><strong>Next Steps:</strong></p>
            <p>{{nextSteps}}</p>

            <p><strong>Estimated Resolution:</strong> {{estimatedResolution}}</p>

            <p>If you have any questions or need to provide additional information, please reply to this email with your ticket number #{{ticketId}}.</p>
            
            <p>Thank you for your patience.</p>
            
            <p>Best regards,<br>
            {{supportAgentName}}<br>
            Customer Support Team<br>
            {{companyName}}</p>
          </div>
        `,
        type: 'follow_up',
        variables: ['customerName', 'ticketId', 'currentStatus', 'updateMessage', 'nextSteps', 'estimatedResolution', 'supportAgentName', 'companyName'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: '3',
        name: 'Query Resolution',
        subject: 'Your inquiry has been resolved - Ticket #{{ticketId}}',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">Your Issue Has Been Resolved!</h2>
            <p>Dear {{customerName}},</p>
            <p>Great news! We have successfully resolved your support ticket <strong>#{{ticketId}}</strong>.</p>
            
            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
              <h3 style="margin-top: 0; color: #047857;">Resolution Summary</h3>
              <p><strong>Issue:</strong> {{originalIssue}}</p>
              <p><strong>Solution:</strong> {{resolutionDetails}}</p>
              <p><strong>Resolved by:</strong> {{supportAgentName}}</p>
              <p><strong>Resolution date:</strong> {{resolutionDate}}</p>
            </div>

            <p><strong>Was this helpful?</strong></p>
            <p>We'd love to hear about your experience. Please take a moment to rate our support:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{feedbackUrl}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Rate Our Support</a>
            </div>

            <p>If you experience any further issues related to this ticket, please reply to this email within the next 7 days and we'll reopen your case.</p>
            
            <p>Thank you for choosing {{companyName}}!</p>
            
            <p>Best regards,<br>
            {{supportAgentName}}<br>
            Customer Support Team<br>
            {{companyName}}</p>
          </div>
        `,
        type: 'resolution',
        variables: ['customerName', 'ticketId', 'originalIssue', 'resolutionDetails', 'supportAgentName', 'resolutionDate', 'feedbackUrl', 'companyName'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      },
      {
        id: '4',
        name: 'Feedback Request',
        subject: 'How was our support? - Ticket #{{ticketId}}',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">We Value Your Feedback</h2>
            <p>Dear {{customerName}},</p>
            <p>We hope your recent support experience with ticket <strong>#{{ticketId}}</strong> met your expectations.</p>
            
            <p>Your feedback helps us improve our service and better assist customers like you in the future.</p>

            <div style="background-color: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #6b21a8;">Quick Survey</h3>
              <p>Please take 2 minutes to share your experience:</p>
              
              <div style="text-align: center; margin: 20px 0;">
                <a href="{{surveyUrl}}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Take Survey</a>
              </div>
            </div>

            <p><strong>What we'd like to know:</strong></p>
            <ul>
              <li>How satisfied were you with our response time?</li>
              <li>Did we resolve your issue completely?</li>
              <li>How would you rate our support agent's helpfulness?</li>
              <li>Any suggestions for improvement?</li>
            </ul>

            <p>As a thank you for your time, you'll be entered into our monthly drawing for a {{incentive}}!</p>
            
            <p>Thank you for being a valued customer.</p>
            
            <p>Best regards,<br>
            Customer Experience Team<br>
            {{companyName}}</p>
          </div>
        `,
        type: 'feedback',
        variables: ['customerName', 'ticketId', 'surveyUrl', 'incentive', 'companyName'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      }
    ];
    
    await fs.writeFile(TEMPLATES_FILE, JSON.stringify(defaultTemplates, null, 2));
    return defaultTemplates;
  }
}

async function saveTemplates(templates: EmailTemplate[]) {
  await ensureDataDirectory();
  await fs.writeFile(TEMPLATES_FILE, JSON.stringify(templates, null, 2));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const active = searchParams.get('active');

    let templates = await getTemplates();

    if (type) {
      templates = templates.filter(template => template.type === type);
    }

    if (active === 'true') {
      templates = templates.filter(template => template.isActive);
    }

    return NextResponse.json({
      success: true,
      data: templates,
      count: templates.length
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, subject, content, type, variables } = body;

    if (!name || !subject || !content || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const templates = await getTemplates();
    const newTemplate: EmailTemplate = {
      id: Date.now().toString(),
      name,
      subject,
      content,
      type,
      variables: variables || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };

    templates.push(newTemplate);
    await saveTemplates(templates);

    return NextResponse.json({
      success: true,
      data: newTemplate,
      message: 'Template created successfully'
    });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create template' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, subject, content, type, variables, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const templates = await getTemplates();
    const templateIndex = templates.findIndex(template => template.id === id);

    if (templateIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    templates[templateIndex] = {
      ...templates[templateIndex],
      name: name || templates[templateIndex].name,
      subject: subject || templates[templateIndex].subject,
      content: content || templates[templateIndex].content,
      type: type || templates[templateIndex].type,
      variables: variables || templates[templateIndex].variables,
      isActive: isActive !== undefined ? isActive : templates[templateIndex].isActive,
      updatedAt: new Date().toISOString()
    };

    await saveTemplates(templates);

    return NextResponse.json({
      success: true,
      data: templates[templateIndex],
      message: 'Template updated successfully'
    });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update template' },
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
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const templates = await getTemplates();
    const filteredTemplates = templates.filter(template => template.id !== id);

    if (filteredTemplates.length === templates.length) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    await saveTemplates(filteredTemplates);

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}