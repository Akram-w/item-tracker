// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import imageCompression from 'browser-image-compression';
import { addItemAction, fetchItemsByDate, deleteItemsByDate, deleteItemById } from './actions';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2 as Grid,
  IconButton,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

interface Item {
  id: number;
  image_url: string;
  price: number;
  date: string;
}

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [items, setItems] = useState<Item[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [price, setPrice] = useState('');
  const [compressedImage, setCompressedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  const formattedDate = selectedDate ? selectedDate.format('YYYY-MM-DD') : '';

  const loadItems = async () => {
    setIsSearching(true);
    try {
      const { items: fetchedItems } = await fetchItemsByDate(formattedDate);
      setItems(fetchedItems);
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to load items');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    loadItems(); // Auto-load today's data
  }, []);

  const handleSearch = () => {
    loadItems();
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteItemsByDate(formattedDate);
      if (result?.success) {
        await loadItems();
      } else {
        alert(result?.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert('Failed to delete items');
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  };

  const handleItemDeleteConfirm = async () => {
    if (deleteItemId !== null) {
      setIsDeletingItem(true);
      try {
        const result = await deleteItemById(deleteItemId);
        if (result?.success) {
          await loadItems();
        } else {
          alert(result?.error || 'Delete failed');
        }
      } catch (error) {
        console.error('Item delete error:', error);
        alert('Failed to delete item');
      } finally {
        setIsDeletingItem(false);
        setDeleteItemId(null);
      }
    }
  };

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

  const handleAddSubmit = async () => {
    if (!compressedImage || !price) {
      alert('Please add an image and price');
      return;
    }
    setUploading(true);
    setSuccess(false);
    const formData = new FormData();
    formData.append('image', compressedImage);
    formData.append('price', price);
    try {
      const result = await addItemAction(formData);
      if (result?.success) {
        setSuccess(true);
        setAddOpen(false);
        setCompressedImage(null);
        setImagePreview(null);
        setPrice('');
        await loadItems();
      } else {
        alert(result?.error || 'Add failed');
      }
    } catch (error) {
      console.error('Add error:', error);
      alert('Failed to add item');
    } finally {
      setUploading(false);
    }
  };

  const handleImageClick = (url: string) => {
    setPreviewUrl(url);
    setPreviewOpen(true);
  };

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Inventory App
      </Typography>

      <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <DatePicker
            label="Select Date"
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Button
            variant="contained"
            startIcon={isSearching ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
            onClick={handleSearch}
            disabled={isSearching}
            fullWidth
          >
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setAddOpen(true)}
            disabled={uploading}
            fullWidth
          >
            Add
          </Button>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
            onClick={() => setDeleteOpen(true)}
            disabled={items.length === 0 || isDeleting}
            fullWidth
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {items.map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={item.image_url}
                alt="Item"
                onClick={() => handleImageClick(item.image_url)}
                sx={{ cursor: 'pointer' }}
              />
              <CardContent>
                <Typography>Price: ${item.price}</Typography>
                <Typography>Date: {new Date(item.date).toLocaleDateString()}</Typography>
              </CardContent>
              <CardActions>
                <IconButton
                  onClick={() => setDeleteItemId(item.id)}
                  color="secondary"
                  disabled={isDeletingItem}
                >
                  {isDeletingItem && deleteItemId === item.id ? (
                    <CircularProgress size={20} />
                  ) : (
                    <DeleteIcon />
                  )}
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} disableRestoreFocus={true}>
        <DialogTitle>Add Item</DialogTitle>
        <DialogContent>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageChange}
            style={{ marginBottom: '16px' }}
            disabled={uploading}
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              style={{ width: '100%', marginBottom: '16px' }}
            />
          )}
          <TextField
            label="Enter price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            fullWidth
            disabled={uploading}
          />
          {success && <Typography color="success">Item added!</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleAddSubmit} disabled={uploading}>
            {uploading ? <CircularProgress size={20} /> : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} disableRestoreFocus={true}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Delete all items for {formattedDate}?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button color="secondary" onClick={handleDeleteConfirm} disabled={isDeleting}>
            {isDeleting ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteItemId !== null}
        onClose={() => setDeleteItemId(null)}
        disableRestoreFocus={true}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Delete this item?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteItemId(null)} disabled={isDeletingItem}>
            Cancel
          </Button>
          <Button color="secondary" onClick={handleItemDeleteConfirm} disabled={isDeletingItem}>
            {isDeletingItem ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        disableRestoreFocus={true}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <img src={previewUrl} alt="Full Preview" style={{ width: '100%' }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}