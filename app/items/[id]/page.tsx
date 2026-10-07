'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchApi } from '../../../lib/api';
import { useAuth } from '../../../components/AuthProvider';
import Link from 'next/link';

const Button = ({ onClick, children, variant = 'primary', disabled = false, type = 'button', className = '' }: any) => {
  const base = "px-6 py-3 text-xs font-bold tracking-[0.2em] uppercase transition-colors disabled:opacity-50 border text-center";
  const variants = {
    primary: "bg-[#111111] text-white border-[#111111] hover:bg-[#333333]",
    secondary: "bg-white text-[#111111] border-[#E5E5E5] hover:border-[#111111] hover:bg-[#F7F7F5]",
    danger: "bg-white text-red-600 border-red-200 hover:border-red-600 hover:bg-red-50",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant as keyof typeof variants]} ${className}`}>
      {children}
    </button>
  );
};

export default function ItemDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { profile } = useAuth();
  
  const [item, setItem] = useState<any>(null);
  const [challenge, setChallenge] = useState<any>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [myClaim, setMyClaim] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  
  const [formLoading, setFormLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const itemData = await fetchApi(`/items/${id}`);
      setItem(itemData);

      const isOwner = profile?.id === itemData.reporter?.id;

      if (itemData.type === 'FOUND') {
        try {
          const ch = await fetchApi(`/items/${id}/verification-challenge`);
          setChallenge(ch);
        } catch (e) {}

        if (isOwner) {
          try {
            const cl = await fetchApi(`/items/${id}/claims`);
            setClaims(cl);
          } catch (e) {}
        } else if (profile) {
          try {
            const mc = await fetchApi(`/items/${id}/my-claim`);
            setMyClaim(mc);
          } catch (e) {}
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load item');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadData();
  }, [id, profile]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing permanently?')) return;
    try {
      await fetchApi(`/items/${id}`, { method: 'DELETE' });
      router.push('/');
    } catch (err: any) { alert(err.message || 'Failed to delete item'); }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const question = (form.elements.namedItem('question') as HTMLInputElement).value;
    const answer = (form.elements.namedItem('answer') as HTMLInputElement).value;
    
    try {
      setFormLoading(true);
      await fetchApi(`/items/${id}/verification-challenge`, {
        method: 'POST',
        body: JSON.stringify({ question, answer })
      });
      setShowChallengeModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to set challenge');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const answer = (form.elements.namedItem('answer') as HTMLInputElement).value;
    
    try {
      setFormLoading(true);
      await fetchApi(`/items/${id}/claims`, {
        method: 'POST',
        body: JSON.stringify({ answer })
      });
      setShowClaimModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit claim');
    } finally {
      setFormLoading(false);
    }
  };

  const handleApproveClaim = async (claimId: string) => {
    if (!confirm('Approve this claim? This will reject all other pending claims.')) return;
    try {
      await fetchApi(`/claims/${claimId}/approve`, { method: 'PATCH' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to approve claim');
    }
  };

  const handleRejectClaim = async (claimId: string) => {
    if (!confirm('Reject this claim?')) return;
    try {
      await fetchApi(`/claims/${claimId}/reject`, { method: 'PATCH' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to reject claim');
    }
  };

  const handleCancelClaim = async (claimId: string) => {
    if (!confirm('Cancel your claim?')) return;
    try {
      await fetchApi(`/claims/${claimId}/cancel`, { method: 'PATCH' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel claim');
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-[60vh] text-[#555555] text-xs font-bold tracking-[0.2em] uppercase">Loading...</div>;
  if (error || !item) return <div className="text-center py-20 text-[#111111] font-bold uppercase tracking-widest">{error || 'Item not found'}</div>;
  
  const isOwner = profile?.id === item.reporter?.id;
  const isResolvedOrClaimed = ['CLAIMED', 'RETURNED', 'RESOLVED'].includes(item.status);

  return (
    <div className="w-full min-h-screen bg-[#F7F7F5] selection:bg-[#111111] selection:text-white py-12 md:py-24 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* ITEM DETAILS */}
        <div className="bg-white border border-[#E5E5E5] overflow-hidden shadow-sm">
          {item.imageUrl && (
            <div className="w-full h-80 bg-[#E5E5E5]">
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-8 md:p-12">
            <div className="flex justify-between items-start mb-6 pb-6">
              <div>
                <p className="text-[#555555] text-xs font-bold tracking-[0.2em] mb-2 uppercase">{item.type} ITEM</p>
                <h1 className="text-3xl md:text-5xl font-extrabold text-[#111111] tracking-tight">{item.title}</h1>
              </div>
              <span className={`px-4 py-2 text-xs font-bold tracking-[0.2em] uppercase border ${item.status === 'ACTIVE' ? 'bg-[#111111] text-white border-[#111111]' : 'bg-[#F7F7F5] text-[#555555] border-[#E5E5E5]'}`}>
                {item.status}
              </span>
            </div>
            
            {/* PROMINENT CLAIM ACTION BLOCK */}
            {item.type === 'FOUND' && (
              <div className="mb-10 p-6 md:p-8 bg-[#F7F7F5] border border-[#111111]">
                {!isOwner ? (
                  isResolvedOrClaimed ? (
                     <div className="text-center py-2">
                       <p className="text-sm font-bold text-[#111111] uppercase tracking-[0.1em]">Item no longer available for claim</p>
                       <p className="text-xs text-[#555555] mt-2">This item has already been successfully claimed or returned.</p>
                     </div>
                  ) : myClaim ? (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="text-center sm:text-left">
                        <p className="text-[10px] font-bold tracking-[0.2em] text-[#555555] uppercase mb-1">Your Claim Status</p>
                        <h3 className="text-xl font-bold text-[#111111] uppercase tracking-tight">
                          {myClaim.status === 'PENDING' && 'PENDING REVIEW'}
                          {myClaim.status === 'APPROVED' && 'APPROVED'}
                          {myClaim.status === 'REJECTED' && 'REJECTED'}
                          {myClaim.status === 'CANCELLED' && 'CANCELLED'}
                        </h3>
                        {myClaim.status === 'APPROVED' && <p className="text-xs text-[#555555] mt-2">The finder approved your claim. You can now coordinate handoff.</p>}
                      </div>
                      {myClaim.status === 'PENDING' && (
                        <Button className="w-full sm:w-auto" variant="secondary" onClick={() => handleCancelClaim(myClaim.id)}>Cancel Claim</Button>
                      )}
                      {myClaim.status === 'APPROVED' && myClaim.conversation && (
                        <Button className="w-full sm:w-auto" onClick={() => router.push(`/messages/${myClaim.conversation.id}`)}>Message Finder</Button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="text-center sm:text-left">
                        <h3 className="text-xl md:text-2xl font-bold text-[#111111] uppercase tracking-tight mb-2">Are you the owner?</h3>
                        <p className="text-sm text-[#555555]">Submit a claim to prove ownership of this item.</p>
                      </div>
                      <Button className="w-full sm:w-auto py-4 px-8 text-sm" onClick={() => {
                        if (!profile) return alert('Please login first to claim items.');
                        if (!challenge) return alert('No verification challenge is set for this item yet. Please wait for the finder to set one.');
                        setShowClaimModal(true);
                      }}>CLAIM THIS ITEM</Button>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="text-center sm:text-left">
                      <h3 className="text-xl font-bold text-[#111111] uppercase tracking-tight mb-2">Manage Ownership</h3>
                      <p className="text-sm text-[#555555]">You found this item. Manage its verification and claims.</p>
                    </div>
                    {!challenge ? (
                      <Button className="w-full sm:w-auto" onClick={() => setShowChallengeModal(true)}>Set Challenge</Button>
                    ) : item.status === 'CLAIMED' ? (
                      <a href="#manage-claims" className="inline-block px-6 py-3 text-xs font-bold tracking-[0.2em] uppercase transition-colors border text-center bg-[#111111] text-white border-[#111111] hover:bg-[#333333]">Message Claimant</a>
                    ) : (
                      <a href="#manage-claims" className="inline-block px-6 py-3 text-xs font-bold tracking-[0.2em] uppercase transition-colors border text-center bg-[#111111] text-white border-[#111111] hover:bg-[#333333]">View Claims</a>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 border-b border-[#E5E5E5] pb-8 pt-4 border-t">
              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#555555] uppercase mb-1">Category</h3>
                  <p className="text-sm font-semibold text-[#111111]">{item.category?.name}</p>
                </div>
                <div>
                  <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#555555] uppercase mb-1">Venue</h3>
                  <p className="text-sm font-semibold text-[#111111]">{item.venue?.name}</p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#555555] uppercase mb-1">Reported By</h3>
                  <p className="text-sm font-semibold text-[#111111]">{item.reporter?.name || 'Anonymous'}</p>
                </div>
                <div>
                  <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#555555] uppercase mb-1">Date Reported</h3>
                  <p className="text-sm font-semibold text-[#111111]">{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#555555] uppercase mb-3">Description</h3>
              <div className="text-sm text-[#111111] leading-relaxed whitespace-pre-wrap">{item.description}</div>
            </div>

            {isOwner && item.status === 'ACTIVE' && (
              <div className="mt-12 flex space-x-4">
                <Button variant="secondary" onClick={() => router.push(`/items/${item.id}/edit`)}>Edit Details</Button>
                <Button variant="danger" onClick={handleDelete}>Delete Listing</Button>
              </div>
            )}
          </div>
        </div>

        {/* CLAIM MANAGEMENT SECTION FOR FINDERS ONLY */}
        {item.type === 'FOUND' && isOwner && (
          <div id="manage-claims" className="bg-white border border-[#E5E5E5] p-8 md:p-12">
            <h2 className="text-xl md:text-2xl font-bold text-[#111111] tracking-tight mb-8 uppercase">Ownership & Claims</h2>
            
            <div className="space-y-8">
              {!challenge ? (
                <div className="border border-[#E5E5E5] p-6 bg-[#F7F7F5] text-center">
                  <p className="text-[#555555] text-sm mb-4">No verification challenge has been configured yet.</p>
                  <Button onClick={() => setShowChallengeModal(true)}>Set Verification Challenge</Button>
                </div>
              ) : (
                <div>
                  <div className="mb-8 border border-[#E5E5E5] p-6">
                    <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#555555] uppercase mb-3">Current Verification Challenge</h3>
                    <p className="text-[#111111] text-lg font-bold">"{challenge.question}"</p>
                    <button onClick={() => setShowChallengeModal(true)} className="mt-6 text-[10px] font-bold tracking-[0.2em] uppercase text-[#555555] hover:text-[#111111] underline">Update Challenge</button>
                  </div>

                  <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#555555] uppercase mb-4">Claim Requests ({claims.length})</h3>
                  {claims.length === 0 ? (
                    <p className="text-[#555555] text-sm border border-[#E5E5E5] p-6 text-center bg-[#F7F7F5]">No claim requests yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {claims.map((claim) => (
                        <div key={claim.id} className="border border-[#E5E5E5] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-colors hover:border-[#111111]">
                          <div>
                            <p className="text-base font-bold text-[#111111] mb-1">{claim.claimant?.name}</p>
                            <p className="text-xs text-[#555555]">{claim.claimant?.registrationNumber} • {new Date(claim.createdAt).toLocaleDateString()}</p>
                            <div className="mt-3">
                              <span className={`inline-block px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase border ${claim.status === 'PENDING' ? 'bg-[#111111] text-white border-[#111111]' : 'bg-[#F7F7F5] text-[#555555] border-[#E5E5E5]'}`}>
                                {claim.status}
                              </span>
                            </div>
                          </div>
                          {claim.status === 'PENDING' && (
                            <div className="flex gap-3 w-full md:w-auto">
                              <Button className="flex-1 md:flex-none" onClick={() => handleApproveClaim(claim.id)}>Approve</Button>
                              <Button className="flex-1 md:flex-none" variant="secondary" onClick={() => handleRejectClaim(claim.id)}>Reject</Button>
                            </div>
                          )}
                          {claim.status === 'APPROVED' && claim.conversation && (
                            <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                              <Button className="flex-1 md:flex-none" onClick={() => router.push(`/messages/${claim.conversation.id}`)}>Open Chat</Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* CHALLENGE MODAL */}
      {showChallengeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-8 border border-[#E5E5E5] shadow-2xl">
            <h2 className="text-xl font-bold text-[#111111] uppercase tracking-tight mb-6">Set Verification Challenge</h2>
            <form onSubmit={handleCreateChallenge} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] text-[#555555] uppercase mb-2">Private Question</label>
                <input name="question" required minLength={5} maxLength={250} placeholder="e.g. What color is the laptop sleeve?" 
                  className="w-full border border-[#E5E5E5] px-4 py-3 text-sm focus:outline-none focus:border-[#111111] text-[#111111] placeholder:text-[#999999]" />
                <p className="text-[10px] text-[#555555] mt-2">This question will be shown to anyone claiming the item.</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] text-[#555555] uppercase mb-2">Expected Answer</label>
                <input name="answer" required minLength={1} maxLength={100} placeholder="e.g. Black" 
                  className="w-full border border-[#E5E5E5] px-4 py-3 text-sm focus:outline-none focus:border-[#111111] text-[#111111] placeholder:text-[#999999]" />
                <p className="text-[10px] text-[#555555] mt-2">The exact answer required to prove ownership.</p>
              </div>
              <div className="flex gap-4 pt-4 border-t border-[#E5E5E5]">
                <Button type="submit" disabled={formLoading} className="flex-1">{formLoading ? 'Saving...' : 'Save Challenge'}</Button>
                <Button type="button" variant="secondary" onClick={() => setShowChallengeModal(false)} className="flex-1">Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLAIM MODAL */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-8 border border-[#E5E5E5] shadow-2xl">
            <h2 className="text-2xl font-bold text-[#111111] uppercase tracking-tight mb-2">Claim Item</h2>
            <p className="text-sm text-[#555555] mb-8 leading-relaxed">To claim this item, please answer the verification challenge set by the finder.</p>
            <form onSubmit={handleSubmitClaim} className="space-y-6">
              <div className="bg-[#F7F7F5] p-5 border border-[#E5E5E5] mb-6">
                <p className="text-[10px] font-bold tracking-[0.2em] text-[#555555] uppercase mb-3">Verification Question</p>
                <p className="text-base font-bold text-[#111111]">{challenge?.question}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] text-[#555555] uppercase mb-2">Your Answer</label>
                <input name="answer" required minLength={1} maxLength={100} placeholder="Type your answer here..." 
                  className="w-full border border-[#E5E5E5] px-4 py-4 text-base focus:outline-none focus:border-[#111111] text-[#111111] placeholder:text-[#999999] shadow-inner" />
              </div>
              <div className="flex gap-4 pt-6 border-t border-[#E5E5E5]">
                <Button type="submit" disabled={formLoading} className="flex-1">{formLoading ? 'Submitting...' : 'Submit Claim'}</Button>
                <Button type="button" variant="secondary" onClick={() => setShowClaimModal(false)} className="flex-1">Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
