'use client';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../../components/AuthProvider';
import { fetchApi } from '../../../lib/api';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ConversationPage() {
  const { profile, loading: authLoading } = useAuth();
  const { conversationId } = useParams();
  const router = useRouter();

  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [convData, msgsData] = await Promise.all([
        fetchApi(`/conversations/${conversationId}`),
        fetchApi(`/conversations/${conversationId}/messages`)
      ]);
      setConversation(convData);
      setMessages(msgsData);
      
      // Mark as read asynchronously
      fetchApi(`/conversations/${conversationId}/read`, { method: 'PATCH' }).catch(() => {});
    } catch (err: any) {
      setError(err.message || 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !profile) {
      router.push(`/login?next=/messages/${conversationId}`);
      return;
    }
    if (profile && conversationId) {
      loadData();
      
      // Simple polling for new messages every 10 seconds
      const interval = setInterval(async () => {
        try {
          const msgsData = await fetchApi(`/conversations/${conversationId}/messages`);
          setMessages(msgsData);
        } catch (e) {}
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [authLoading, profile, conversationId, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const result = await fetchApi(`/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message: newMessage })
      });
      setMessages(prev => [...prev, result]);
      setNewMessage('');
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (authLoading || !profile) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center bg-[#F7F7F5]">
        <p className="text-center text-[#555555] text-xs font-bold tracking-[0.2em] uppercase">Authenticating...</p>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center items-center min-h-[60vh] text-[#555555] text-xs font-bold tracking-[0.2em] uppercase">Loading...</div>;
  if (error || !conversation) return <div className="text-center py-20 text-[#111111] font-bold uppercase tracking-widest">{error || 'Conversation not found'}</div>;

  const isFinder = conversation.item.reporterId === profile.id;
  const otherUser = isFinder ? conversation.claim.claimant : conversation.item.reporter;

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#F7F7F5] selection:bg-[#111111] selection:text-white">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E5E5] sticky top-[72px] md:top-[88px] z-40 px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-6">
          <button onClick={() => router.push('/messages')} className="text-[#555555] hover:text-[#111111] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-lg md:text-xl font-bold text-[#111111] uppercase tracking-tight">{otherUser?.name || 'Unknown User'}</h2>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase bg-[#F7F7F5] border border-[#E5E5E5] text-[#555555] px-2 py-0.5">
                {isFinder ? 'Claimant' : 'Finder'}
              </span>
            </div>
            <Link href={`/items/${conversation.item.id}`} className="text-xs font-semibold text-[#555555] hover:text-[#111111] hover:underline flex items-center gap-2">
              <span>Item: {conversation.item.title}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6 pb-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#555555] text-sm">No messages yet. Send a message to coordinate handoff.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === profile.id;
              return (
                <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] md:max-w-[70%] p-4 ${isMine ? 'bg-[#111111] text-white border border-[#111111]' : 'bg-white text-[#111111] border border-[#E5E5E5]'}`}>
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-[#999999] tracking-wider uppercase font-semibold">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMine && msg.readAt && (
                      <span className="text-[10px] text-[#111111] font-bold tracking-wider uppercase">READ</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input Area */}
      <div className="bg-white border-t border-[#E5E5E5] p-4 md:p-6 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-[#F7F7F5] border border-[#E5E5E5] px-4 py-3 text-sm focus:outline-none focus:border-[#111111] focus:bg-white transition-colors text-[#111111] placeholder:text-[#999999]"
              maxLength={1000}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="bg-[#111111] text-white px-8 py-3 text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#333333] transition-colors border border-[#111111] disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
