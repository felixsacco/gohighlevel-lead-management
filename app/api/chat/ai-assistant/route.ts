import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  'https://jismdkfjkngwbpddhomx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A'
);

// Common responses database
const AI_RESPONSES = {
  // General Support
  'hello': {
    response: "Hello! I'm the MyApproved AI Assistant. I'm here to help you with common questions about our platform. How can I assist you today?",
    category: 'greeting'
  },
  'help': {
    response: "I can help you with:\n• Job posting and applications\n• Payment and disputes\n• Account issues\n• Platform navigation\n\nWhat specific area would you like help with?",
    category: 'general'
  },
  
  // Job-related queries
  'job': {
    response: "Job Help Available:\n• How to post a job\n• Finding the right tradesperson\n• Managing job applications\n• Job completion process\n\nWhat would you like to know about jobs?",
    category: 'jobs'
  },
  'post job': {
    response: "How to Post a Job:\n\n1. Go to your dashboard - Click the dashboard link\n2. Click 'Post New Job' - Big button on your dashboard\n3. Fill in details:\n   • Select trade (Plumber, Electrician, etc.)\n   • Describe the work needed\n   • Set your budget\n   • Add your postcode\n4. Submit for approval - Jobs are reviewed for quality\n\nApproval time: 2-4 hours\nThen: Tradespeople will apply with quotes\n\nNeed help with any specific step?",
    category: 'jobs'
  },
  'how do i post a job': {
    response: "How to Post a Job:\n\n1. Go to your dashboard - Click the dashboard link\n2. Click 'Post New Job' - Big button on your dashboard\n3. Fill in details:\n   • Select trade (Plumber, Electrician, etc.)\n   • Describe the work needed\n   • Set your budget\n   • Add your postcode\n4. Submit for approval - Jobs are reviewed for quality\n\nApproval time: 2-4 hours\nThen: Tradespeople will apply with quotes\n\nNeed help with any specific step?",
    category: 'jobs'
  },
  'application': {
    response: "Job Applications:\n• Check your dashboard for new applications\n• Review tradesperson profiles and quotes\n• Accept the best candidate\n• Start chatting with your chosen tradesperson\n\nNeed help choosing the right tradesperson?",
    category: 'jobs'
  },
  
  // Payment & Disputes  
  'payment': {
    response: "Payment & Billing Help:\n\nHow payments work:\n• Pay securely through our platform\n• Payment released when job is completed\n• Full protection for all transactions\n\nPayment methods:\n• Credit/Debit cards\n• Bank transfers\n• Secure online payment\n\nBilling issues:\n• Refunds available for unsatisfactory work\n• Dispute resolution if needed\n• 24/7 payment support\n\nWhat specific payment question do you have?",
    category: 'payment'
  },
  'payment and billing help': {
    response: "Payment & Billing Help:\n\nHow payments work:\n• Pay securely through our platform\n• Payment released when job is completed\n• Full protection for all transactions\n\nPayment methods:\n• Credit/Debit cards\n• Bank transfers\n• Secure online payment\n\nBilling issues:\n• Refunds available for unsatisfactory work\n• Dispute resolution if needed\n• 24/7 payment support\n\nWhat specific payment question do you have?",
    category: 'payment'
  },
  'dispute': {
    response: "Dispute Resolution:\n• Flag any job with issues using the 'Flag Issue' button\n• Our support team reviews all flagged jobs\n• Resolution typically within 2-4 hours\n• Full refund protection available\n\nWould you like to report a specific issue?",
    category: 'dispute'
  },
  'refund': {
    response: "Refund Policy:\n• Full refunds available for unsatisfactory work\n• Use the dispute system to report issues\n• Our team will investigate and resolve within 4 hours\n• Protection covers all payments made through MyApproved\n\nDo you need to report a specific issue?",
    category: 'dispute'
  },
  
  // Account Issues
  'account': {
    response: "Account Help:\n• Profile updates\n• Verification status\n• Password reset\n• Account settings\n\nWhat account issue are you experiencing?",
    category: 'account'
  },
  'verification': {
    response: "Account Verification:\n• Upload ID and relevant trade certificates\n• Verification typically takes 24-48 hours\n• Verified accounts get priority in job applications\n• Check your dashboard for verification status\n\nNeed help with specific documents?",
    category: 'account'
  },
  'account verification help': {
    response: "Account Verification Help:\n\nWhat you need:\n• Government-issued ID (passport, driving license)\n• Proof of trade qualifications\n• Insurance certificates (for tradespeople)\n• Proof of address\n\nHow to upload:\n1. Go to your dashboard\n2. Click 'Account Settings'\n3. Upload documents in 'Verification' section\n4. Wait 24-48 hours for review\n\nBenefits:\n• Higher trust rating\n• Priority in job applications\n• Access to premium features\n\nNeed help with specific documents?",
    category: 'account'
  },
  'how to find tradespeople': {
    response: "How to Find Tradespeople:\n\nPost a job first:\n1. Create a job posting\n2. Tradespeople will apply with quotes\n3. Review their profiles and ratings\n\nWhat to look for:\n• High ratings and reviews\n• Verified accounts\n• Relevant experience\n• Fair pricing\n• Quick response time\n\nTips:\n• Compare multiple quotes\n• Check previous work photos\n• Read customer reviews\n• Ask questions before hiring\n\nReady to post your first job?",
    category: 'jobs'
  },
  'contact human support': {
    response: "Human Support Available:\n\nContact options:\n• Live chat escalation (that's me!)\n• Email support team\n• Phone support available\n\nResponse times:\n• Chat escalation: 2-4 hours\n• Email: Within 24 hours\n• Urgent issues: 1 hour\n\nI'm escalating your request now to our human support team. They will contact you within 2-4 hours.\n\nIs there anything specific I can help with while you wait?",
    category: 'escalation',
    escalate: true
  },
  'password': {
    response: "Password Help:\n• Use 'Forgot Password' on the login page\n• Check your email for reset instructions\n• Create a strong password with 8+ characters\n• Contact support if you don't receive the email\n\nStill having trouble logging in?",
    category: 'account'
  },
  
  // Quality & Trust
  'quality': {
    response: "Quality Assurance:\n• All tradespeople are verified and background-checked\n• Real customer reviews and ratings\n• Insurance protection on all jobs\n• 24/7 support available\n\nWhat quality concerns do you have?",
    category: 'quality'
  },
  'trust': {
    response: "Trust & Safety:\n• Identity verification for all users\n• Secure payment processing\n• Full insurance coverage\n• 24/7 monitoring and support\n\nYour safety and satisfaction are our top priorities!",
    category: 'quality'
  },
  
  // Contact & Escalation
  'human': {
    response: "Human Support:\n• Our support team is available 24/7\n• Average response time: 2-4 hours\n• Priority support for urgent issues\n• Live chat escalation available\n\nI'm escalating your query to our human support team now. They will respond within 2-4 hours.",
    category: 'escalation',
    escalate: true
  },
  'urgent': {
    response: "Urgent Support:\n• Flagging this as urgent for immediate attention\n• Our support team will contact you within 1 hour\n• Emergency support available for critical issues\n\nI'm escalating your urgent query now. Expect contact within 1 hour.",
    category: 'escalation',
    escalate: true,
    priority: 'urgent'
  },
  'support': {
    response: "Professional Support:\n• AI assistance for common questions (that's me!)\n• Human support team for complex issues\n• Average resolution time: 2-4 hours\n• Full dispute resolution process\n\nWould you like me to escalate to human support?",
    category: 'escalation'
  }
};

