'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, ExternalLink, Search, Filter } from 'lucide-react';

type Reg = {
  id: string;
  event_id: string;
  event_title: string;
  name: string;
  phone: string;
  email: string | null;
  level: string;
  position: string | null;
  experience: string | null;
  can_rally: string | null;
  play_type: string | null;
  self_rating: number | null;
  payment_proof_url: string | null;
  payment_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:  { label: 'Pending',  color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25', icon: <Clock className="w-3.5 h-3.5" /> },
  approved: { label: 'Approved', color: 'bg-green-500/15 text-green-400 border-green-500/25',   icon: <CheckCircle className="w-3.5 h-3.5" /> },
  rejected: { label: 'Rejected', color: 'bg-red-500/15 text-red-400 border-red-500/25',         icon: <XCircle className="w-3.5 h-3.5" /> },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_LABELS[status] ?? STATUS_LABELS.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function ProofModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="max-w-lg w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ background: 'var(--bg-card)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-white/8">
          <p className="text-white font-bold text-sm">Payment Receipt</p>
          <div className="flex items-center gap-2">
            <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-semibold">
              <ExternalLink className="w-3.5 h-3.5" /> Open full size
            </a>
            <button onClick={onClose} className="ml-2 text-gray-500 hover:text-white text-lg font-bold transition-colors">×</button>
          </div>
        </div>
        <img src={url} alt="Payment proof" className="w-full max-h-[70vh] object-contain bg-black/50" />
      </div>
    </div>
  );
}

export default function RegistrationsPage() {
  const [regs, setRegs] = useState<Reg[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadRegs();
  }, []);

  async function loadRegs() {
    setLoading(true);
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data } = await supabase
        .from('padel_registrations')
        .select('*')
        .order('created_at', { ascending: false });
      setRegs(data ?? []);
    } catch {
      setRegs([]);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    setUpdating(id);
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      await supabase.from('padel_registrations').update({ payment_status: status }).eq('id', id);
      setRegs(prev => prev.map(r => r.id === id ? { ...r, payment_status: status } : r));
    } finally {
      setUpdating(null);
    }
  }

  const filtered = regs.filter(r => {
    const matchSearch = search === '' || r.name.toLowerCase().includes(search.toLowerCase()) || r.phone.includes(search) || r.event_title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.payment_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: regs.length,
    pending: regs.filter(r => r.payment_status === 'pending').length,
    approved: regs.filter(r => r.payment_status === 'approved').length,
    rejected: regs.filter(r => r.payment_status === 'rejected').length,
  };

  return (
    <div className="p-6 lg:p-8 min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {proofUrl && <ProofModal url={proofUrl} onClose={() => setProofUrl(null)} />}

      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Registrations</h1>
        <p className="text-gray-500 text-sm mt-1">Review payment receipts and manage player approvals</p>
      </div>

      {/* Summary counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: counts.total, color: 'text-white' },
          { label: 'Pending', value: counts.pending, color: 'text-yellow-400' },
          { label: 'Approved', value: counts.approved, color: 'text-green-400' },
          { label: 'Rejected', value: counts.rejected, color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="border border-white/6 rounded-xl p-4 text-center" style={{ background: 'var(--bg-card)' }}>
            <div className={`text-2xl font-black ${color}`}>{value}</div>
            <div className="text-xs text-gray-500 font-medium mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, phone, event..."
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 focus:border-red-500/40 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-colors"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="appearance-none pl-8 pr-8 py-2.5 bg-white/5 border border-white/10 text-sm text-white rounded-xl outline-none cursor-pointer"
          >
            <option value="all" className="bg-gray-900">All statuses</option>
            <option value="pending" className="bg-gray-900">Pending</option>
            <option value="approved" className="bg-gray-900">Approved</option>
            <option value="rejected" className="bg-gray-900">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border border-white/6 rounded-2xl" style={{ background: 'var(--bg-card)' }}>
          <p className="text-4xl mb-3">🎾</p>
          <p className="text-gray-500 font-medium">{regs.length === 0 ? 'No registrations yet.' : 'No results for this filter.'}</p>
          {regs.length === 0 && <p className="text-gray-600 text-sm mt-1">Registrations will appear here once players submit via the join flow.</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(reg => (
            <div key={reg.id} className="border border-white/6 hover:border-white/10 rounded-2xl p-5 transition-colors" style={{ background: 'var(--bg-card)' }}>
              <div className="flex flex-wrap items-start gap-4">
                {/* Left: Player info */}
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2.5 mb-1">
                    <p className="font-black text-white text-base">{reg.name}</p>
                    <StatusBadge status={reg.payment_status} />
                  </div>
                  <p className="text-gray-500 text-sm mb-0.5">{reg.phone}{reg.email ? ` · ${reg.email}` : ''}</p>
                  <p className="text-gray-600 text-xs">{reg.event_title}</p>
                </div>

                {/* Middle: Assessment */}
                <div className="flex flex-wrap gap-2">
                  {reg.level && (
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                      reg.level === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      reg.level === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                      reg.level === 'Advanced' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                      'bg-green-500/10 text-green-400 border-green-500/20'
                    }`}>
                      {reg.level}
                    </span>
                  )}
                  {reg.position && <span className="px-2.5 py-1 bg-white/5 border border-white/8 rounded-lg text-xs text-gray-400">{reg.position} side</span>}
                  {reg.play_type && <span className="px-2.5 py-1 bg-white/5 border border-white/8 rounded-lg text-xs text-gray-400">{reg.play_type}</span>}
                  {reg.self_rating && <span className="px-2.5 py-1 bg-white/5 border border-white/8 rounded-lg text-xs text-gray-400">★ {reg.self_rating}/5</span>}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Payment proof */}
                  {reg.payment_proof_url ? (
                    <button
                      onClick={() => setProofUrl(reg.payment_proof_url!)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white rounded-xl text-xs font-semibold transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Receipt
                    </button>
                  ) : (
                    <span className="px-3 py-2 text-gray-700 text-xs">No receipt</span>
                  )}

                  {/* Approve */}
                  {reg.payment_status !== 'approved' && (
                    <button
                      onClick={() => updateStatus(reg.id, 'approved')}
                      disabled={updating === reg.id}
                      className="flex items-center gap-1.5 px-3 py-2 bg-green-600/15 hover:bg-green-600/25 border border-green-600/30 text-green-400 hover:text-green-300 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                  )}

                  {/* Reject */}
                  {reg.payment_status !== 'rejected' && (
                    <button
                      onClick={() => updateStatus(reg.id, 'rejected')}
                      disabled={updating === reg.id}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-600/15 hover:bg-red-600/25 border border-red-600/30 text-red-400 hover:text-red-300 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  )}
                </div>
              </div>

              {/* Footer: Date */}
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                <p className="text-gray-700 text-xs">
                  Submitted {new Date(reg.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
