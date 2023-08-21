import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath } from 'url'
import minipic from 'vite-plugin-minipic'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const pathSrc = path.resolve(__dirname, 'src')

export default defineConfig({
	plugins: [
		vue(),
		minipic({
			include: ['1.png'],
			sharp: {
				png: {
					quality: 20
				},
				jpeg: {
					quality: 33
				}
			}
		})
	],
	define: {},
	resolve: {
		alias: {
			'@': pathSrc
		}
	},
	css: {
		preprocessorOptions: {
			less: {
				javascriptEnabled: true
			}
		}
	},
	server: {
		host: '0.0.0.0',
		port: 1234,
		open: true,
		proxy: {}
	}
})
