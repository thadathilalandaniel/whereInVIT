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
  
  const [activeFilterTab, setActiveFilterTab] = useState<'ALL' | 'CATEGORY' | 'VENUE'>('ALL');

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
    setActiveFilterTab('ALL');
  };

  return (
    <div className="pb-24">
      {/* Search Header Area */}
      <div className="bg-[#F7F7F5] border-b border-[#E5E5E5] pt-16 pb-12 px-6 md:px-12 mb-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-[#111111] mb-2">
            {type === 'LOST' ? 'Lost Items' : 'Found Items'}
          </h1>
          <p className="text-sm font-bold tracking-[0.2em] text-[#555555] uppercase mb-10">
            What are you looking for?
          </p>
          
          <div className="relative mb-10 shadow-sm">
            <span className="absolute inset-y-0 left-0 flex items-center pl-6 text-[#111111]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <input 
              type="text" 
              className="w-full bg-white border border-[#E5E5E5] pl-16 pr-6 py-6 text-lg md:text-xl text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-[#111111] transition-colors rounded-none"
              placeholder={`Search ${type === 'LOST' ? 'lost' : 'found'} items...`}
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
          </div>

          <div className="flex border-b border-[#E5E5E5]">
            <button 
              onClick={() => setActiveFilterTab('ALL')}
              className={`pb-4 px-2 text-xs font-bold tracking-[0.2em] uppercase transition-colors relative ${activeFilterTab === 'ALL' ? 'text-[#111111]' : 'text-[#999999] hover:text-[#555555]'}`}
            >
              All
              {activeFilterTab === 'ALL' && <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#111111]" />}
            </button>
            <button 
              onClick={() => setActiveFilterTab('CATEGORY')}
              className={`ml-8 pb-4 px-2 text-xs font-bold tracking-[0.2em] uppercase transition-colors relative ${activeFilterTab === 'CATEGORY' ? 'text-[#111111]' : 'text-[#999999] hover:text-[#555555]'}`}
            >
              Category {category && '•'}
              {activeFilterTab === 'CATEGORY' && <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#111111]" />}
            </button>
            <button 
              onClick={() => setActiveFilterTab('VENUE')}
              className={`ml-8 pb-4 px-2 text-xs font-bold tracking-[0.2em] uppercase transition-colors relative ${activeFilterTab === 'VENUE' ? 'text-[#111111]' : 'text-[#999999] hover:text-[#555555]'}`}
            >
              Venue {venue && '•'}
              {activeFilterTab === 'VENUE' && <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#111111]" />}
            </button>
          </div>

          <div className="min-h-[4rem] transition-all">
            {activeFilterTab === 'CATEGORY' && (
              <div className="pt-6">
                <select 
                  className="w-full md:w-1/2 border border-[#E5E5E5] bg-white rounded-none px-4 py-4 text-[#111111] focus:outline-none focus:border-[#111111] transition-colors text-sm font-semibold"
                  value={category}
                  onChange={e => { setCategory(e.target.value); setPage(1); }}
                >
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}

            {activeFilterTab === 'VENUE' && (
              <div className="pt-6">
                <select 
                  className="w-full md:w-1/2 border border-[#E5E5E5] bg-white rounded-none px-4 py-4 text-[#111111] focus:outline-none focus:border-[#111111] transition-colors text-sm font-semibold"
                  value={venue}
                  onChange={e => { setVenue(e.target.value); setPage(1); }}
                >
                  <option value="">All Locations</option>
                  {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
            )}
            
            {activeFilterTab === 'ALL' && (
              <div className="pt-6 flex gap-4">
                {(category || venue) && (
                  <button 
                    onClick={clearFilters}
                    className="text-xs font-bold tracking-[0.2em] uppercase text-[#555555] hover:text-[#111111] transition-colors"
                  >
                    Clear Active Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        {error ? (
          <div className="bg-[#111111] text-white p-6 flex items-center shadow-sm max-w-7xl mx-auto mt-8">
            <span className="mr-4 font-bold uppercase tracking-[0.2em] text-[10px] bg-white text-[#111111] px-2 py-1">ERROR</span>
            <span className="text-sm font-medium">{error}</span>
            <button 
              onClick={fetchItems}
              className="ml-auto px-4 py-2 bg-white text-[#111111] text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-gray-200 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : loading && items.length === 0 ? (
          <div className="text-center py-32 text-[#999999]">
            <div className="animate-pulse flex flex-col items-center">
              <div className="text-xs font-bold tracking-[0.2em] uppercase mb-4 text-[#111111]">Loading items...</div>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-32 bg-white border border-[#E5E5E5] mt-8 max-w-7xl mx-auto shadow-sm">
            <h3 className="text-2xl font-extrabold uppercase tracking-tight text-[#111111] mb-2">No Items Found</h3>
            <p className="text-sm font-medium text-[#555555] mb-8">Try another search or adjust your filters.</p>
            <button 
              onClick={clearFilters}
              className="px-8 py-4 bg-[#111111] text-white text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-[#333333] transition-colors border border-[#111111]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 border-b border-[#E5E5E5] pb-4 flex flex-col md:flex-row justify-between items-baseline gap-4">
              <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-[#111111]">
                {totalItems !== null ? `${totalItems} ${type === 'LOST' ? 'LOST' : 'FOUND'} ITEM${totalItems !== 1 ? 'S' : ''}` : 'SEARCHING...'}
              </h2>
              {totalPages > 0 && (
                <div className="text-[10px] font-bold tracking-[0.2em] text-[#999999] uppercase">
                  Page {page} of {totalPages}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.map(item => <ItemCard key={item.id} item={item} />)}
            </div>
            
            {totalPages > 1 && (
              <div className="mt-16 pt-8 border-t border-[#E5E5E5] flex justify-between items-center">
                <button 
                  disabled={page <= 1} 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  className="px-6 py-4 bg-white text-[#111111] text-[10px] font-bold tracking-[0.2em] uppercase border border-[#E5E5E5] hover:border-[#111111] transition-colors disabled:opacity-50 disabled:hover:border-[#E5E5E5]"
                >
                  Previous
                </button>
                <div className="text-[10px] font-bold tracking-[0.2em] text-[#555555] uppercase">
                  {page} / {totalPages}
                </div>
                <button 
                  disabled={page >= totalPages} 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                  className="px-6 py-4 bg-[#111111] text-white text-[10px] font-bold tracking-[0.2em] uppercase border border-[#111111] hover:bg-[#333333] transition-colors disabled:opacity-50 disabled:hover:bg-[#111111]"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
