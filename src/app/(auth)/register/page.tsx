'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const INTERESTS = ['Tech', 'Hiking', 'Photography', 'Art', 'Music', 'Food', 'Travel', 'Sports', 'Books', 'Film'];

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    interests: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const toggleInterest = (interest: string) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from('profiles').update({
        full_name: form.full_name,
        interests: form.interests,
      }).eq('id', data.user.id);
    }

    toast.success('Account created! Welcome to Haka Egypt!');
    router.push('/events');
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">H</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Haka Egypt</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Join Haka Egypt</h1>
          <p className="text-gray-500 mt-1">Create your community account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Full Name"
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
              required
              placeholder="Ahmed Hassan"
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              placeholder="Min 6 characters"
              minLength={6}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Interests (optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(interest => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      form.interests.includes(interest)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-orange-500 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
