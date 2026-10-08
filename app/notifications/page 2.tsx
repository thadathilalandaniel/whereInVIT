'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { useRouter } from 'next/navigation';
import { fetchApi } from '../../lib/api';
import { formatDistanceToNow } from 'date-fns';

type NotificationType = 
  | 'ITEM_CLAIMED'
  | 'CLAIM_APPROVED'
  | 'CLAIM_REJECTED'
  | 'MESSAGE_RECEIVED'
  | 'HANDOFF_SCHEDULED'
  | 'HANDOFF_COMPLETED'
  | 'SYSTEM';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const typeLabels: Record<NotificationType, string> = {
  ITEM_CLAIMED: 'Claim received',
  CLAIM_APPROVED: 'Claim approved',
  CLAIM_REJECTED: 'Claim rejected',
  MESSAGE_RECEIVED: 'New message',
  HANDOFF_SCHEDULED: 'Handoff scheduled',
  HANDOFF_COMPLETED: 'Handoff completed',
  SYSTEM: 'System notification',
};

export default function NotificationsPage() {
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  useEffect(() => {
    if (!authLoading && !profile) {
      router.push('/');
    }
  }, [authLoading, profile, router]);

  const loadNotifications = async (pageNumber: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApi(`/notifications?page=${pageNumber}&limit=20`);
      setNotifications(data.notifications);
      setPage(data.pagination.page);
      setTotalPages(data.pagination.totalPages);
      setHasNextPage(data.pagination.hasNextPage);
    } catch (err: any) {
      setError(err.message || 'Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      loadNotifications(page);
    }
  }, [profile, page]);

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return; // Already read
    
    // Optimistic UI update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    
    try {
      await fetchApi(`/notifications/${id}/read`, { method: 'PATCH' });
    } catch (error) {
      console.error('Failed to mark notification as read', error);
      // Revert if failed
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: false } : n));
    }
  };

  const handleMarkAllAsRead = async () => {
    // Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    
    try {
      await fetchApi('/notifications/read-all', { method: 'PATCH' });
    } catch (error) {
      console.error('Failed to mark all as read', error);
      loadNotifications(page); // Reload to get true state
    }
  };

  if (authLoading || (!profile && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5]">
        <div className="text-sm font-semibold tracking-widest uppercase text-[#555555]">Loading notifications...</div>
      </div>
    );
  }

  if (!profile) return null; // Will redirect in useEffect

  return (
    <main className="min-h-screen bg-[#F7F7F5] py-12 md:py-24">
      <div className="max-w-[800px] mx-auto px-6 md:px-12">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#111111] mb-2 uppercase">Notifications</h1>
            <p className="text-[#555555] text-sm md:text-base">Stay updated on your items and claims.</p>
          </div>
          {notifications.some(n => !n.isRead) && (
            <button 
              onClick={handleMarkAllAsRead}
              className="text-xs font-bold tracking-widest uppercase text-[#111111] hover:text-[#555555] transition-colors border-b border-[#111111] pb-1"
            >
              Mark all as read
            </button>
          )}
        </div>

        {error ? (
          <div className="bg-white p-8 border border-[#E5E5E5] text-center">
            <p className="text-[#111111] font-semibold mb-4">{error}</p>
            <button 
              onClick={() => loadNotifications(page)}
              className="px-6 py-3 bg-[#111111] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#333333] transition-colors"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 border border-[#E5E5E5] animate-pulse">
                <div className="h-4 bg-[#F7F7F5] w-1/4 mb-4"></div>
                <div className="h-4 bg-[#F7F7F5] w-3/4"></div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white p-16 border border-[#E5E5E5] text-center">
            <h3 className="text-lg font-bold text-[#111111] uppercase tracking-widest mb-2">No Notifications</h3>
            <p className="text-[#555555]">You're all caught up.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                onClick={() => handleMarkAsRead(notification.id, notification.isRead)}
                className={`p-6 border transition-all cursor-pointer ${
                  notification.isRead 
                    ? 'bg-white border-[#E5E5E5] opacity-75 hover:opacity-100' 
                    : 'bg-[#111111] border-[#111111] text-white shadow-xl translate-y-[-2px]'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold tracking-widest uppercase ${notification.isRead ? 'text-[#555555]' : 'text-[#AAAAAA]'}`}>
                    {typeLabels[notification.type] || notification.type}
                  </span>
                  <span className={`text-[10px] font-medium tracking-wide ${notification.isRead ? 'text-[#888888]' : 'text-[#CCCCCC]'}`}>
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <h3 className={`text-base font-bold mb-1 ${notification.isRead ? 'text-[#111111]' : 'text-white'}`}>
                  {notification.title}
                </h3>
                <p className={`text-sm ${notification.isRead ? 'text-[#555555]' : 'text-[#EEEEEE]'}`}>
                  {notification.message}
                </p>
              </div>
            ))}

            {/* Pagination */}
            {(page > 1 || hasNextPage) && (
              <div className="flex justify-between items-center pt-8 border-t border-[#E5E5E5] mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`text-xs font-bold tracking-widest uppercase px-6 py-3 border border-[#E5E5E5] transition-colors ${
                    page === 1 ? 'text-[#AAAAAA] cursor-not-allowed bg-[#F7F7F5]' : 'text-[#111111] bg-white hover:bg-[#F7F7F5]'
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
                    !hasNextPage ? 'text-[#AAAAAA] cursor-not-allowed bg-[#F7F7F5]' : 'text-[#111111] bg-white hover:bg-[#F7F7F5]'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
