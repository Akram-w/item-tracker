import { sql } from '@/lib/db';

interface Item {
  id: number;
  image_url: string;
  price: number;
  date: string;
}

async function getItems(): Promise<Item[]> {
  const { rows } = await sql<Item>`SELECT * FROM items ORDER BY date DESC`;
  return rows;
}

export default async function ItemList() {
  const items = await getItems();

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Item List</h1>
      <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item) => (
          <li key={item.id} className="border p-4">
            <img src={item.image_url} alt="Item" className="mb-2 w-full h-auto" />
            <p>Price: ${item.price}</p>
            <p>Date: {new Date(item.date).toLocaleDateString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}