# vite-plugin-minipic

**中文** | [English](./README.md)

基于[sharp](https://github.com/lovell/sharp)开发的vite图片压缩插件，使用简单，重要的是它真的很快！！

## 安装

```
npm install vite-plugin-minipic -D
```

或者

```
yarn add vite-plugin-minipic -D
```

## 使用

### 基本使用

in vite.config.js

```javascript
import minipic from 'vite-plugin-minipic'
export default defineConfig({
	plugins: [vue(), minipic()]
})
```

### 自定义配置

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
				quality: 75
			},
			png: {
				quality: 75
			},
			webp: {
				quality: 75
			},
			avif: {
				quality: 75
			}
		})
	]
})
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

## 证书

MIT

## 灵感来源

[vite-plugin-imagemin](https://github.com/vbenjs/vite-plugin-imagemin)  
[unplugin-imagemin](https://github.com/ErKeLost/unplugin-imagemin)
