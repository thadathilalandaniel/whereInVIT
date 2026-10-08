'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '../../../lib/api';
import { formatDistanceToNow } from 'date-fns';

export default function AdminItems() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const loadItems = async (pageNumber: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApi(`/admin/items?page=${pageNumber}`);
      setItems(data.items);
      setPage(data.pagination.page);
      setTotalPages(data.pagination.totalPages);
      setHasNextPage(data.pagination.hasNextPage);
    } catch (err: any) {
      setError(err.message || 'Failed to load items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems(page);
  }, [page]);

  const handleModerate = async (itemId: string, currentStatus: string) => {
    const action = currentStatus === 'REMOVED' ? 'RESTORE' : 'REMOVE';
    if (!window.confirm(`Are you sure you want to ${action.toLowerCase()} this item?`)) return;

    try {
      await fetchApi(`/admin/items/${itemId}/moderate`, {
        method: 'PATCH',
        body: JSON.stringify({ action }),
      });
      loadItems(page);
    } catch (err: any) {
      alert(err.message || 'Failed to moderate item.');
    }
  };

  if (loading && items.length === 0) {
    return <div className="text-sm font-semibold tracking-widest uppercase text-[#555555]">Loading Items...</div>;
  }

  if (error) {
    return <div className="text-red-500 font-semibold">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-[#111111] uppercase mb-8">Items Moderation</h1>
      
      {items.length === 0 ? (
        <div className="bg-white p-12 border border-[#E5E5E5] text-center">
          <p className="text-[#555555]">No items found.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E5E5] overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F7F7F5] border-b border-[#E5E5E5]">
                <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-[#555555]">Title</th>
                <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-[#555555]">Reporter</th>
                <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-[#555555]">Status</th>
                <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-[#555555]">Date</th>
                <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-[#555555]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-[#E5E5E5] hover:bg-[#FAFAFA]">
                  <td className="p-4">
                    <div className="text-sm font-bold text-[#111111]">{item.title}</div>
                    <div className="text-xs text-[#555555]">{item.type} • {item.category?.name}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-[#111111]">{item.reporter?.name}</div>
                    <div className="text-xs text-[#555555]">{item.reporter?.email}</div>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-full ${
                      item.status === 'REMOVED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-[#555555]">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </td>
                  <td className="p-4">
                    {['ACTIVE', 'CLAIM_PENDING', 'REMOVED'].includes(item.status) && (
                      <button 
                        onClick={() => handleModerate(item.id, item.status)}
                        className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 border transition-colors ${
                          item.status === 'REMOVED' 
                            ? 'border-[#111111] text-[#111111] hover:bg-[#F7F7F5]' 
                            : 'bg-[#111111] text-white hover:bg-[#333333] border-[#111111]'
                        }`}
                      >
                        {item.status === 'REMOVED' ? 'Restore' : 'Remove'}
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
