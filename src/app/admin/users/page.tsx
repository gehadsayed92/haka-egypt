import { createClient } from '@/lib/supabase/server';
import { DataTable } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import type { Profile } from '@/types';

export default async function AdminUsersPage() {
  const supabase = createClient();
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  const columns = [
    { key: 'full_name', header: 'Name' },
    { key: 'email', header: 'Email' },
    {
      key: 'interests',
      header: 'Interests',
      render: (row: Profile) => (
        <div className="flex flex-wrap gap-1">
          {(row.interests || []).slice(0, 3).map(i => (
            <span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-xs">{i}</span>
          ))}
          {(row.interests || []).length > 3 && (
            <span className="text-xs text-gray-400">+{row.interests.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      key: 'is_admin',
      header: 'Role',
      render: (row: Profile) => (
        <Badge variant={row.is_admin ? 'info' : 'default'}>
          {row.is_admin ? 'Admin' : 'Member'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Joined',
      render: (row: Profile) => formatDate(row.created_at),
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Members</h1>
        <p className="text-gray-500 mt-1">{users?.length ?? 0} registered members</p>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <DataTable columns={columns} data={users || []} />
      </div>
    </div>
  );
}
