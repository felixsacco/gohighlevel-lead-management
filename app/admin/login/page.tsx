'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email === 'admin@example.com' && password === 'password') {
      localStorage.setItem('adminLoggedIn', 'true');
      router.push('/admin/dashboard');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle>Admin Login</CardTitle>
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Label htmlFor="email">Email</Label>
          <Input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Label htmlFor="password">Password</Label>
          <Input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit">Login</Button>
        </form>
      </CardContent>
    </Card>
  );
}
