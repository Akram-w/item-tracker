// src/app/not-found.tsx
import { Typography, Container } from '@mui/material';

export default function NotFound() {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4">404 - Page Not Found</Typography>
      <Typography>Sorry, the page you requested does not exist.</Typography>
    </Container>
  );
}