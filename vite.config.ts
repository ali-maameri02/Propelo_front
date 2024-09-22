import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    // base: '/Propelo_front.git/',

  plugins: [react()],
//   server: {
//         proxy: {
//             '/api': {
//                 target: 'http://propelo.runasp.net',
//                 changeOrigin: true,
//                 secure: false,
//             }

//         }
//     }

})
