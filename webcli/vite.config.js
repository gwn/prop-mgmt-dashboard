import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const {WEBCLI_PORT} = process.env


export default defineConfig({
    plugins: [react()],
    server: {port: WEBCLI_PORT},
    envDir: '..',
})
