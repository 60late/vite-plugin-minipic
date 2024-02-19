import sharp from 'sharp'
import chalk from 'chalk'
import boxen from 'boxen'
import ora from 'ora'
import path from 'path'
import { partial } from 'filesize'
import { DiskCache } from './cache'
import { merge as deepMerge } from 'lodash-es'
import { createFilter } from '@rollup/pluginutils'
import { defaultOptions } from './default-options'
import type { Options as BoxenOptions } from 'boxen'
import {
	PluginOption,
	OutputBundle,
	OutputAsset,
	UserOptions,
	RecordsValue,
	SharpConfig,
	ImgInfo,
	ResolvedConfig
} from './types'
import { glob } from 'glob'
import fs from 'fs'

const spinner = ora()
/** resolved config */
let resolvedConfig: UserOptions
/** if use cache mode,compressed files will be stored in the disk */
const diskCache = new DiskCache()
/** compressed file records */
const recordsMap = new Map<string, RecordsValue>()

let outputDir: string = ''
let publicDir: string = ''

const compressMethodMap = new Map([
	['jpeg', 'jpeg'],
	['png', 'png'],
	['jpg', 'jpeg'],
	['avif', 'avif'],
	['webp', 'webp'],
	['gif', 'gif']
])

const outputExtMap = new Map([
	['jpeg', 'jpeg'],
	['png', 'png'],
	['jpg', 'jpg'],
	['avif', 'avif'],
	['webp', 'webp'],
	['gif', 'gif']
])

/**
 * @description: Map[oldFileName,newFileName]
 */
const imageNameMap = new Map<string, string>([])

/**
 * @description: merge user option and default option
 * @param {UserOptions} userOptions
 */
const handleResolveOptions = (userOptions: UserOptions, config: ResolvedConfig) => {
	outputDir = config.build.outDir
	publicDir = config.publicDir
	resolvedConfig = deepMerge(defaultOptions, userOptions)
	setCompressMethodMap()
}

/**
 * @description: sharp.js only have jpeg() function,dont have jpg() function. So need to special process
 */
const setCompressMethodMap = () => {
	const { convert } = resolvedConfig
	convert.map((item) => {
		const { from, to } = item
		compressMethodMap.get(from) && compressMethodMap.delete(from)
		// sharp.js only have .jpeg() function
		to === 'jpg' ? compressMethodMap.set(from, 'jpeg') : compressMethodMap.set(from, to)
		// TODO: i have to say, these code looks like shit,i will fix it later
		outputExtMap.get(from) && outputExtMap.delete(from)
		outputExtMap.set(from, to)
	})
}

/**
 * @description: compute fileSize
 */
const computeSize = partial({ base: 2, standard: 'jedec' })

/**
 * @description: console.log
 * @param {array} args
 */
const logger = (...args) => {
	console.log(...args)
}

/**
 * @description: generate output log
 * @param {Map<string, RecordsValue>} recordsMap
 */

const generateLog = (recordsMap: Map<string, RecordsValue>) => {
	if (recordsMap.size) {
		let totalOldSize = 0
		let totalNewSize = 0
		let logContent = ``

		recordsMap.forEach((record, fileName) => {
			const { isCache, oldSize, newSize, compressRatio, newFileName } = record
			if (isCache) {
				logContent += `${chalk.cyan(fileName)} → ${chalk.cyan(newFileName)}  ${chalk.green('(Read from cache)')} \n`
			} else {
				totalOldSize += oldSize
				totalNewSize += newSize
				logContent += `${chalk.cyan(fileName)} → ${chalk.cyan(newFileName)}  ${chalk.red(
					computeSize(oldSize)
				)} → ${chalk.magentaBright(computeSize(newSize))} ${chalk.green(`${compressRatio}%↓`)} \n`
			}
		})
		logContent += `\n🎉 ${chalk.green('Compress done! \n')}`
		const { cache } = resolvedConfig
		if (cache && totalNewSize === 0) {
			logContent += `🚀 ${chalk.green('All files are read from cache')}`
		} else {
			const totalCompressRatio = (((totalOldSize - totalNewSize) / totalOldSize) * 100).toFixed(2)
			logContent += `🚀 ${chalk.cyan('OriginSize:')} ${chalk.red(computeSize(totalOldSize))} ${chalk.cyan(
				'→ NowSize:'
			)} ${chalk.magentaBright(computeSize(totalNewSize))} ${chalk.cyan('TotalRatio:')} ${chalk.green(
				`${totalCompressRatio}%↓`
			)}`
		}

		const boxenConfig: BoxenOptions = {
			padding: 1,
			margin: 1,
			title: `${chalk.green('vite-plugin-minipic')}`,
			titleAlignment: 'center'
		}
		logger(boxen(logContent, boxenConfig))
	} else {
		logger(chalk.yellow('\n[vite-plugin-minipic]: No images are detected in this project.'))
	}
}

