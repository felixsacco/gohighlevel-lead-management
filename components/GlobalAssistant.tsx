'use client';

import React from 'react';
import AISupportChat from '@/components/AISupportChat';

export default function GlobalAssistant() {
  return (
    <AISupportChat
      userId="guest"
      userType="client"
      userName="Guest"
    />
  );
}
