# vite-plugin-minipic

vite-plugin-minipic is a helpful tool to compress images in morden vite project.  
It's easy to use, and it's faaaaaaast!
Based on [sharp](https://github.com/lovell/sharp)

**English** | [中文](README.CN.md)

![example](https://img1.imgtp.com/2023/09/19/G4Dr2my3.gif)

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
	plugins: [minipic()]
})
```

### Custom Usage

in vite.config.js

```javascript
import minipic from 'vite-plugin-minipic'
export default defineConfig({
	plugins: [
		minipic({
			sharpOptions: {
				png: {
					quality: 70
				},
				jpeg: {
					quality: 33
				},
				jpg: {
					quality: 70
				}
			},
			convert: [
				{ from: 'png', to: 'webp' },
				{ from: 'jpg', to: 'webp' },
				{ from: 'jpeg', to: 'jpg' }
			],
			cache: true
		})
	]
})
```

## Options

| param        | type    | default value                 | detail                                                                                                                                           |
| ------------ | ------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| sharpOptions | Object  | [sharpOptions](#sharpoptions) | image compression options,the same config with sharp.js.For more detail config, see [sharp.js](https://sharp.pixelplumbing.com/api-output#jpeg). |
| convert      | Object  | [convert](#convert)           | You can change image type by this option.`from` is the original image type`to` is the compressed image type                                      |
| cache        | Boolean | true                          | This option will speed up compression process by saving imges in the disk. Set `false` to disable this function.                                 |

### sharpOptions

image compression options,the same config with sharp.js.  
For more detail config, see [sharp.js](https://sharp.pixelplumbing.com/api-output#jpeg).

```javascript
sharpOptions: {
	avif: {
		quality: 75
	},
	jpeg: {
		quality: 75
	},
	jpg: {
		quality: 75
	},
	png: {
		quality: 75
	},
	webp: {
		quality: 75
	},
	gif:{}
}
```

### convert

You can change image type by this option.  
`from` is the original image type  
`to` is the compressed image type

default:

```javascript
convert: [
	{ from: 'png', to: 'png' },
	{ from: 'jpg', to: 'jpeg' },
	{ from: 'jpeg', to: 'jpeg' },
	{ from: 'jpg', to: 'webp' },
	{ from: 'avif', to: 'avif' }
]
```

## Examples

Run examples

```
yarn vue3
```

or

```
npm run vue3
```

## TODO

- [x] cache function
- [ ] public filepath compress

## License

MIT

## Inspiration

[vite-plugin-imagemin](https://github.com/vbenjs/vite-plugin-imagemin)  
[unplugin-imagemin](https://github.com/ErKeLost/unplugin-imagemin)
