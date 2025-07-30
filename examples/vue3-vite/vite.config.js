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
			sharpOptions: {
				png: {
					quality: 70
				},
				jpeg: {
					quality: 70
				}
			},
			convert: [
				{ from: 'png', to: 'webp' },
				{ from: 'jpg', to: 'webp' }
			],
			convertPublic: false,
			cache: false,
			exclude: ['pic-exclude.png'],
			include: [],
			limitInputPixels: true
		})
	],
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
	},
	build: {
		// add sourcemap situation test
		sourcemap: true
	}
})
