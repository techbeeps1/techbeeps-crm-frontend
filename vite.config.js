import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'vendor-mui';
            }
            if (
              id.includes('apexcharts') ||
              id.includes('react-apexcharts') ||
              id.includes('jsvectormap')
            ) {
              return 'vendor-charts';
            }
            if (
              id.includes('react-big-calendar') ||
              id.includes('react-datepicker') ||
              id.includes('date-fns') ||
              id.includes('react-calendar')
            ) {
              return 'vendor-calendar';
            }
            if (id.includes('jspdf')) {
              return 'vendor-jspdf';
            }
            if (
              id.includes('react-icons') ||
              id.includes('@heroicons') ||
              id.includes('lucide-react')
            ) {
              return 'vendor-icons';
            }
            if (
              id.includes('lodash') ||
              id.includes('axios') ||
              id.includes('redux') ||
              id.includes('@reduxjs') ||
              id.includes('dompurify')
            ) {
              return 'vendor-utils';
            }
            if (
              id.includes('react-router-dom') ||
              id.includes('react-dom') ||
              id.includes('react/')
            ) {
              return 'vendor-react-core';
            }
          }
        },
      },
    },
  },
});
