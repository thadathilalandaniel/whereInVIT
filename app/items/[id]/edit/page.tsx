'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchApi } from '../../../../lib/api';
import { useAuth } from '../../../../components/AuthProvider';
import { ItemForm } from '../../../../components/ItemForm';

export default function EditItemPage() {
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
      } catch (err: any) {
        setError(err.message || 'Failed to load item');
      } finally {
        setLoading(false);
      }
    };
    if (id) loadItem();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow max-w-md w-full text-center">
          <h2 className="text-2xl text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error || 'Item not found'}</p>
          <button onClick={() => router.back()} className="mt-6 text-indigo-600 hover:underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!profile || profile.id !== item.reporter?.id) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow max-w-md w-full text-center">
          <h2 className="text-2xl text-red-600 mb-4">Unauthorized</h2>
          <p className="text-gray-700">You are not allowed to edit this item.</p>
          <button onClick={() => router.back()} className="mt-6 text-indigo-600 hover:underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (item.status !== 'ACTIVE') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow max-w-md w-full text-center">
          <h2 className="text-2xl text-yellow-600 mb-4">Cannot Edit</h2>
          <p className="text-gray-700">Only ACTIVE items can be edited.</p>
          <button onClick={() => router.back()} className="mt-6 text-indigo-600 hover:underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ItemForm initialData={item} isEdit={true} />
    </div>
  );
}