/**
 * @description:
 * @param {OutputBundle} bundler
 * @param {string} filePath
 * @param {Buffer} imgBuffer
 */
const generateFileByCache = (imgInfo: ImgInfo) => {
	const imgBuffer = diskCache.get(imgInfo.name)
	recordsMap.set(imgInfo.filePath, {
		isCache: true,
		newFileName: imgInfo.name
	})

	return imgBuffer
}

/**
 * get img info
 * @return {imgInfo}
 */
const getImgInfo = (filePath: string) => {
	const [name, extOrigin] = filePath.split('.')
	const ext = outputExtMap.get(extOrigin)

	return {
		filePath,
		name: `${name}.${ext}`,
		ext,
		extOrigin
	}
}

/**
 * @description: generate imgage files.If use cache,read from ./node_modules/.cache. If not use cache, compress image files.
 * @param {OutputAsset} bundler
 * @param {string} imgFiles
 */
const handleGenerateImgFiles = async (imgFiles: string[], bundler?: OutputBundle) => {
	let compressedFileNum: number = 0
	const totalFileNum: number = imgFiles.length
	spinner.text = `${chalk.cyan(`[vite-plugin-minipic] start compressing……`)}`
	const handles = imgFiles.map(async (filePath: string) => {
		let imgBuffer = Buffer.from('')
		let source: Uint8Array | string = Buffer.from('')
		const imgInfo = getImgInfo(filePath)
		const isUseCache: boolean = resolvedConfig.cache && diskCache.has(imgInfo.name)

		if (bundler) {
			source = (bundler[filePath] as OutputAsset).source
		} else {
			source = await fs.readFileSync(filePath)
		}

		if (isUseCache) {
			imgBuffer = await generateFileByCache(imgInfo)
		} else {
			imgBuffer = await generateFileByCompress(imgInfo, source)
		}

		compressedFileNum += 1
		spinner.text = `${chalk.cyan(`[vite-plugin-minipic] now compressing`)} ${chalk.yellowBright(
			filePath
		)} (${compressedFileNum}/${totalFileNum})`

		if (bundler) {
			changeOutputBundle(bundler, imgInfo, imgBuffer)
		} else {
			imgInfo.name = imgInfo.name.replace(publicDir + path.sep, '')
			const outputFilePath = path.join(outputDir, imgInfo.name)
			await fs.writeFileSync(outputFilePath, imgBuffer)
			imageNameMap.set(filePath, imgInfo.name)
		}
	})
	await Promise.all(handles)
	bundler && replaceImgName(bundler)
}

/**
 * @description:  special config for sharp. eg: .gif images need set animated=true,otherwise you can only get the first frame
 * @return {*} config
 */
const handleSharpConfig = ({ ext }: SharpConfig) => {
	let config = {}
	if (ext === 'gif') {
		config = { animated: true }
	}
	return config
}

/**
 * @description: Change final output bundle. Mainly change `source` and `fileName`
 * @param {OutputAsset} bundler
 * @param {string} filePath
 * @param {Buffer} imgBuffer
 */
const changeOutputBundle = (bundler: OutputBundle, imgInfo: ImgInfo, imgBuffer: Buffer) => {
	const { filePath, name } = imgInfo
	imageNameMap.set(filePath, name)
	bundler[filePath].fileName = name
	;(bundler[filePath] as OutputAsset).source = imgBuffer
}

/**
 * @description: generate image files by compress
 * @param {string} filePath
 * @param {OutputBundle} bundler
 * @return {*}
 */
const generateFileByCompress = async (imgInfo: ImgInfo, source: Uint8Array | string) => {
	const { filePath, name, ext } = imgInfo
	const sharpConfig = handleSharpConfig({ ext })
	const compressOption = resolvedConfig.sharpOptions[ext]
	const imgBuffer: Buffer = await sharp(source, sharpConfig)[compressMethodMap.get(ext)](compressOption).toBuffer()
	const oldSize = (source as Uint8Array).byteLength
	const newSize = imgBuffer.byteLength
	const compressRatio = (((oldSize - newSize) / oldSize) * 100).toFixed(2)

	// Sometimes .png images will be larger after sharp.js processed,so only convert compressed files.
	if (newSize < oldSize) {
		diskCache.set(name, imgBuffer)
		recordsMap.set(filePath, {
			newSize,
			oldSize,
			compressRatio,
			newFileName: name
		})
	}

	return imgBuffer
}

