'use client';

import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import SimpleChatSystem from '@/components/SimpleChatSystem';
import AISupportChat from '@/components/AISupportChat';

interface Props {
  mode: 'home' | 'register';
}

export default function FloatingAssistant({ mode }: Props) {
  const [open, setOpen] = useState(false);

  // Build a lightweight demo room for register page using SimpleChatSystem
  const acceptedJobs = [
    {
      id: 'support',
      assigned_tradesperson_id: 'assistant',
      job_description: 'Live support and onboarding help',
      trade: 'Support',
      clients: { first_name: 'You', last_name: '' },
      tradespeople: { first_name: 'MyApproved', last_name: 'Assistant' },
    },
  ];

  return (
    <>
      {/* AI Support Chat available on all pages */}
      <AISupportChat
        userId="guest"
        userType="client"
        userName="Guest"
      />
    </>
  );
}
