# vite-plugin-minipic

**English** | [中文](README.CN.md)

vite-plugin-minipic is a helpful tool to compress images in morden vite project.  
It's easy to use, and it's faaaaaaast 🚀🚀🚀🚀!

![example](https://img1.imgtp.com/2023/10/07/WVYs4Ca8.gif)

## Why minipic?

- 🚀 Fast compress spped  
  Based on [sharp.js](https://github.com/lovell/sharp), minipic have incredibly compresse speed.  
  Fully satisfy multi-images/big-images requirements.  
  By using minipic, compress 40m images will only cost 3 seconds. Compress ratio reach 70%~80%.

- 💾 Cache control  
  Minipic will start cache control by default. It will save images into the disk when compressing images for the first time.  
  Then next time minipic will read images info directly from disk cache to speed up compression proccess.  
  And aviod repeat compression.

- 📷 Convert image types  
  You can change image type when compressing images.

- 🔎 Include/Exclude specific image types  
  You can choose which image need to be compressed.

## 📦 Install

```
npm install vite-plugin-minipic -D
```

or

```
yarn add vite-plugin-minipic -D
```

❗❗❗ Install failed?

If you can't install, add following config in your `.npmrc` file.

```
registry="https://registry.npm.taobao.org"
sharp_binary_host="https://npm.taobao.org/mirrors/sharp"
sharp_libvips_binary_host="https://npm.taobao.org/mirrors/sharp-libvips"
```

## 💻 Usage

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
					quality: 70
				}
			},
			convert: [
				{ from: 'png', to: 'jpg' },
				{ from: 'jpg', to: 'webp' },
				{ from: 'jpeg', to: 'jpg' }
			],
			cache: false,
			exclude: [],
			include: []
		})
	]
})
```

## 🔨 Options

| param        | type                   | default value                 | detail                                                                                                                                                                                                                                                                                                                                                        |
| ------------ | ---------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| sharpOptions | Object                 | [sharpOptions](#sharpoptions) | image compression options,the same config with sharp.js.For more detail config, see [sharp.js](https://sharp.pixelplumbing.com/api-output#jpeg).                                                                                                                                                                                                              |
| convert      | Object                 | [convert](#convert)           | You can change image type by this option.`from` is the original image type`to` is the compressed image type                                                                                                                                                                                                                                                   |
| cache        | Boolean                | true                          | This option will speed up compression process by saving imges in the disk. Set `false` to disable this function.                                                                                                                                                                                                                                              |
| exclude      | `string` or `string[]` | []                            | By setting this option, you can exclude files that you don't want to compress。Set exclude as string array,like `exclude:['pic1.jpg','pic2.jpg']` to exclude specific files. If set exlude as string,like `exclude:'.jpg'`, it will be regarded as a RegExp to exlude all `.jpg` files. If `exclude` and `include` both have value, `include` will be invalid |
| include      | `string` or `string[]` | []                            | By setting this option, you can include files that you want to compress。Set exclude as string array,like `include:['pic1.jpg','pic2.jpg']` to include specific files. If set exlude as string,like `include:'.jpg'`, it will be regarded as a RegExp to include all `.jpg` files. If `exclude` and `include` both have value, `include` will be invalid      |

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

## Current Support image types

avif、jpeg、jpg、png、webp、gif  
more image type will be support in later version

## TODO

- [x] cache function
- [x] exclude compress file function
- [ ] include compress file function
- [ ] Support more image types(svg……)

## License

MIT

## Inspiration

[vite-plugin-imagemin](https://github.com/vbenjs/vite-plugin-imagemin)  
[unplugin-imagemin](https://github.com/ErKeLost/unplugin-imagemin)
