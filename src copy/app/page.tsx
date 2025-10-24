import Link from 'next/link';

export default function Home() {
  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Inventory App</h1>
      <Link href="/add" className="text-blue-500 mr-4">Add Item</Link>
      <Link href="/list" className="text-blue-500">View List</Link>
    </div>
  );
}