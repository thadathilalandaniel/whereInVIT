import { Suspense } from 'react';
import { ItemsFeed } from '../../components/ItemsFeed';

export default function LostPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading...</div>}>
      <ItemsFeed type="LOST" />
    </Suspense>
  );
}
