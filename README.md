# vite-plugin-minipic

> 🌐 **Need to compress images online? Try [MiniPicWeb](https://minipic.60late.com/), a free online image compression tool from the author of this plugin.**

**English** | [中文](README.CN.md)

vite-plugin-minipic is a helpful tool to compress images in morden vite project.  
It's easy to use, and it's faaaaaaast 🚀🚀🚀🚀!

![example](./examples/vue3-vite/src/assets/img/performance.gif)

## ❓ Why minipic?

- 🚀 Fast compress speed  
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
- 📂 Public folder support (Version≥1.1)
  Support compress images in public folder.

## 📦 Install

```
npm install vite-plugin-minipic -D
```

You can choose whatever pacakge manager as you like, recommend `yarn` or `pnpm`

❗❗❗ Install failed?

If you can't install, add following config in your `.npmrc` file.

```
registry="https://registry.npmmirror.com"
sharp_binary_host="https://registry.npmmirror.com/-/binary/sharp"
sharp_libvips_binary_host="https://registry.npmmirror.com/-/binary/sharp-libvips"
```

other questions, see [QA](https://github.com/60late/vite-plugin-minipic/issues/2)

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
			convertPublic: false,
			cache: false,
			exclude: [],
			include: []
		})
	]
})
```

## 🔨 Options

| param                               | type                   | default value                 | detail                                                                                                                                                                                                                                                                                                                                                        |
| ----------------------------------- | ---------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| sharpOptions                        | Object                 | [sharpOptions](#sharpoptions) | image compression options,the same config with sharp.js.For more detail config, see [sharp.js](https://sharp.pixelplumbing.com/api-output#jpeg).                                                                                                                                                                                                              |
| convert                             | Object                 | [convert](#convert)           | You can change image type by this option.`from` is the original image type`to` is the compressed image type                                                                                                                                                                                                                                                   |
| convertPublic （version>=1.3）      | Boolean                | false                         | You can set this value with `true` to apply convert action in public director. But this action will change the final output of your project images.Please deal with this option carefully.                                                                                                                                                                    |
| cache                               | Boolean                | true                          | This option will speed up compression process by saving imges in the disk. Set `false` to disable this function.                                                                                                                                                                                                                                              |
| exclude                             | `string` or `string[]` | []                            | By setting this option, you can exclude files that you don't want to compress。Set exclude as string array,like `exclude:['pic1.jpg','pic2.jpg']` to exclude specific files. If set exlude as string,like `exclude:'.jpg'`, it will be regarded as a RegExp to exlude all `.jpg` files. If `exclude` and `include` both have value, `include` will be invalid |
| include                             | `string` or `string[]` | []                            | By setting this option, you can include files that you want to compress。Set exclude as string array,like `include:['pic1.jpg','pic2.jpg']` to include specific files. If set exlude as string,like `include:'.jpg'`, it will be regarded as a RegExp to include all `.jpg` files. If `exclude` and `include` both have value, `include` will be invalid      |
| limitInputPixels （version>=1.3.1） | boolean                | true                          | Only works for `gif` images. Sharp will throw error if current gif images is larger than limitation. By default, minipic will skip compression process. If you set this value as `false`, minipic will compress this images by force. It may cause `OOM` problem.                                                                                             |

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
	{ from: 'jpeg', to: 'webp' },
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
- [x] include compress file function
- [x] Public folder images support(version>1.1)
- [ ] Support more image types(svg……)
- [ ] Exlcude and include function in directory level.

## License

MIT

## Inspiration

[vite-plugin-imagemin](https://github.com/vbenjs/vite-plugin-imagemin)  
[unplugin-imagemin](https://github.com/ErKeLost/unplugin-imagemin)
