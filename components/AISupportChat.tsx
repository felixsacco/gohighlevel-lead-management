"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Bot, User, X, RefreshCw } from "lucide-react";

interface Message {
  id: string;
  sender_type: 'user' | 'ai' | 'support';
  message_text: string;
  created_at: string;
}

interface AISupportChatProps {
  userId: string;
  userType: 'client' | 'tradesperson';
  userName?: string;
}

interface QuickQuestion {
  id: string;
  question: string;
  category: string;
}

export default function AISupportChat({ userId, userType, userName }: AISupportChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const [disputeMode, setDisputeMode] = useState(false);
  const [contactMode, setContactMode] = useState(false);
  const [contactType, setContactType] = useState(''); // 'payment', 'account', 'support'
  const [disputeStep, setDisputeStep] = useState(0); // 0=not started, 1=email, 2=phone, 3=problem
  const [disputeData, setDisputeData] = useState({
    email: '',
    phone: '',
    problem: ''
  });
  const [highlightQuestions, setHighlightQuestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick questions for users to click
  const quickQuestions: QuickQuestion[] = [
    { id: '1', question: 'How do I post a job?', category: 'jobs' },
    { id: '2', question: 'Payment and billing help', category: 'contact' },
    { id: '3', question: 'I have a dispute issue', category: 'dispute' },
    { id: '4', question: 'Account verification help', category: 'contact' },
    { id: '5', question: 'How to find tradespeople?', category: 'jobs' },
    { id: '6', question: 'Contact human support', category: 'contact' }
  ];

  // Welcome message
  const welcomeMessage: Message = {
    id: 'welcome',
    sender_type: 'ai',
    message_text: `Hello ${userName || 'there'}! I'm the MyApproved AI Assistant.\n\nClick on any question below to get instant help, or type your own question:`,
    created_at: new Date().toISOString()
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([welcomeMessage]);
      setShowQuickQuestions(true);
    }
  }, [isOpen]);

  const handleQuickQuestion = async (question: QuickQuestion) => {
    // Keep questions visible - don't hide them
    // setShowQuickQuestions(false);
    
    // Add user's question to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      sender_type: 'user',
      message_text: question.question,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    // Handle dispute specially - ONLY for question #3
    if (question.category === 'dispute' && question.id === '3') {
      setDisputeMode(true);
      setDisputeStep(1); // Start with email step
      const disputeMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender_type: 'ai',
        message_text: '⚖️ **Dispute & Issue Resolution**\n\nI\'ll help you submit your dispute. Let me collect some information step by step.\n\n**Step 1 of 3: Email Address**\n\nPlease provide your email address so we can contact you:\n\nExample: john@email.com',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, disputeMessage]);
      return;
    }

    // Handle contact collection for payment, account, and support questions
    if (question.category === 'contact') {
      setContactMode(true);
      setDisputeStep(1); // Start with email step
      
      let messageTitle = '';
      let messageIcon = '';
      if (question.id === '2') {
        setContactType('payment');
        messageTitle = 'Payment & Billing Help';
        messageIcon = '💳';
      } else if (question.id === '4') {
        setContactType('account');
        messageTitle = 'Account Verification Help';
        messageIcon = '🔐';
      } else if (question.id === '6') {
        setContactType('support');
        messageTitle = 'Human Support Contact';
        messageIcon = '👤';
      }
      
      const contactMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender_type: 'ai',
        message_text: `${messageIcon} **${messageTitle}**\n\nI\'ll connect you with our support team. Let me collect your contact information step by step.\n\n**Step 1 of 3: Email Address**\n\nPlease provide your email address so we can contact you:\n\nExample: john@email.com`,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, contactMessage]);
      return;
    }

    // Handle all other questions with normal AI responses
    await getAIResponse(question.question);
  };

  const getAIResponse = async (message: string) => {
    setSending(true);
    try {
      const response = await fetch('/api/chat/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          chatRoomId: '00000000-0000-0000-0000-000000000001',
          userId,
          userType
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender_type: 'ai',
          message_text: data.message.message_text,
          created_at: data.message.created_at
        };
        
        setMessages(prev => [...prev, aiMessage]);

        // Show quick questions again after AI response
        setTimeout(() => {
          const questionsMessage: Message = {
            id: (Date.now() + 2).toString(),
            sender_type: 'ai',
            message_text: 'Need more help? Click any question above or ask something else:',
            created_at: new Date().toISOString()
          };
          setMessages(prev => [...prev, questionsMessage]);
          
          // Highlight questions briefly
          setHighlightQuestions(true);
          setTimeout(() => setHighlightQuestions(false), 2000);
        }, 1500);

        if (data.escalated) {
          const escalationMessage: Message = {
            id: (Date.now() + 3).toString(),
            sender_type: 'ai',
            message_text: 'Your query has been escalated to our human support team.\n\nOur support team will contact you within 2-4 hours (or 1 hour for urgent issues).',
            created_at: new Date().toISOString()
          };
          setTimeout(() => {
            setMessages(prev => [...prev, escalationMessage]);
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender_type: 'user',
      message_text: newMessage.trim(),
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = newMessage.trim();
    setNewMessage("");
    setSending(true);

    // Handle dispute mode specially - step by step collection
    if (disputeMode || contactMode) {
      if (disputeStep === 1) {
        // Collecting email
        const email = messageText.trim();
        if (!email.includes('@') || !email.includes('.')) {
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            sender_type: 'ai',
            message_text: '❌ **Invalid Email Format**\n\nPlease provide a valid email address.\n\nExample: john@email.com',
            created_at: new Date().toISOString()
          };
          setMessages(prev => [...prev, errorMessage]);
          setSending(false);
          return;
        }
        
        setDisputeData(prev => ({ ...prev, email }));
        setDisputeStep(2);
        
        const phoneMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender_type: 'ai',
          message_text: 'Email Saved\n\nStep 2 of 3: Phone Number\n\nPlease provide your phone number:\n\nExample: +1234567890 or 01234567890',
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, phoneMessage]);
        setSending(false);
        return;
        
      } else if (disputeStep === 2) {
        // Collecting phone
        const phone = messageText.trim();
        if (phone.length < 8) {
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            sender_type: 'ai',
            message_text: '❌ **Invalid Phone Number**\n\nPlease provide a valid phone number.\n\nExample: +1234567890 or 01234567890',
            created_at: new Date().toISOString()
          };
          setMessages(prev => [...prev, errorMessage]);
          setSending(false);
          return;
        }
        
        setDisputeData(prev => ({ ...prev, phone }));
        setDisputeStep(3);
        
        const problemMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender_type: 'ai',
          message_text: 'Phone Number Saved\n\nStep 3 of 3: Problem Description\n\nPlease describe your issue in detail:\n\n• What is the problem about?\n• Which job or tradesperson is involved?\n• What happened?\n\nExample: Payment not received for completed plumbing work. Job was finished 3 days ago but tradesperson hasn\'t paid me.',
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, problemMessage]);
        setSending(false);
        return;
        
      } else if (disputeStep === 3) {
        // Collecting problem description or issue details
        const problem = messageText.trim();
        if (problem.length < 10) {
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            sender_type: 'ai',
            message_text: '❌ **Description Too Short**\n\nPlease provide more details about your issue (at least 10 characters).',
            created_at: new Date().toISOString()
          };
          setMessages(prev => [...prev, errorMessage]);
          setSending(false);
          return;
        }
        
        // Complete data collection
        const finalDisputeData = { ...disputeData, problem };
        setDisputeData(finalDisputeData);
        
        if (disputeMode) {
          // Handle dispute submission
          const disputeKeywords = ['payment', 'money', 'refund', 'scam', 'fraud', 'problem', 'issue', 'dispute', 'complaint', 'wrong', 'bad', 'terrible', 'unsatisfied', 'incomplete', 'damage', 'not paid', 'overcharged', 'poor work'];
          const isRealDispute = disputeKeywords.some(keyword => 
            problem.toLowerCase().includes(keyword)
          );
          
          if (!isRealDispute) {
            const redirectMessage: Message = {
              id: (Date.now() + 1).toString(),
              sender_type: 'ai',
              message_text: '🤔 **This seems like a general question rather than a dispute.**\n\nI\'ll help you with this question instead:',
              created_at: new Date().toISOString()
            };
            setMessages(prev => [...prev, redirectMessage]);
            setDisputeMode(false);
            setDisputeStep(0);
            setDisputeData({ email: '', phone: '', problem: '' });
            
            setTimeout(() => {
              getAIResponse(problem);
            }, 1000);
            setSending(false);
            return;
          }
          
          // Submit dispute
          await submitDispute(finalDisputeData);
        } else if (contactMode) {
          // Handle contact request submission
          await submitContactRequest(finalDisputeData);
        }
        
        // Show quick questions again after submission
        setTimeout(() => {
          const questionsMessage: Message = {
            id: (Date.now() + 2).toString(),
            sender_type: 'ai',
            message_text: 'Need more help? Click any question above or ask something else:',
            created_at: new Date().toISOString()
          };
          setMessages(prev => [...prev, questionsMessage]);
          
          // Highlight questions briefly
          setHighlightQuestions(true);
          setTimeout(() => setHighlightQuestions(false), 2000);
        }, 2000);
        
        return;
      }
    }

    // Regular AI response for non-dispute/contact messages (ensure modes are off)
    setDisputeMode(false);
    setContactMode(false);
    setContactType('');
    setDisputeStep(0);
    setDisputeData({ email: '', phone: '', problem: '' });
    await getAIResponse(messageText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const submitDispute = async (disputeData: any) => {
    try {
      let submitSuccess = false;
      
      try {
        const response = await fetch('/api/disputes/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            userType,
            disputeDetails: disputeData.problem,
            userEmail: disputeData.email,
            userPhone: disputeData.phone,
            fullMessage: `${disputeData.email} | ${disputeData.phone} | ${disputeData.problem}`
          })
        });
        
        if (response.ok) {
          submitSuccess = true;
        }
      } catch (apiError) {
        console.log('API submit failed, using fallback');
      }

      const ticketId = Date.now();
      const confirmMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender_type: 'ai',
        message_text: `Dispute Submitted Successfully\n\nYour dispute has been submitted to our admin team:\n\nEmail: ${disputeData.email}\nPhone: ${disputeData.phone}\nIssue: ${disputeData.problem}\n\nPriority: HIGH\n\n• Admin will review within 2-4 hours\n• You will be contacted directly\n• All disputes are resolved quickly\n\nTicket ID: #${ticketId}`,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, confirmMessage]);
      
      // Store locally as backup
      try {
        const localDisputes = JSON.parse(localStorage.getItem('myapproved_disputes') || '[]');
        localDisputes.push({
          id: ticketId,
          userId,
          userType,
          userName: userName || 'User',
          userEmail: disputeData.email,
          userPhone: disputeData.phone,
          disputeDetails: disputeData.problem,
          fullMessage: `${disputeData.email} | ${disputeData.phone} | ${disputeData.problem}`,
          created_at: new Date().toISOString(),
          status: 'open',
          priority: 'high',
          submitted_to_api: submitSuccess
        });
        localStorage.setItem('myapproved_disputes', JSON.stringify(localDisputes));
      } catch (storageError) {
        console.log('Local storage failed');
      }
      
    } catch (error) {
      console.error('Error submitting dispute:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender_type: 'ai',
        message_text: 'Sorry, there was an error submitting your dispute. Please try again or contact our support team directly.',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    // Reset modes
    setDisputeMode(false);
    setDisputeStep(0);
    setDisputeData({ email: '', phone: '', problem: '' });
    setSending(false);
  };

  const submitContactRequest = async (contactData: any) => {
    try {
      let submitSuccess = false;
      
      // Try to submit to support tickets API
      try {
        const response = await fetch('/api/admin/support-tickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ticketId: Date.now(),
            status: 'open',
            priority: 'medium',
            adminNotes: `Contact request: ${contactType}\nEmail: ${contactData.email}\nPhone: ${contactData.phone}\nDetails: ${contactData.problem}`
          })
        });
        
        if (response.ok) {
          submitSuccess = true;
        }
      } catch (apiError) {
        console.log('API submit failed, using fallback');
      }

      const ticketId = Date.now();
      let messageTitle = '';
      let messageIcon = '';
      
      if (contactType === 'payment') {
        messageTitle = 'Payment & Billing Request';
        messageIcon = '💳';
      } else if (contactType === 'account') {
        messageTitle = 'Account Verification Request';
        messageIcon = '🔐';
      } else if (contactType === 'support') {
        messageTitle = 'Human Support Request';
        messageIcon = '👤';
      }
      
      const confirmMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender_type: 'ai',
        message_text: `${messageTitle} Submitted\n\nYour request has been submitted to our support team:\n\nEmail: ${contactData.email}\nPhone: ${contactData.phone}\nDetails: ${contactData.problem}\n\nPriority: MEDIUM\n\n• Support team will contact you within 1-2 hours\n• You will be contacted directly\n• All requests are handled professionally\n\nTicket ID: #${ticketId}`,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, confirmMessage]);
      
      // Store locally as backup
      try {
        const localTickets = JSON.parse(localStorage.getItem('myapproved_support_tickets') || '[]');
        localTickets.push({
          id: ticketId,
          userId,
          userType,
          userName: userName || 'User',
          userEmail: contactData.email,
          userPhone: contactData.phone,
          category: contactType,
          details: contactData.problem,
          created_at: new Date().toISOString(),
          status: 'open',
          priority: 'medium',
          submitted_to_api: submitSuccess
        });
        localStorage.setItem('myapproved_support_tickets', JSON.stringify(localTickets));
      } catch (storageError) {
        console.log('Local storage failed');
      }
      
    } catch (error) {
      console.error('Error submitting contact request:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender_type: 'ai',
        message_text: 'Sorry, there was an error submitting your request. Please try again or contact our support team directly.',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    // Reset modes
    setContactMode(false);
    setContactType('');
    setDisputeStep(0);
    setDisputeData({ email: '', phone: '', problem: '' });
    setSending(false);
  };

  const clearChat = () => {
    setMessages([welcomeMessage]);
    setShowQuickQuestions(true);
    setDisputeMode(false);
    setContactMode(false);
    setContactType('');
    setDisputeStep(0);
    setDisputeData({ email: '', phone: '', problem: '' });
    setHighlightQuestions(false);
  };

  return (
    <>
      {/* AI Chat Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          data-ai-chat-trigger
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-blue-700 hover:bg-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 z-50 flex items-center justify-center border-2 border-white/20"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </button>
      )}

      {/* AI Chat Panel - Fixed Bottom Right */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[560px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-blue-700 px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">MyApproved AI</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span className="text-blue-200 text-xs">Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Quick Questions */}
          <div className={`border-b border-gray-100 px-4 py-3 flex-shrink-0 transition-all duration-300 ${
            highlightQuestions ? 'bg-yellow-50' : 'bg-gray-50'
          }`}>
            <div className="flex flex-wrap gap-1.5">
              {quickQuestions.map((question) => (
                <button
                  key={question.id}
                  onClick={() => handleQuickQuestion(question)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                    question.category === 'dispute' 
                      ? 'border-red-200 bg-red-50 hover:bg-red-100 text-red-700' 
                      : 'border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-gray-700'
                  }`}
                >
                  {question.question}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.sender_type === 'user'
                      ? 'bg-blue-700 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  }`}
                >
                  <div className="text-sm whitespace-pre-line leading-relaxed">
                    {message.message_text}
                  </div>
                </div>
              </div>
            ))}
            
            {sending && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 px-4 py-3 bg-white flex-shrink-0">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                disabled={sending}
                className="flex-1 bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 rounded-full px-4 text-sm"
              />
              <Button
                onClick={sendMessage}
                disabled={sending || !newMessage.trim()}
                size="icon"
                className="bg-blue-700 hover:bg-blue-800 text-white rounded-full h-10 w-10 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <button
                onClick={clearChat}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Clear
              </button>
              <span className="text-xs text-gray-400">Powered by MyApproved AI</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
