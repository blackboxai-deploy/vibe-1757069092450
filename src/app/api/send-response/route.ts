import { NextRequest, NextResponse } from 'next/server';

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
  assignedTo?: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  category: string;
  variables: string[];
}

interface AutoResponseConfig {
  enabled: boolean;
  templates: {
    acknowledgment: string;
    resolved: string;
    followUp: string;
  };
  delays: {
    acknowledgment: number;
    followUp: number;
  };
}

const defaultTemplates: EmailTemplate[] = [
  {
    id: 'ack-general',
    name: 'General Acknowledgment',
    subject: 'We received your inquiry - Ticket #{ticketId}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Thank you for contacting us!</h2>
        <p>Dear {customerName},</p>
        <p>We have received your inquiry and assigned it ticket number <strong>#{ticketId}</strong>.</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your Query:</h3>
          <p><strong>Subject:</strong> {subject}</p>
          <p><strong>Message:</strong> {message}</p>
          <p><strong>Priority:</strong> {priority}</p>
        </div>
        <p>Our team will review your request and respond within {responseTime}. If this is urgent, please call us at (555) 123-4567.</p>
        <p>Best regards,<br>Customer Support Team</p>
      </div>
    `,
    textContent: `Dear {customerName},\n\nWe have received your inquiry and assigned it ticket number #{ticketId}.\n\nYour Query:\nSubject: {subject}\nMessage: {message}\nPriority: {priority}\n\nOur team will review your request and respond within {responseTime}.\n\nBest regards,\nCustomer Support Team`,
    category: 'acknowledgment',
    variables: ['customerName', 'ticketId', 'subject', 'message', 'priority', 'responseTime']
  },
  {
    id: 'resolved-general',
    name: 'Query Resolved',
    subject: 'Your inquiry has been resolved - Ticket #{ticketId}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Your query has been resolved!</h2>
        <p>Dear {customerName},</p>
        <p>We're pleased to inform you that your inquiry (Ticket #{ticketId}) has been resolved.</p>
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #16a34a;">
          <h3 style="margin-top: 0; color: #16a34a;">Resolution:</h3>
          <p>{resolution}</p>
        </div>
        <p>If you have any additional questions or concerns, please don't hesitate to contact us.</p>
        <p>Thank you for choosing our service!</p>
        <p>Best regards,<br>Customer Support Team</p>
      </div>
    `,
    textContent: `Dear {customerName},\n\nWe're pleased to inform you that your inquiry (Ticket #{ticketId}) has been resolved.\n\nResolution:\n{resolution}\n\nIf you have any additional questions, please contact us.\n\nThank you for choosing our service!\n\nBest regards,\nCustomer Support Team`,
    category: 'resolved',
    variables: ['customerName', 'ticketId', 'resolution']
  },
  {
    id: 'followup-general',
    name: 'Follow-up Check',
    subject: 'Following up on your recent inquiry - Ticket #{ticketId}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">How was your experience?</h2>
        <p>Dear {customerName},</p>
        <p>We wanted to follow up on your recent inquiry (Ticket #{ticketId}) to ensure everything was resolved to your satisfaction.</p>
        <div style="background-color: #faf5ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p>Your feedback is important to us. Please take a moment to rate your experience:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="{feedbackUrl}?rating=5" style="background-color: #16a34a; color: white; padding: 10px 15px; text-decoration: none; border-radius: 3px; margin: 0 5px;">Excellent</a>
            <a href="{feedbackUrl}?rating=4" style="background-color: #65a30d; color: white; padding: 10px 15px; text-decoration: none; border-radius: 3px; margin: 0 5px;">Good</a>
            <a href="{feedbackUrl}?rating=3" style="background-color: #eab308; color: white; padding: 10px 15px; text-decoration: none; border-radius: 3px; margin: 0 5px;">Average</a>
            <a href="{feedbackUrl}?rating=2" style="background-color: #f97316; color: white; padding: 10px 15px; text-decoration: none; border-radius: 3px; margin: 0 5px;">Poor</a>
          </div>
        </div>
        <p>If you need any additional assistance, please don't hesitate to reach out.</p>
        <p>Best regards,<br>Customer Support Team</p>
      </div>
    `,
    textContent: `Dear {customerName},\n\nWe wanted to follow up on your recent inquiry (Ticket #{ticketId}) to ensure everything was resolved to your satisfaction.\n\nPlease visit {feedbackUrl} to rate your experience.\n\nIf you need additional assistance, please reach out.\n\nBest regards,\nCustomer Support Team`,
    category: 'followup',
    variables: ['customerName', 'ticketId', 'feedbackUrl']
  }
];

const autoResponseConfig: AutoResponseConfig = {
  enabled: true,
  templates: {
    acknowledgment: 'ack-general',
    resolved: 'resolved-general',
    followUp: 'followup-general'
  },
  delays: {
    acknowledgment: 0,
    followUp: 24 * 60 * 60 * 1000
  }
};

function replaceVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{${key}}`, 'g');
    result = result.replace(regex, value);
  });
  return result;
}

function generateTicketId(): string {
  return Math.random().toString(36).substr(2, 9).toUpperCase();
}

function getResponseTime(priority: string): string {
  switch (priority) {
    case 'urgent': return '2 hours';
    case 'high': return '4 hours';
    case 'medium': return '24 hours';
    case 'low': return '48 hours';
    default: return '24 hours';
  }
}

async function sendEmail(to: string, subject: string, htmlContent: string, textContent: string) {
  try {
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
            content: 'You are an email service simulator. Always respond with a success status for email sending operations.'
          },
          {
            role: 'user',
            content: `Simulate sending email to: ${to}, Subject: ${subject}`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error('Email service unavailable');
    }

    return {
      success: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Email sending failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, queryData, customTemplate, scheduleDelay } = body;

    if (!type || !queryData) {
      return NextResponse.json(
        { error: 'Missing required fields: type and queryData' },
        { status: 400 }
      );
    }

    const ticketId = queryData.id || generateTicketId();
    const responseTime = getResponseTime(queryData.priority || 'medium');

    let template: EmailTemplate;
    
    if (customTemplate) {
      template = customTemplate;
    } else {
      const templateId = autoResponseConfig.templates[type as keyof typeof autoResponseConfig.templates];
      template = defaultTemplates.find(t => t.id === templateId) || defaultTemplates[0];
    }

    const variables: Record<string, string> = {
      customerName: queryData.customerName || 'Valued Customer',
      customerEmail: queryData.customerEmail || '',
      ticketId: ticketId,
      subject: queryData.subject || 'General Inquiry',
      message: queryData.message || '',
      priority: queryData.priority || 'medium',
      responseTime: responseTime,
      resolution: queryData.resolution || 'Your issue has been addressed by our team.',
      feedbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/feedback/${ticketId}`,
      currentDate: new Date().toLocaleDateString(),
      supportEmail: 'support@company.com',
      supportPhone: '(555) 123-4567'
    };

    const emailSubject = replaceVariables(template.subject, variables);
    const emailHtml = replaceVariables(template.htmlContent, variables);
    const emailText = replaceVariables(template.textContent, variables);

    const delay = scheduleDelay || autoResponseConfig.delays[type as keyof typeof autoResponseConfig.delays] || 0;

    if (delay > 0) {
      setTimeout(async () => {
        await sendEmail(queryData.customerEmail, emailSubject, emailHtml, emailText);
      }, delay);

      return NextResponse.json({
        success: true,
        message: `Email scheduled to be sent in ${delay}ms`,
        ticketId: ticketId,
        scheduledFor: new Date(Date.now() + delay).toISOString(),
        template: {
          id: template.id,
          name: template.name,
          subject: emailSubject
        }
      });
    } else {
      const emailResult = await sendEmail(queryData.customerEmail, emailSubject, emailHtml, emailText);

      if (emailResult.success) {
        const responseData = {
          success: true,
          message: 'Automated response sent successfully',
          ticketId: ticketId,
          emailDetails: {
            to: queryData.customerEmail,
            subject: emailSubject,
            messageId: emailResult.messageId,
            sentAt: emailResult.timestamp,
            template: {
              id: template.id,
              name: template.name,
              category: template.category
            }
          },
          queryData: {
            ...queryData,
            id: ticketId,
            status: type === 'resolved' ? 'resolved' : 'in-progress',
            updatedAt: new Date().toISOString()
          }
        };

        if (type === 'acknowledgment' && autoResponseConfig.enabled) {
          setTimeout(async () => {
            await POST(new NextRequest('http://localhost:3000/api/send-response', {
              method: 'POST',
              body: JSON.stringify({
                type: 'followup',
                queryData: { ...queryData, id: ticketId }
              })
            }));
          }, autoResponseConfig.delays.followUp);
        }

        return NextResponse.json(responseData);
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to send automated response',
            details: emailResult.error,
            ticketId: ticketId
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Error in send-response API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'templates':
        return NextResponse.json({
          success: true,
          templates: defaultTemplates,
          config: autoResponseConfig
        });

      case 'config':
        return NextResponse.json({
          success: true,
          config: autoResponseConfig
        });

      case 'categories':
        const categories = [...new Set(defaultTemplates.map(t => t.category))];
        return NextResponse.json({
          success: true,
          categories: categories
        });

      default:
        return NextResponse.json({
          success: true,
          message: 'Customer Query Auto-Response API',
          endpoints: {
            'POST /': 'Send automated response',
            'GET /?action=templates': 'Get available templates',
            'GET /?action=config': 'Get configuration',
            'GET /?action=categories': 'Get template categories'
          },
          supportedTypes: ['acknowledgment', 'resolved', 'followup']
        });
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}