// Keywords to response mapping
const KEYWORD_PATTERNS = [
  { keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon'], response: 'hello' },
  { keywords: ['help', 'assist', 'support'], response: 'help' },
  
  // Specific question matching first (more specific patterns)
  { keywords: ['how do i post a job', 'how to post a job', 'post a job'], response: 'how do i post a job' },
  { keywords: ['payment and billing help', 'billing help', 'payment help'], response: 'payment and billing help' },
  { keywords: ['account verification help', 'verification help', 'verify account'], response: 'account verification help' },
  { keywords: ['how to find tradespeople', 'find tradespeople', 'find tradesman'], response: 'how to find tradespeople' },
  { keywords: ['contact human support', 'human support', 'real person'], response: 'contact human support' },
  
  // General patterns (less specific)
  { keywords: ['job', 'work', 'task'], response: 'job' },
  { keywords: ['post', 'create', 'submit', 'new job'], response: 'post job' },
  { keywords: ['application', 'apply', 'quote', 'bid'], response: 'application' },
  { keywords: ['payment', 'pay', 'money', 'cost', 'price'], response: 'payment' },
  { keywords: ['dispute', 'problem', 'issue', 'complaint', 'wrong'], response: 'dispute' },
  { keywords: ['refund', 'money back', 'return'], response: 'refund' },
  { keywords: ['account', 'profile', 'settings'], response: 'account' },
  { keywords: ['verification', 'verify', 'documents', 'ID'], response: 'verification' },
  { keywords: ['password', 'login', 'access', 'forgot'], response: 'password' },
  { keywords: ['quality', 'good', 'professional'], response: 'quality' },
  { keywords: ['trust', 'safe', 'security', 'protect'], response: 'trust' },
  { keywords: ['human', 'person', 'real support', 'agent'], response: 'human' },
  { keywords: ['urgent', 'emergency', 'asap', 'immediately'], response: 'urgent' },
  { keywords: ['contact', 'phone', 'email', 'reach'], response: 'support' },
];

function findBestResponse(message: string): string {
  const lowerMessage = message.toLowerCase().trim();
  
  // First try exact matches for better accuracy
  for (const pattern of KEYWORD_PATTERNS) {
    for (const keyword of pattern.keywords) {
      if (lowerMessage === keyword.toLowerCase() || lowerMessage.includes(keyword.toLowerCase())) {
        console.log(`Matched "${message}" to response: ${pattern.response}`);
        return pattern.response;
      }
    }
  }
  
  console.log(`No match found for "${message}", using default help response`);
  // Default response for unmatched queries
  return 'help';
}

export async function POST(request: NextRequest) {
  try {
    const { message, chatRoomId, userId, userType } = await request.json();

    if (!message || !chatRoomId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find the best AI response
    const responseKey = findBestResponse(message);
    const aiResponse = AI_RESPONSES[responseKey] || AI_RESPONSES['help'];

    // Send AI response message
    const { data: responseMessage, error: insertError } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        chat_room_id: chatRoomId,
        sender_id: '00000000-0000-0000-0000-000000000002',
        sender_type: 'support',
        message_text: aiResponse.response
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting AI response:', insertError);
      return NextResponse.json({ error: 'Failed to send AI response' }, { status: 500 });
    }

    // Update chat room timestamp
    await supabaseAdmin
      .from('chat_rooms')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatRoomId);

    // If escalation is needed, create a support ticket
    if (aiResponse.escalate) {
      await supabaseAdmin
        .from('support_tickets')
        .insert({
          user_id: userId,
          user_type: userType,
          chat_room_id: chatRoomId,
          original_message: message,
          ai_response: aiResponse.response,
          category: aiResponse.category,
          priority: aiResponse.priority || 'normal',
          status: 'open'
        });
    }

    return NextResponse.json({
      success: true,
      message: responseMessage,
      escalated: aiResponse.escalate || false,
      category: aiResponse.category
    });

  } catch (error) {
    console.error('Error in AI assistant API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
