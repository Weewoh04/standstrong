import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3000
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        workout: resolve(__dirname, 'workout.html'),
        workoutLibrary: resolve(__dirname, 'workout-library.html'),
        pots101: resolve(__dirname, 'pots-101.html'),
        gear: resolve(__dirname, 'gear.html'),
        community: resolve(__dirname, 'community.html')
      }
    }
  }
})