/**
 * @description: filter image file
 * @param {string} bundleName
 */
const imgFilter = (bundleName: string) => {
	const imgReg = /\.(png|jpeg|jpg|webp|wb2|avif|gif)$/i
	const res = createFilter(imgReg, [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/])(bundleName)
	return res
}

/**
 * @description: exclude or include files to compress
 * @param {string} bundle
 * @return {boolean}
 */
const excludeAndIncludeFilter = (bundle: string) => {
	const { exclude, include } = resolvedConfig
	const isExclude = exclude.length
	const isInclude = include.length
	// If exclude and inlcude are all empty
	if (!isExclude && !isInclude) return true

	const originImgName = getOriginImageName(bundle)
	const target = isExclude ? exclude : include
	let result = true
	// If tartget is array
	if (Array.isArray(target) && target.length) {
		result = target.includes(originImgName)
	}
	// If target is regExp.
	if (typeof target === 'string') {
		const reg = new RegExp(target)
		result = reg.test(originImgName)
	}

	return isExclude ? !result : result
}

/**
 * @description: get img origin name before bundle
 * @param {string} bundle
 * @return {string}
 */
const getOriginImageName = (bundle: string): string => {
	// 'assets/pic1-special-6a812720.jpg'
	const [file, ext] = bundle.split('.')
	const fileNameArr: string[] = file.split('/')[1].split('-')
	fileNameArr.pop()
	const fileName = `${fileNameArr.join('-')}.${ext}`
	return fileName
}

/**
 * @description: Filter image files
 * @param {OutputBundle} bundler
 */
const handleFilterImg = (bundler: OutputBundle) => {
	const imgFiles: string[] = []
	Object.keys(bundler).forEach((bundle) => {
		imgFilter(bundle) && excludeAndIncludeFilter(bundle) && imgFiles.push(bundle)
	})
	return imgFiles
}

/**
 * @description: replace image name in .css and .js files
 * @param {OutputBundle} bundler
 */
const replaceImgName = (bundler: OutputBundle) => {
	// only need replace image names in .css and .js files
	const bundleFiles: string[] = Object.keys(bundler).filter((bundleFileName) => {
		const ext = bundleFileName.split('.')[1]
		return ext === 'css' || ext === 'js'
	})
	const replaceMap = new Map()
	imageNameMap.forEach((value, key) => {
		const keyArr = key.split('/'),
			valueArr = value.split('/')
		const newKey = keyArr[keyArr.length - 1],
			newVal = valueArr[valueArr.length - 1]
		replaceMap.set(newKey, newVal)
	})

	bundleFiles.map((file) => {
		const fileExt = file.split('.')[1]
		if (fileExt === 'css') {
			const fileSource: string = bundler[file]['source']
			bundler[file]['source'] = replaceMultipleValues(fileSource, replaceMap)
		}
		if (fileExt === 'js') {
			const fileCode: string = bundler[file]['code']
			bundler[file]['code'] = replaceMultipleValues(fileCode, replaceMap)
		}
	})
}

/**
 * replace multiple values in string
 * @param inputString string need to be replaced
 * @param replacements replace Map
 * @returns replaced string
 */
const replaceMultipleValues = (inputString: string, replacements: Map<string, string>) => {
	const regex = new RegExp(Array.from(replacements.keys()).join('|'), 'g')
	const result = inputString.replace(regex, (match) => replacements.get(match))
	return result
}

/**
 * handle generate bundle
 * @return {*}
 */
const handleGenerateBundle = async (bundler) => {
	const imgFiles: string[] = handleFilterImg(bundler)
	if (!imgFiles.length) return
	await handleGenerateImgFiles(imgFiles, bundler)
}

const handleGeneratePublic = async () => {
	const publicFiles = await glob(`${publicDir}/**/*.{png,jpg,jpeg,gif,webp,avif}`)
	if (!publicFiles.length) return
	await handleGenerateImgFiles(publicFiles)
}

export default function vitePluginMinipic(options: UserOptions = {}): PluginOption {
	return {
		name: 'vite-plugin-minipic',
		enforce: 'pre',
		apply: 'build',
		configResolved(config: ResolvedConfig) {
			handleResolveOptions(options, config)
		},
		async generateBundle(_, bundler) {
			spinner.start()
			await handleGeneratePublic()
			await handleGenerateBundle(bundler)
			spinner.stop()
		},
		async closeBundle() {
			generateLog(recordsMap)
		}
	}
}
