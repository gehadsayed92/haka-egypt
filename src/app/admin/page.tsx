import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import { Users, Calendar, CheckCircle, TrendingUp, ClipboardList, Clock } from 'lucide-react';
import Link from 'next/link';

function StatCard({ title, value, icon, sub }: { title: string; value: number | string; icon: React.ReactNode; sub?: string }) {
  return (
    <div className="border border-white/6 rounded-2xl p-6" style={{ background: 'var(--bg-card)' }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-600/20 flex items-center justify-center text-red-400">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-black text-white mb-1">{value}</div>
      <div className="text-sm font-semibold text-gray-400">{title}</div>
      {sub && <div className="text-xs text-gray-600 mt-1">{sub}</div>}
    </div>
  );
}

export default async function AdminDashboard() {
  const supabase = createClient();

  const [
    { count: userCount },
    { count: eventCount },
    { count: rsvpCount },
    { count: regCount },
    { count: pendingCount },
    { data: recentRegs },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('rsvps').select('*', { count: 'exact', head: true }).eq('status', 'attending'),
    supabase.from('padel_registrations').select('*', { count: 'exact', head: true }),
    supabase.from('padel_registrations').select('*', { count: 'exact', head: true }).eq('payment_status', 'pending'),
    supabase.from('padel_registrations').select('*').order('created_at', { ascending: false }).limit(5),
  ]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">HAKA Egypt · Padel community overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Members" value={userCount ?? 0} icon={<Users className="w-5 h-5" />} />
        <StatCard title="Registrations" value={regCount ?? 0} icon={<ClipboardList className="w-5 h-5" />} sub={`${pendingCount ?? 0} pending review`} />
        <StatCard title="Total RSVPs" value={rsvpCount ?? 0} icon={<CheckCircle className="w-5 h-5" />} />
        <StatCard title="Matches Created" value={eventCount ?? 0} icon={<Calendar className="w-5 h-5" />} />
      </div>

      {/* Recent registrations */}
      <div className="border border-white/6 rounded-2xl p-6" style={{ background: 'var(--bg-card)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-black text-white text-base">Recent Registrations</h2>
          <Link href="/admin/registrations" className="text-xs text-red-400 hover:text-red-300 font-semibold">
            View all →
          </Link>
        </div>
        <div className="space-y-3">
          {(recentRegs || []).map((reg: any) => (
            <div key={reg.id} className="flex items-center justify-between py-3 border-b border-white/4 last:border-0">
              <div>
                <p className="font-semibold text-white text-sm">{reg.name}</p>
                <p className="text-xs text-gray-500">{reg.event_title} · {reg.level}</p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                reg.payment_status === 'approved' ? 'bg-green-500/15 text-green-400' :
                reg.payment_status === 'rejected' ? 'bg-red-500/15 text-red-400' :
                'bg-yellow-500/15 text-yellow-400'
              }`}>
                {reg.payment_status ?? 'pending'}
              </span>
            </div>
          ))}
          {!recentRegs?.length && (
            <p className="text-gray-600 text-sm py-4 text-center">No registrations yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
