'use client';

import { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import { addItemAction } from './actions';

export default function AddItem() {
  const [price, setPrice] = useState('');
  const [compressedImage, setCompressedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false); // Optional: For success feedback

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1920 };
        const compressedFile = await imageCompression(file, options);
        
        setCompressedImage(compressedFile);
        
        const previewUrl = URL.createObjectURL(compressedFile);
        setImagePreview(previewUrl);
      } catch (error) {
        console.error('Compression error:', error);
        alert('Failed to compress image. Try a smaller file.');
      }
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Add Item</h1>

      {success && (
        <p className="text-green-500 mb-4">Item added successfully!</p>
      )}

      <form
        action={async () => {
          if (!compressedImage || !price) {
            alert('Please add an image and price');
            return;
          }
          setUploading(true);
          setSuccess(false); // Reset success message
          const formData = new FormData();
          formData.append('image', compressedImage);
          formData.append('price', price);
          const result = await addItemAction(formData);
          setUploading(false);
          
          if (result?.error) {
            alert(result.error);
            return;
          }
          
          if (result?.success) {
            setSuccess(true); // Show success
            // Reset form without reload
            setCompressedImage(null);
            setImagePreview(null);
            setPrice('');
            // Clear file input (optional: reset the input value)
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
          }
        }}
      >
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageChange}
          className="mb-3"
          required
        />

        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="mb-3 w-full h-auto rounded"
          />
        )}

        <input
          type="number"
          placeholder="Enter price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border p-2 w-full mb-3"
          required
        />

        <button
          type="submit"
          disabled={uploading}
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          {uploading ? "Uploading..." : "Add"}
        </button>
      </form>
    </div>
  );
}