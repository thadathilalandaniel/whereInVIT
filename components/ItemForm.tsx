'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '../lib/api';

export function ItemForm({ initialData, isEdit }: { initialData?: any; isEdit?: boolean }) {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [type, setType] = useState(initialData?.type || 'LOST');
  const [title, setTitle] = useState(initialData?.title || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [venueId, setVenueId] = useState(initialData?.venueId || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const extractArray = (res: any) => {
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.data)) return res.data;
      if (res && Array.isArray(res.items)) return res.items;
      return [];
    };

    Promise.all([fetchApi('/categories').catch(() => []), fetchApi('/venues').catch(() => [])])
      .then(([cats, vens]) => {
        const parsedCats = extractArray(cats);
        const parsedVens = extractArray(vens);
        setCategories(parsedCats); 
        setVenues(parsedVens);
        if (!categoryId && parsedCats && parsedCats.length > 0) setCategoryId(parsedCats[0].id);
        if (!venueId && parsedVens && parsedVens.length > 0) setVenueId(parsedVens[0].id);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null);
    try {
      const payload = { type, title, categoryId, venueId, description, imageUrl: imageUrl || undefined };
      if (isEdit) {
        await fetchApi(`/items/${initialData.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        router.push(`/items/${initialData.id}`);
      } else {
        const result = await fetchApi('/items', { method: 'POST', body: JSON.stringify(payload) });
        router.push(`/items/${result.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save item'); setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow mt-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">{isEdit ? 'Edit Item' : 'Report an Item'}</h1>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
      <div className="space-y-6">
        {!isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">I have...</label>
            <div className="flex space-x-4">
              <label className="flex items-center"><input type="radio" checked={type === 'LOST'} onChange={() => setType('LOST')} className="mr-2" /><span className="text-gray-900">Lost an item</span></label>
              <label className="flex items-center"><input type="radio" checked={type === 'FOUND'} onChange={() => setType('FOUND')} className="mr-2" /><span className="text-gray-900">Found an item</span></label>
            </div>
          </div>
        )}
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input type="text" required maxLength={100} className="w-full border border-gray-300 rounded-md p-2 text-black" value={title} onChange={e => setTitle(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><select required className="w-full border border-gray-300 rounded-md p-2 text-black" value={categoryId} onChange={e => setCategoryId(e.target.value)}><option value="" disabled>Select</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Venue</label><select required className="w-full border border-gray-300 rounded-md p-2 text-black" value={venueId} onChange={e => setVenueId(e.target.value)}><option value="" disabled>Select</option>{venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea required maxLength={1000} rows={4} className="w-full border border-gray-300 rounded-md p-2 text-black" value={description} onChange={e => setDescription(e.target.value)} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label><input type="url" className="w-full border border-gray-300 rounded-md p-2 text-black" value={imageUrl} onChange={e => setImageUrl(e.target.value)} /></div>
        <div className="flex justify-end space-x-4 pt-4">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 border rounded-md" disabled={loading}>Cancel</button>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md" disabled={loading}>{loading ? 'Saving...' : 'Save Item'}</button>
        </div>
      </div>
    </form>
  );
}
