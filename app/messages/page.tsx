'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { fetchApi } from '../../lib/api';
import Link from 'next/link';

export default function MessagesPage() {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    const loadConversations = async () => {
      try {
        setLoading(true);
        const data = await fetchApi('/conversations');
        setConversations(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };
    loadConversations();
  }, [profile]);

  if (!profile) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center bg-[#F7F7F5]">
        <p className="text-center text-[#555555] text-xs font-bold tracking-[0.2em] uppercase">Please log in to view messages.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh] text-[#555555] text-xs font-bold tracking-[0.2em] uppercase">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-[#111111] font-bold uppercase tracking-widest">{error}</div>;
  }

  return (
    <div className="w-full min-h-screen bg-[#F7F7F5] selection:bg-[#111111] selection:text-white py-12 md:py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#111111] tracking-tight mb-8 uppercase">Messages</h1>
        
        {conversations.length === 0 ? (
          <div className="bg-white border border-[#E5E5E5] p-12 text-center shadow-sm">
            <h3 className="text-xl font-bold text-[#111111] tracking-tight uppercase mb-2">No Conversations</h3>
            <p className="text-[#555555] text-sm">You do not have any active messages for approved claims.</p>
          </div>
        ) : (
          <div className="bg-white border border-[#E5E5E5] shadow-sm divide-y divide-[#E5E5E5]">
            {conversations.map((conv) => {
              const isFinder = conv.item.reporterId === profile.id;
              const otherUser = isFinder ? conv.claim.claimant : conv.item.reporter;
              const latestMessage = conv.messages && conv.messages.length > 0 ? conv.messages[0] : null;

              return (
                <Link key={conv.id} href={`/messages/${conv.id}`} className="block p-6 md:p-8 hover:bg-[#F7F7F5] transition-colors group">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase bg-[#111111] text-white px-2 py-1">
                          {isFinder ? 'CLAIMANT' : 'FINDER'}
                        </span>
                        <h3 className="text-lg font-bold text-[#111111] group-hover:underline">{otherUser?.name || 'Unknown User'}</h3>
                      </div>
                      <p className="text-sm font-semibold text-[#111111] mb-1">Item: {conv.item.title}</p>
                      
                      {latestMessage ? (
                        <p className="text-sm text-[#555555] truncate max-w-lg mt-3">
                          <span className="font-semibold">{latestMessage.senderId === profile.id ? 'You: ' : ''}</span>
                          {latestMessage.message}
                        </p>
                      ) : (
                        <p className="text-sm text-[#999999] italic mt-3">No messages yet. Start the conversation!</p>
                      )}
                    </div>
                    {latestMessage && (
                      <span className="text-[10px] font-bold tracking-[0.1em] text-[#555555] whitespace-nowrap ml-4">
                        {new Date(latestMessage.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
