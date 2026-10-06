'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchApi } from '../../../lib/api';
import { useAuth } from '../../../components/AuthProvider';
import Link from 'next/link';

export default function ItemDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { profile } = useAuth();
  
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadItem = async () => {
      try {
        const data = await fetchApi(`/items/${id}`);
        setItem(data);
      } catch (err: any) { setError(err.message || 'Failed to load item'); } finally { setLoading(false); }
    };
    if (id) loadItem();
  }, [id]);

  const handleResolve = async () => {
    if (!confirm('Are you sure you want to resolve this item?')) return;
    try {
      await fetchApi(`/items/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'RESOLVED' }) });
      setItem({ ...item, status: 'RESOLVED' });
    } catch (err: any) { alert(err.message || 'Failed to resolve item'); }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing permanently?')) return;
    try {
      await fetchApi(`/items/${id}`, { method: 'DELETE' });
      router.push('/');
    } catch (err: any) { alert(err.message || 'Failed to delete item'); }
  };

  if (loading) return <div className="flex justify-center py-20 text-indigo-600">Loading...</div>;
  if (error || !item) return <div className="text-center py-20 text-red-600">{error || 'Item not found'}</div>;
  const isOwner = profile?.id === item.reporter?.id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {item.imageUrl && <div className="w-full h-64 bg-gray-200"><img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" /></div>}
        <div className="p-8">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{item.title}</h1>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${item.type === 'LOST' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{item.type}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div><h3 className="text-sm font-medium text-gray-500">Status</h3><p className="mt-1 text-lg text-gray-900">{item.status}</p></div>
              <div><h3 className="text-sm font-medium text-gray-500">Category</h3><p className="mt-1 text-lg text-gray-900">{item.category?.name}</p></div>
              <div><h3 className="text-sm font-medium text-gray-500">Venue</h3><p className="mt-1 text-lg text-gray-900">{item.venue?.name} ({item.venue?.category})</p></div>
            </div>
            <div className="space-y-4">
              <div><h3 className="text-sm font-medium text-gray-500">Reported By</h3><p className="mt-1 text-lg text-gray-900">{item.reporter?.name || 'Anonymous'}</p></div>
              <div><h3 className="text-sm font-medium text-gray-500">Date Reported</h3><p className="mt-1 text-lg text-gray-900">{new Date(item.createdAt).toLocaleString()}</p></div>
            </div>
          </div>
          <div><h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3><div className="bg-gray-50 p-4 rounded-md text-gray-700 whitespace-pre-wrap">{item.description}</div></div>
          {isOwner && item.status === 'ACTIVE' && (
            <div className="mt-8 pt-8 border-t border-gray-200 flex space-x-4">
              <Link href={`/items/${item.id}/edit`} className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Edit</Link>
              <button onClick={handleResolve} className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">Resolve</button>
              <button onClick={handleDelete} className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 ml-auto">Delete</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
