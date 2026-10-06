import { Suspense } from 'react';
import { ItemForm } from '../../../components/ItemForm';

export default function NewItemPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Suspense fallback={<div className="text-center p-8">Loading form...</div>}>
        <ItemForm />
      </Suspense>
    </div>
  );
}
