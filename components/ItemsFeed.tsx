'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api';
import { ItemCard } from './ItemCard';

export function ItemsFeed({ type }: { type: 'LOST' | 'FOUND' }) {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [venue, setVenue] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    Promise.all([fetchApi('/categories').catch(() => []), fetchApi('/venues').catch(() => [])]).then(([cats, vens]) => { setCategories(cats || []); setVenues(vens || []); });
  }, []);

  useEffect(() => { fetchItems(); }, [type, search, category, venue, page]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({ type, page: page.toString(), status: 'ACTIVE' });
      if (search) query.append('search', search);
      if (category) query.append('categoryId', category);
      if (venue) query.append('venueId', venue);
      
      const res = await fetchApi(`/items?${query.toString()}`);
      setItems(res.items || []); setTotalPages(res.pagination?.totalPages || 1); setError(null);
    } catch (err: any) { setError(err.message || 'Failed to load items'); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{type === 'LOST' ? 'Lost Items' : 'Found Items'}</h1>
      <div className="bg-white p-4 rounded-lg shadow mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div><input type="text" className="w-full border rounded p-2 text-black" placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></div>
        <div><select className="w-full border rounded p-2 text-black" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}><option value="">All Categories</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div><select className="w-full border rounded p-2 text-black" value={venue} onChange={e => { setVenue(e.target.value); setPage(1); }}><option value="">All Venues</option>{venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></div>
      </div>
      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-8">{error}</div>}
      {loading && items.length === 0 ? <div className="text-center py-20 text-gray-500">Loading...</div> : items.length === 0 ? <div className="text-center py-20 text-gray-500 bg-white rounded shadow">No items found.</div> : (
        <><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{items.map(item => <ItemCard key={item.id} item={item} />)}</div>
        {totalPages > 1 && <div className="mt-8 flex justify-center space-x-2"><button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-4 py-2 border rounded">Prev</button><span className="px-4 py-2">Page {page} of {totalPages}</span><button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-4 py-2 border rounded">Next</button></div>}</>
      )}
    </div>
  );
}
