'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '../../../lib/api';
import { formatDistanceToNow } from 'date-fns';

export default function AdminClaims() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const loadClaims = async (pageNumber: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApi(`/admin/claims?page=${pageNumber}`);
      setClaims(data.claims);
      setPage(data.pagination.page);
      setTotalPages(data.pagination.totalPages);
      setHasNextPage(data.pagination.hasNextPage);
    } catch (err: any) {
      setError(err.message || 'Failed to load claims.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClaims(page);
  }, [page]);

  if (loading && claims.length === 0) {
    return <div className="text-sm font-semibold tracking-widest uppercase text-[#555555]">Loading Claims...</div>;
  }

  if (error) {
    return <div className="text-red-500 font-semibold">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-[#111111] uppercase mb-8">Claims Inspection</h1>
      
      {claims.length === 0 ? (
        <div className="bg-white p-12 border border-[#E5E5E5] text-center">
          <p className="text-[#555555]">No claims found.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E5E5] overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F7F7F5] border-b border-[#E5E5E5]">
                <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-[#555555]">Item</th>
                <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-[#555555]">Claimant</th>
                <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-[#555555]">Status</th>
                <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-[#555555]">Date</th>
              </tr>
            </thead>
            <tbody>
              {claims.map(claim => (
                <tr key={claim.id} className="border-b border-[#E5E5E5] hover:bg-[#FAFAFA]">
                  <td className="p-4">
                    <div className="text-sm font-bold text-[#111111]">{claim.item?.title}</div>
                    <div className="text-xs text-[#555555]">Status: {claim.item?.status}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-[#111111]">{claim.claimant?.name}</div>
                    <div className="text-xs text-[#555555]">{claim.claimant?.email}</div>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-full ${
                      claim.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      claim.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      claim.status === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {claim.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-[#555555]">
                    {formatDistanceToNow(new Date(claim.createdAt), { addSuffix: true })}
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
