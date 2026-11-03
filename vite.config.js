import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'vendor-pdf';
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
              id.includes('react-calendar')
            ) {
              return 'vendor-calendar';
            }
          }
        },
      },
    },
  },
});
