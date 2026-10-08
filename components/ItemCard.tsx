import Link from 'next/link';
import { getImageUrl } from '../lib/api';

export function ItemCard({ item }: { item: any }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col">
      {item.imageUrl ? (
        <div className="h-48 bg-gray-200 w-full overflow-hidden">
          <img src={getImageUrl(item.imageUrl) || ''} alt={item.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="h-48 bg-gray-200 w-full flex items-center justify-center text-gray-500">No image</div>
      )}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate" title={item.title}>{item.title}</h3>
          <span className={`px-2 py-1 text-xs font-semibold rounded ${item.type === 'LOST' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{item.type}</span>
        </div>
        <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-2">{item.description}</p>
        <div className="flex flex-col gap-1 text-xs text-gray-500 mb-4">
          <div><span className="font-medium">Category:</span> {item.category?.name}</div>
          <div><span className="font-medium">Venue:</span> {item.venue?.name}</div>
          <div><span className="font-medium">Status:</span> {item.status}</div>
          <div><span className="font-medium">Date:</span> {new Date(item.createdAt).toLocaleDateString()}</div>
        </div>
        <Link href={`/items/${item.id}`} className="mt-auto block text-center bg-indigo-50 text-indigo-700 py-2 rounded font-medium hover:bg-indigo-100 transition-colors">View Details</Link>
      </div>
    </div>
  );
}
