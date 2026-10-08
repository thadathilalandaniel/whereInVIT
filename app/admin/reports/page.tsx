'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '../../../lib/api';
import { formatDistanceToNow } from 'date-fns';

export default function AdminReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const loadReports = async (pageNumber: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApi(`/admin/reports?page=${pageNumber}`);
      setReports(data.reports);
      setPage(data.pagination.page);
      setTotalPages(data.pagination.totalPages);
      setHasNextPage(data.pagination.hasNextPage);
    } catch (err: any) {
      setError(err.message || 'Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports(page);
  }, [page]);

  const handleReview = async (reportId: string, status: string) => {
    if (!window.confirm(`Mark this report as ${status}?`)) return;

    try {
      await fetchApi(`/admin/reports/${reportId}/review`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      loadReports(page);
    } catch (err: any) {
      alert(err.message || 'Failed to review report.');
    }
  };

  if (loading && reports.length === 0) {
    return <div className="text-sm font-semibold tracking-widest uppercase text-[#555555]">Loading Reports...</div>;
  }

  if (error) {
    return <div className="text-red-500 font-semibold">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-[#111111] uppercase mb-8">Reports Moderation</h1>
      
      {reports.length === 0 ? (
        <div className="bg-white p-12 border border-[#E5E5E5] text-center">
          <p className="text-[#555555]">No reports require attention.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E5E5] overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F7F7F5] border-b border-[#E5E5E5]">
                <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-[#555555]">Item</th>
                <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-[#555555]">Reporter</th>
                <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-[#555555]">Reason</th>
                <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-[#555555]">Status</th>
                <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-[#555555]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(report => (
                <tr key={report.id} className="border-b border-[#E5E5E5] hover:bg-[#FAFAFA]">
                  <td className="p-4">
                    <div className="text-sm font-bold text-[#111111]">{report.item?.title}</div>
                    <div className="text-xs text-[#555555] max-w-[200px] truncate">{report.item?.id}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-[#111111]">{report.reporter?.name}</div>
                    <div className="text-xs text-[#555555]">{report.reporter?.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-[10px] font-bold tracking-widest uppercase text-[#111111] mb-1">{report.reason}</div>
                    <div className="text-xs text-[#555555] max-w-[200px]">{report.description}</div>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-full ${
                      report.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {report.status === 'PENDING' && (
                      <div className="flex flex-col space-y-2">
                        <button 
                          onClick={() => handleReview(report.id, 'ACTION_TAKEN')}
                          className="text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 border bg-[#111111] text-white hover:bg-[#333333] border-[#111111] transition-colors"
                        >
                          Mark Action Taken
                        </button>
                        <button 
                          onClick={() => handleReview(report.id, 'DISMISSED')}
                          className="text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 border border-[#111111] text-[#111111] hover:bg-[#F7F7F5] transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
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
