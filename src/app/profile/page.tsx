'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Calendar, User } from 'lucide-react';

const INTERESTS = ['Tech', 'Hiking', 'Photography', 'Art', 'Music', 'Food', 'Travel', 'Sports', 'Books', 'Film'];

export default function ProfilePage() {
  const { profile, loading } = useAuth();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: '', interests: [] as string[] });
  const [rsvps, setRsvps] = useState<Array<{
    id: string;
    status: string;
    events: { title: string; date: string } | null;
  }>>([]);

  useEffect(() => {
    if (profile) {
      setForm({ full_name: profile.full_name, interests: profile.interests || [] });
      fetchRsvps();
    }
  }, [profile]);

  const fetchRsvps = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('rsvps')
      .select('*, events(*)')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });
    setRsvps(data || []);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: form.full_name, interests: form.interests })
      .eq('id', profile.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Profile updated!');
    }
    setSaving(false);
  };

  const toggleInterest = (interest: string) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">My Profile</h1>

          <div className="grid gap-6">
            <Card>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{profile?.full_name || 'Community Member'}</p>
                    <p className="text-gray-500 text-sm">{profile?.email}</p>
                    {profile?.is_admin && <Badge variant="info" className="mt-1">Admin</Badge>}
                  </div>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                  <Input
                    label="Full Name"
                    value={form.full_name}
                    onChange={e => setForm({ ...form, full_name: e.target.value })}
                  />
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Interests</label>
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
                  <Button type="submit" loading={saving}>Save Changes</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  My Events
                </h2>
                {rsvps.length > 0 ? (
                  <div className="space-y-3">
                    {rsvps.map(rsvp => (
                      <div key={rsvp.id} className="flex items-center justify-between py-3 border-b last:border-0">
                        <div>
                          <p className="font-medium text-sm">{rsvp.events?.title}</p>
                          <p className="text-xs text-gray-500">{rsvp.events?.date ? formatDate(rsvp.events.date) : ''}</p>
                        </div>
                        <Badge variant={rsvp.status === 'attending' ? 'success' : rsvp.status === 'waitlist' ? 'warning' : 'default'}>
                          {rsvp.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No event RSVPs yet. Browse events to join one!</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
