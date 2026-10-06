'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { fetchApi } from '../lib/api';
import { ItemCard } from './ItemCard';

export function ItemsFeed({ type }: { type: 'LOST' | 'FOUND' }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('categoryId') || '';
  const initialVenue = searchParams.get('venueId') || '';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  const [category, setCategory] = useState(initialCategory);
  const [venue, setVenue] = useState(initialVenue);
  const [page, setPage] = useState(initialPage);

  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState<number | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      if (searchInput !== debouncedSearch) {
        setPage(1);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, debouncedSearch]);

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (category) params.set('categoryId', category);
    if (venue) params.set('venueId', venue);
    if (page > 1) params.set('page', page.toString());

    const newQueryString = params.toString();
    const newUrl = newQueryString ? `${pathname}?${newQueryString}` : pathname;
    
    router.replace(newUrl, { scroll: false });
  }, [debouncedSearch, category, venue, page, pathname, router]);

  // Initial Data Fetch
  useEffect(() => {
    const extractArray = (res: any) => {
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.data)) return res.data;
      if (res && Array.isArray(res.items)) return res.items;
      return [];
    };

    Promise.all([
      fetchApi('/categories').catch(() => []),
      fetchApi('/venues').catch(() => [])
    ]).then(([cats, vens]) => {
      setCategories(extractArray(cats));
      setVenues(extractArray(vens));
    });
  }, []);

  // Fetch Items
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const query = new URLSearchParams({ type, page: page.toString(), status: 'ACTIVE' });
      if (debouncedSearch) query.append('search', debouncedSearch);
      if (category) query.append('categoryId', category);
      if (venue) query.append('venueId', venue);
      
      const res = await fetchApi(`/items?${query.toString()}`);
      setItems(Array.isArray(res?.items) ? res.items : []);
      setTotalPages(res?.pagination?.totalPages || 1); 
      setTotalItems(res?.pagination?.total ?? null);
    } catch (err: any) { 
      setError(err.message || 'Unable to load items.'); 
    } finally { 
      setLoading(false); 
    }
  }, [type, page, debouncedSearch, category, venue]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const clearFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setCategory('');
    setVenue('');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{type === 'LOST' ? 'Lost Items' : 'Found Items'}</h1>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
          <input 
            type="text" 
            className="w-full border border-gray-300 rounded-md p-2 text-black focus:ring-indigo-500 focus:border-indigo-500" 
            placeholder="Search items..." 
            value={searchInput} 
            onChange={e => setSearchInput(e.target.value)} 
          />
        </div>
        <div className="w-full md:w-48">
          <select 
            className="w-full border border-gray-300 rounded-md p-2 text-black focus:ring-indigo-500 focus:border-indigo-500" 
            value={category} 
            onChange={e => { setCategory(e.target.value); setPage(1); }}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="w-full md:w-48">
          <select 
            className="w-full border border-gray-300 rounded-md p-2 text-black focus:ring-indigo-500 focus:border-indigo-500" 
            value={venue} 
            onChange={e => { setVenue(e.target.value); setPage(1); }}
          >
            <option value="">All Venues</option>
            {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
        <button 
          onClick={clearFilters}
          className="w-full md:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 whitespace-nowrap"
        >
          Clear Filters
        </button>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg text-center shadow-sm">
          <p className="mb-4">{error}</p>
          <button 
            onClick={fetchItems}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md font-medium transition-colors"
          >
            Try again
          </button>
        </div>
      ) : loading && items.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 bg-indigo-200 rounded-full mb-4"></div>
            <div>Loading items...</div>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg shadow border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-500 mb-4">Try changing your search or filters.</p>
          <button 
            onClick={clearFilters}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-500">
            {totalItems !== null ? `${totalItems} items found` : `Showing page ${page} of ${totalPages}`}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map(item => <ItemCard key={item.id} item={item} />)}
          </div>
          
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center space-x-4">
              <button 
                disabled={page <= 1} 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-700 font-medium bg-white shadow-sm"
              >
                &larr; Previous
              </button>
              <div className="text-sm text-gray-600 font-medium">
                {page} / {totalPages}
              </div>
              <button 
                disabled={page >= totalPages} 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-700 font-medium bg-white shadow-sm"
              >
                Next &rarr;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
