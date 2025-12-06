// React & Router
import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// Icons
import { Loader2, Eye, EyeOff } from 'lucide-react';
// Auth
import { useAuth } from '@/context/AuthContext';
// Hooks
import { useToast } from '@/hooks/use-toast';
// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const submitButtonContent = useMemo(
    () =>
      isSubmitting ? (
        <>
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          Logging in…
        </>
      ) : (
        'Login'
      ),
    [isSubmitting]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!username || !password) {
        toast({
          title: 'Error',
          description: 'All fields are required',
          variant: 'destructive',
        });
        return;
      }

      setIsSubmitting(true);

      // Expecting { username: string, roles: [] } from backend
      const userData = await login(username, password);

      if (userData) {
        toast({
          title: 'Success',
          description: 'Login successful!',
        });
        navigate('/dashboard');
      } else {
        toast({
          title: 'Error',
          description: 'Invalid credentials',
          variant: 'destructive',
        });
      }

      setIsSubmitting(false);
    },
    [username, password, login, navigate, toast]
  );

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4'>
      {/* Logo */}
      <img
        src='/logo.png' // or import logo from '@/assets/logo.png'
        alt='Sakthi Laser Technology Logo'
        className='h-20 w-auto mb-6'
      />
      {/* Login Card */}
      <Card className='w-full max-w-md shadow-lg'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-3xl font-bold text-center'>
            Sakthi Laser Technology
          </CardTitle>
          <CardDescription className='text-center'>
            Complete Customized Sheet Metal Job Shop
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Username */}
            <div className='space-y-2'>
              <Label htmlFor='username'>Username</Label>
              <Input
                id='username'
                placeholder='Enter your username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Password */}
            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <div className='relative'>
                <Input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Enter your password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className='pr-10'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword((s) => !s)}
                  className='absolute inset-y-0 right-2 flex items-center justify-center p-1'
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className='h-4 w-4' />
                  ) : (
                    <Eye className='h-4 w-4' />
                  )}
                </button>
              </div>
            </div>

            <Button type='submit' className='w-full' disabled={isSubmitting}>
              {submitButtonContent}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
