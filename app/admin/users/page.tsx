'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '../../../lib/api';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../../components/AuthProvider';

export default function AdminUsers() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const loadUsers = async (pageNumber: number, searchQuery: string = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApi(`/admin/users?page=${pageNumber}&search=${searchQuery}`);
      setUsers(data.users);
      setPage(data.pagination.page);
      setTotalPages(data.pagination.totalPages);
      setHasNextPage(data.pagination.hasNextPage);
    } catch (err: any) {
      setError(err.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers(page, search);
    }, 500);
    return () => clearTimeout(timer);
  }, [page, search]);

  const handleChangeRole = async (userId: string, currentRole: string) => {
    if (userId === profile?.id) {
      alert("You cannot change your own role from this interface.");
      return;
    }
    
    const newRole = currentRole === 'ADMIN' ? 'STUDENT' : 'ADMIN';
    if (!window.confirm(`Change this user's role to ${newRole}?`)) return;

    try {
      await fetchApi(`/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });
      loadUsers(page, search);
    } catch (err: any) {
      alert(err.message || 'Failed to change role.');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-[#111111] uppercase mb-8">Users Moderation</h1>
      
      <div className="mb-6">
        <input 
          type="text" 
          placeholder="Search by name, email, or registration number..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 px-4 py-3 border border-[#E5E5E5] text-sm focus:outline-none focus:border-[#111111] transition-colors"
        />
      </div>

      {loading && users.length === 0 ? (
        <div className="text-sm font-semibold tracking-widest uppercase text-[#555555]">Loading Users...</div>
      ) : error ? (
        <div className="text-red-500 font-semibold">{error}</div>
      ) : users.length === 0 ? (
        <div className="bg-white p-12 border border-[#E5E5E5] text-center">
          <p className="text-[#555555]">No users found.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E5E5] overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F7F7F5] border-b border-[#E5E5E5]">
                <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-[#555555]">User</th>
                <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-[#555555]">Registration No.</th>
                <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-[#555555]">Role</th>
                <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-[#555555]">Joined</th>
                <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-[#555555]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-[#E5E5E5] hover:bg-[#FAFAFA]">
                  <td className="p-4">
                    <div className="text-sm font-bold text-[#111111]">{user.name}</div>
                    <div className="text-xs text-[#555555]">{user.email}</div>
                  </td>
                  <td className="p-4 text-sm text-[#555555]">
                    {user.registrationNumber || '-'}
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-full ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-[#555555]">
                    {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                  </td>
                  <td className="p-4">
                    {user.id !== profile?.id && (
                      <button 
                        onClick={() => handleChangeRole(user.id, user.role)}
                        className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 border transition-colors ${
                          user.role === 'ADMIN' 
                            ? 'border-[#111111] text-[#111111] hover:bg-[#F7F7F5]' 
                            : 'bg-[#111111] text-white hover:bg-[#333333] border-[#111111]'
                        }`}
                      >
                        {user.role === 'ADMIN' ? 'Revoke Admin' : 'Make Admin'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(page > 1 || hasNextPage) && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`text-xs font-bold tracking-widest uppercase px-6 py-3 border border-[#E5E5E5] transition-colors ${
              page === 1 ? 'text-[#AAAAAA] cursor-not-allowed bg-white' : 'text-[#111111] bg-white hover:bg-[#F7F7F5]'
            }`}
          >
            Previous
          </button>
          <span className="text-xs font-medium text-[#555555] tracking-widest">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!hasNextPage}
            className={`text-xs font-bold tracking-widest uppercase px-6 py-3 border border-[#E5E5E5] transition-colors ${
              !hasNextPage ? 'text-[#AAAAAA] cursor-not-allowed bg-white' : 'text-[#111111] bg-white hover:bg-[#F7F7F5]'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
