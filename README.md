# vite-plugin-minipic

**English** | [中文](./README.CN.md)

Based on [sharp](https://github.com/lovell/sharp), vite-plugin-minipic is a helpful tool to compress images in morden vite project.  
It's easy to use, and it's faaaaaaast!

## Install

```
npm install vite-plugin-minipic -D
```

or

```
yarn add vite-plugin-minipic -D
```

## Usage

### Basic Usage

in vite.config.js

```javascript
import minipic from 'vite-plugin-minipic'
export default defineConfig({
	plugins: [vue(), minipic()]
})
```

### Custom Usage

in vite.config.js

```javascript
import minipic from 'vite-plugin-minipic'
export default defineConfig({
	plugins: [
		vue(),
		minipic({
			jpeg: {
				quality: 75
			},
			jpg: {
				quality: 70
			},
			png: {
				quality: 60
			},
			webp: {
				quality: 80
			},
			avif: {
				quality: 60
			}
		})
	]
})
```

For more detail config, see [sharp.js](https://sharp.pixelplumbing.com/api-output#jpeg).

## Examples

Run examples

```
yarn vue3
```

or

```
npm run vue3
```

## License

MIT

## Inspiration

[vite-plugin-imagemin](https://github.com/vbenjs/vite-plugin-imagemin)  
[unplugin-imagemin](https://github.com/ErKeLost/unplugin-imagemin)
