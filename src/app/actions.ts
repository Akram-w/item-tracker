'use server';

import { sql } from '@/lib/db';
import { put, del } from '@vercel/blob';
import { revalidatePath } from 'next/cache';

interface Item {
  id: number;
  image_url: string;
  price: number;
  date: string;
}

export async function addItemAction(formData: FormData) {
  const price = parseFloat(formData.get('price') as string);
  const imageFile = formData.get('image') as File;

  if (!imageFile || isNaN(price)) {
    return { error: 'Invalid input: Missing image or invalid price' };
  }

  try {
    const { url } = await put(`items/${Date.now()}-${imageFile.name}`, imageFile, {
      access: 'public',
      contentType: imageFile.type,
    });

    await sql`
      INSERT INTO items (image_url, price, date)
      VALUES (${url}, ${price}, ${new Date().toISOString()})
    `;
  } catch (error) {
    console.error('Error adding item:', error); // Log for debugging
    return { error: 'Failed to add item. Please try again.' };
  }

  revalidatePath('/');
  return { success: true };
}

export async function fetchItemsByDate(formattedDate: string): Promise<{ items: Item[] }> {
  try {
    const { rows } = await sql<Item>`
      SELECT * FROM items
      WHERE date::date = ${formattedDate}
      ORDER BY date DESC
    `;
    return { items: rows };
  } catch (error) {
    console.error('Error fetching items:', error);
    return { items: [] };
  }
}

export async function deleteItemsByDate(formattedDate: string) {
  try {
    console.log({formattedDate})
    const { rows } = await sql<{ image_url: string }>`
      SELECT image_url FROM items
      WHERE date::date = ${formattedDate}
    `;
    console.log({rows})
    for (const { image_url } of rows) {
      await del(image_url);
    }

    await sql`
      DELETE FROM items
      WHERE date::date = ${formattedDate}
    `;
  } catch (error) {
    console.error('Error deleting items:', error);
    return { error: 'Failed to delete items. Please try again.' };
  }

  revalidatePath('/');
  return { success: true };
}

export async function deleteItemById(id: number) {
  try {
    const { rows } = await sql<{ image_url: string }>`
      SELECT image_url FROM items
      WHERE id = ${id}
    `;

    if (rows.length > 0) {
      await del(rows[0].image_url);
    }

    await sql`
      DELETE FROM items
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error('Error deleting item:', error);
    return { error: 'Failed to delete item. Please try again.' };
  }

  revalidatePath('/');
  return { success: true };
}