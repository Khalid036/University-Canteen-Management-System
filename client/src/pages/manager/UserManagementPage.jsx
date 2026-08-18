import React, { useEffect, useState } from 'react';
import { Users, Shield, GraduationCap, School, ChefHat, Search, UserCheck, UserX } from 'lucide-react';
import api from '../../lib/axios';
import { NeoButton } from '../../components/ui/NeoButton';
import { NeoCard } from '../../components/ui/NeoCard';
import { NeoBadge } from '../../components/ui/NeoBadge';
import { formatDate } from '../../lib/utils';

export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users', {
        params: {
          role: roleFilter,
          search: searchQuery
        }
      });
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, searchQuery]);

  const handleToggleStatus = async (userId) => {
    setTogglingId(userId);
    try {
      await api.patch(`/users/${userId}/toggle-status`);
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border-4 border-black p-5 shadow-neo flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <NeoBadge variant="purple" size="sm">ACCOUNT GOVERNANCE</NeoBadge>
          <h1 className="text-3xl font-black uppercase text-black mt-1">User Directory</h1>
          <p className="text-xs font-bold text-neutral-600">
            View registered students, teachers, managers, and deactivate/activate accounts.
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 border-3 border-black shadow-neo-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {['ALL', 'STUDENT', 'TEACHER', 'MANAGER'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={
                roleFilter === r
                  ? 'neo-btn px-3 py-1.5 text-xs font-black bg-neo-yellow border-2'
                  : 'neo-btn px-3 py-1.5 text-xs font-black bg-white border-2'
              }
            >
              {r}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, ID..."
            className="w-full bg-neutral-50 px-3 py-1.5 pl-8 text-xs font-bold border-2 border-black focus:outline-none"
          />
          <Search className="absolute left-2.5 top-2 text-neutral-500" size={14} />
        </div>
      </div>

      {/* Users Table */}
      <NeoCard className="border-4 shadow-neo bg-white p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neo-yellow border-b-3 border-black text-xs font-black uppercase tracking-wider text-black">
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">ID & Department</th>
                <th className="p-4">Total Orders</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black text-xs font-bold">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center font-black">Loading user directory...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500 font-bold">No users match query.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt={u.name} className="w-9 h-9 border-2 border-black rounded-none" />
                      ) : (
                        <div className="w-9 h-9 bg-neo-yellow border-2 border-black flex items-center justify-center font-black">
                          {u.name[0]}
                        </div>
                      )}
                      <div>
                        <div className="font-black text-black">{u.name}</div>
                        <div className="text-neutral-500 text-[11px]">{u.email}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      {u.role === 'STUDENT' && <NeoBadge variant="green" size="sm">Student</NeoBadge>}
                      {u.role === 'TEACHER' && <NeoBadge variant="purple" size="sm">Faculty</NeoBadge>}
                      {u.role === 'MANAGER' && <NeoBadge variant="pink" size="sm">Manager</NeoBadge>}
                    </td>
                    <td className="p-4 text-neutral-700">
                      <div>{u.institutionId || 'N/A'}</div>
                      <div className="text-neutral-500 text-[11px]">{u.department || 'N/A'}</div>
                    </td>
                    <td className="p-4 font-black">
                      {u._count?.orders || 0} orders
                    </td>
                    <td className="p-4">
                      {u.isActive ? (
                        <span className="text-emerald-700 font-black">Active</span>
                      ) : (
                        <span className="text-red-600 font-black">Deactivated</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <NeoButton
                        variant={u.isActive ? 'destructive' : 'green'}
                        size="sm"
                        disabled={togglingId === u.id || u.role === 'MANAGER'}
                        onClick={() => handleToggleStatus(u.id)}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </NeoButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </NeoCard>
    </div>
  );
};
