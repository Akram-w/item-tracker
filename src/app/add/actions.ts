'use server';

import { sql } from '@/lib/db';
import { put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';

export async function addItemAction(formData: FormData) {
  const price = parseFloat(formData.get('price') as string);
  const imageFile = formData.get('image') as File;

  if (!imageFile || isNaN(price)) {
    return { error: 'Invalid input: Missing image or invalid price' };
  }

  try {
    // Upload file directly to Vercel Blob
    const { url } = await put(`items/${Date.now()}-${imageFile.name}`, imageFile, {
      access: 'public',
      contentType: imageFile.type,
    });

    // Insert into Postgres
    await sql`
      INSERT INTO items (image_url, price, date)
      VALUES (${url}, ${price}, ${new Date().toISOString()})
    `;
  } catch (error) {
    console.error('Error adding item:', error);
    return { error: 'Failed to add item. Please try again.' };
  }

  // Revalidate the list page cache (for when user navigates there later)
  revalidatePath('/list');

  // Return success instead of redirect
  return { success: true };
}