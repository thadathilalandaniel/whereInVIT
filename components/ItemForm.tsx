'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchApi, getImageUrl } from '../lib/api';
import { useAuth } from './AuthProvider';
import { TypeSelector } from './TypeSelector';

export function ItemForm({ initialData, isEdit }: { initialData?: any; isEdit?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryType = searchParams.get('type');
  const defaultType = queryType === 'FOUND' ? 'FOUND' : 'LOST';
  const { profile, loading: authLoading } = useAuth();

  const [categories, setCategories] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  
  const [type, setType] = useState(initialData?.type || defaultType);
  const [title, setTitle] = useState(initialData?.title || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [venueId, setVenueId] = useState(initialData?.venueId || '');
  const [description, setDescription] = useState(initialData?.description || '');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl ? getImageUrl(initialData.imageUrl) : null);
  const [removeImage, setRemoveImage] = useState(false); // track if the user wants to remove an existing image
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit && (queryType === 'LOST' || queryType === 'FOUND')) {
      setType(queryType);
    }
  }, [queryType, isEdit]);

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
  }, [categoryId, venueId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Only JPG, PNG, and WEBP are allowed.');
      e.target.value = ''; // reset input
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5 MB.');
      e.target.value = ''; // reset input
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveImage(false);
    setError(null);
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setLoading(true); 
    setError(null);
    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('title', title);
      formData.append('categoryId', categoryId);
      formData.append('venueId', venueId);
      formData.append('description', description);
      
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (removeImage) {
        // Signal backend to remove the image if empty
        formData.append('imageUrl', 'null');
      }

      if (isEdit) {
        await fetchApi(`/items/${initialData.id}`, { method: 'PATCH', body: formData });
        router.push(`/items/${initialData.id}`);
      } else {
        const result = await fetchApi('/items', { method: 'POST', body: formData });
        router.push(`/items/${result.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save item'); 
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !profile) {
      if (isEdit && initialData?.id) {
        router.push(`/login?next=/items/${initialData.id}/edit`);
      } else {
        router.push(`/login?next=/items/new?type=${type}`);
      }
    }
  }, [authLoading, profile, router, type, isEdit, initialData]);

  if (authLoading || !profile) {
    return <div className="p-20 text-center uppercase tracking-widest text-xs font-bold text-[#555555]">Authenticating...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white p-10 md:p-14 border border-[#E5E5E5] mt-12 mb-20 shadow-sm">
      <h1 className="text-3xl font-extrabold mb-8 text-[#111111] uppercase tracking-tight">{isEdit ? 'Edit Item' : 'Report an Item'}</h1>
      {error && (
        <div className="bg-[#111111] text-white p-4 mb-8 text-sm font-semibold tracking-wide flex items-center">
          <span className="mr-3 font-bold uppercase tracking-[0.2em] text-[10px] bg-white text-[#111111] px-2 py-1">ERROR</span>
          {error}
        </div>
      )}
      
      <div className="space-y-8">
        {!isEdit && (
          <div className="pb-8 border-b border-[#E5E5E5]">
            <label className="block text-[10px] font-bold tracking-[0.2em] text-[#555555] uppercase mb-4">I have...</label>
            <TypeSelector 
              type={type as 'LOST' | 'FOUND'} 
              onChange={(t) => {
                setType(t);
                router.replace(`/items/new?type=${t}`, { scroll: false });
              }} 
              lostLabel="LOST AN ITEM" 
              foundLabel="FOUND AN ITEM" 
            />
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold tracking-[0.2em] text-[#555555] uppercase mb-2">Title</label>
          <input type="text" required maxLength={100} placeholder="e.g. Black AirPods Pro" 
            className="w-full border border-[#E5E5E5] bg-[#F7F7F5] rounded-none px-4 py-4 text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-[#111111] focus:bg-white transition-colors text-sm" 
            value={title} onChange={e => setTitle(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-bold tracking-[0.2em] text-[#555555] uppercase mb-2">Category</label>
            <select required 
              className="w-full border border-[#E5E5E5] bg-[#F7F7F5] rounded-none px-4 py-4 text-[#111111] focus:outline-none focus:border-[#111111] focus:bg-white transition-colors text-sm" 
              value={categoryId} onChange={e => setCategoryId(e.target.value)}>
              <option value="" disabled>Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold tracking-[0.2em] text-[#555555] uppercase mb-2">Venue</label>
            <select required 
              className="w-full border border-[#E5E5E5] bg-[#F7F7F5] rounded-none px-4 py-4 text-[#111111] focus:outline-none focus:border-[#111111] focus:bg-white transition-colors text-sm" 
              value={venueId} onChange={e => setVenueId(e.target.value)}>
              <option value="" disabled>Select Venue</option>
              {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold tracking-[0.2em] text-[#555555] uppercase mb-2">Description</label>
          <textarea required maxLength={1000} rows={5} placeholder="Provide specific details..." 
            className="w-full border border-[#E5E5E5] bg-[#F7F7F5] rounded-none px-4 py-4 text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-[#111111] focus:bg-white transition-colors text-sm resize-none" 
            value={description} onChange={e => setDescription(e.target.value)} />
        </div>

        <div className="pt-4 border-t border-[#E5E5E5]">
          <label className="block text-[10px] font-bold tracking-[0.2em] text-[#555555] uppercase mb-4">Item Image</label>
          
          {imagePreview ? (
            <div className="space-y-4">
              <div className="relative w-full md:w-2/3 h-64 bg-[#E5E5E5] border border-[#E5E5E5]">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button type="button" onClick={handleClearImage} className="absolute top-2 right-2 bg-white text-[#111111] text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-2 border border-[#E5E5E5] hover:bg-[#111111] hover:text-white hover:border-[#111111] transition-colors shadow-sm">
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full md:w-2/3 border-2 border-dashed border-[#E5E5E5] hover:border-[#111111] transition-colors p-8 flex flex-col items-center justify-center text-center bg-[#F7F7F5]">
              <p className="text-sm font-semibold text-[#111111] mb-2">Upload Image</p>
              <p className="text-xs text-[#555555] mb-6">JPG, PNG, WEBP (Max 5MB)</p>
              <label className="cursor-pointer bg-[#111111] text-white px-6 py-3 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-[#333333] transition-colors">
                Select File
                <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-10 mt-8 border-t border-[#E5E5E5]">
          <button type="button" onClick={() => router.back()} className="px-8 py-4 bg-[#F7F7F5] text-[#111111] text-[10px] font-bold tracking-[0.2em] uppercase border border-[#E5E5E5] hover:border-[#111111] transition-colors" disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="px-8 py-4 bg-[#111111] text-white text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-[#333333] transition-colors border border-[#111111] disabled:opacity-50" disabled={loading}>
            {loading ? 'Processing...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </form>
  );
}
