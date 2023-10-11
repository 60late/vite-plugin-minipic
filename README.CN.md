# vite-plugin-minipic

vite图片压缩插件，使用简单，重要的是它真的很快 🚀🚀🚀🚀！！  
基于[sharp](https://github.com/lovell/sharp)开发  
![example](https://img1.imgtp.com/2023/10/07/WVYs4Ca8.gif)

**中文** | [English](README.md)

## 📦 安装

```
npm install vite-plugin-minipic -D
```

或者

```
yarn add vite-plugin-minipic -D
```

❗❗❗ 安装失败？  
如果你无法安装，请在你全局或者项目目录下的.npmrc文件中加入以下配置

```
registry="https://registry.npm.taobao.org"
sharp_binary_host="https://npm.taobao.org/mirrors/sharp"
sharp_libvips_binary_host="https://npm.taobao.org/mirrors/sharp-libvips"
```

## 💻 使用

### 基本使用

in vite.config.js

```javascript
import minipic from 'vite-plugin-minipic'
export default defineConfig({
	plugins: [minipic()]
})
```

### 自定义配置

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

## 🔨 配置项

| 参数         | 类型    | 默认值                        | 说明                                                                                                                           |
| ------------ | ------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| sharpOptions | Object  | [sharpOptions](#sharpoptions) | 图片压缩选项，和sharp.js的配置保持一致.关于更多sharp.js的配置项，见[sharp.js](https://sharp.pixelplumbing.com/api-output#jpeg) |
| convert      | Object  | [convert](#convert)           | 你可以通过这个选项控制图片经过处理后的类型 `from` 是原始类型 `to` 是处理后的类型                                               |
| cache        | Boolean | true                          | 第一次压缩后会将已压缩文件存入磁盘中进行缓存以提高压缩速度，如果不想占用本地磁盘空间将此值设置为false，则每次都会全量压缩      |

### sharpOptions

图片压缩选项，和sharp.js的配置保持一致。  
关于更多sharp.js的配置项，见[sharp.js](https://sharp.pixelplumbing.com/api-output#jpeg)

默认值：

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

你可以通过这个选项控制图片经过处理后的类型
`from` 是原始类型
`to` 是处理后的类型

例子:

```javascript
convert: [
	{ from: 'png', to: 'png' },
	{ from: 'jpg', to: 'jpeg' },
	{ from: 'jpeg', to: 'jpeg' },
	{ from: 'jpg', to: 'webp' },
	{ from: 'avif', to: 'avif' }
]
```

For more detail config, see [sharp.js](https://sharp.pixelplumbing.com/api-output#jpeg).

## 看看例子

Run examples

```
yarn vue3
```

or

```
npm run vue3
```

## 待办

- [x] 缓存功能

## 证书

MIT

## 灵感来源

[vite-plugin-imagemin](https://github.com/vbenjs/vite-plugin-imagemin)  
[unplugin-imagemin](https://github.com/ErKeLost/unplugin-imagemin)
