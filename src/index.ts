import fs from 'fs'
import ora from 'ora'
import path from 'path'
import sharp from 'sharp'
import chalk from 'chalk'
import boxen from 'boxen'
import { glob } from 'glob'
import { partial } from 'filesize'
import { DiskCache } from './cache'
import { merge as deepMerge } from 'lodash-es'
import { createFilter } from '@rollup/pluginutils'
import { defaultOptions } from './default-options'
import type { Options as BoxenOptions } from 'boxen'
import { createHash } from 'crypto'
import {
	PluginOption,
	OutputBundle,
	OutputAsset,
	UserOptions,
	RecordsValue,
	SharpConfig,
	ImgInfo,
	ResolvedConfig,
	FilePathInfo,
	SharpOption
} from './types'

/** Common spinner */
const spinner = ora()

/** Resolved config */
let resolvedConfig: UserOptions

/** Public folder directory. */
let publicDir: string = ''

/** Output directory.Like `dist` */
let outputDir: string = ''

/** Current process step */
let curStep: 'public' | 'bundle' = 'public'

/** If use cache mode,compressed files will be stored in the disk */
const diskCache = new DiskCache()

/** Compressed file records */
const recordsMap = new Map<string, RecordsValue>()

/** Sharp.js compress method type during compressing .Map[oldExt,newExt] */
const compressMethodMap = new Map([
	['jpeg', 'jpeg'],
	['png', 'png'],
	['jpg', 'jpeg'],
	['avif', 'avif'],
	['webp', 'webp'],
	['gif', 'gif']
])

/** Extension type before and after convertion .Map[oldExt,newExt] */
const outputExtMap = new Map([
	['jpeg', 'jpeg'],
	['png', 'png'],
	['jpg', 'jpg'],
	['avif', 'avif'],
	['webp', 'webp'],
	['gif', 'gif']
])

/** Filenames before and after convertion .Map[oldFileName,newFileName] */
const imageNameMap = new Map<string, string>([])

/**
 * Get multiple file path info
 * 1. File path without extension like "/a/b/image"
 * 2. File extension without dot like "jpg"
 * @param {string} filePath
 * @return {FilePathInfo}
 */
const getPathInfo = (filePath: string): FilePathInfo => {
	const pureExt = path.extname(filePath).slice(1)
	const purePath = filePath.replace(new RegExp(`.${pureExt}$`), '')

	return {
		pureExt,
		purePath
	}
}

/**
 * merge user option and default option
 * @param {UserOptions} userOptions
 */
const handleResolveOptions = (userOptions: UserOptions, config: ResolvedConfig) => {
	outputDir = config.build.outDir
	publicDir = config.publicDir
	resolvedConfig = deepMerge(defaultOptions, userOptions)
	setCompressMethodMap()
}

/**
 * Set compress method map, convert from old ext to new ext, 
 * not change compressMethodMap because the compress method is decided by newExt.
 */
const setCompressMethodMap = () => {
	const { convert } = resolvedConfig
	convert.forEach((item) => {
		const { from, to } = item
		outputExtMap.set(from, to)
	})
}

/**
 * Compute fileSize
 */
const computeSize = partial({ base: 2, standard: 'jedec' })

/**
 * A beffer display for console.log
 * @param {array} args
 */
const logger = (...args) => {
	console.log(...args)
}

/**
 * Generate output log
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
			} else if (newSize > oldSize) {
				logContent += `${chalk.cyan(fileName)} → ${chalk.cyan(newFileName)}  ${chalk.red(
					computeSize(oldSize)
				)} → ${chalk.magentaBright(computeSize(newSize))} ${chalk.yellow(`skipped`)} \n`
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
 * Write file to disk, ensure directory exist
 * @param {string} filePath
 * @param {Buffer} imgBuffer
 */
const safetyWriteFile = (filePath: string, imgBuffer: Buffer) => {
	const dirPath = path.dirname(filePath)
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true })
	}
	fs.writeFileSync(filePath, new Uint8Array(imgBuffer))
}

/**
 * Generate file from cache
 * @param {OutputBundle} bundler
 * @param {string} filePath
 * @param {Buffer} imgBuffer
 */
const generateFileByCache = (imgInfo: ImgInfo) => {
	const cacheFileName = generateCacheFileName(imgInfo, resolvedConfig.sharpOptions[imgInfo.newExt])
	const imgBuffer = diskCache.get(cacheFileName)
	recordsMap.set(imgInfo.oldFileName, {
		isCache: true,
		newFileName: imgInfo.newFileName
	})

	return imgBuffer
}

/**
 * Generate cache file name by image info and compress option,
 * avoid abuse cache file with old compressOption
 * @param {ImgInfo} imgInfo
 * @param {SharpOption} compressOption
 * @return {string}
 */
const generateCacheFileName = (imgInfo: ImgInfo, compressOption: SharpOption) => {
	const { newFileName, newExt } = imgInfo

	const cacheName =
		createHash('sha256')
			.update(`${newFileName}${JSON.stringify(compressOption)}`)
			.digest('hex') +
		'.' +
		newExt
	return cacheName
}

/**
 * Get image info
 * @return {imgInfo}
 */
const getImgInfo = (filePath: string, allowChangeExt = true) => {
	const { purePath: oldName, pureExt: oldExt } = getPathInfo(filePath)
	const newExt = allowChangeExt ? outputExtMap.get(oldExt) : oldExt
	const oldFileName = `${oldName.replace(publicDir + path.sep, '')}.${oldExt}`
	const newFileName = `${oldName.replace(publicDir + path.sep, '')}.${newExt}`
	return {
		filePath,
		oldFileName,
		newFileName,
		oldExt,
		newExt
	}
}

/**
 * Generate image files.
 * Process images from bundle and public directory.
 * If use cache,read from ./node_modules/.cache. If not use cache, compress image files.
 * @param {OutputAsset} bundler
 * @param {string} imgFiles
 */
const handleGenerateImgFiles = async (imgFiles: string[], bundler?: OutputBundle) => {
	let compressedFileNum: number = 0
	const totalFileNum: number = imgFiles.length
	const handles = imgFiles.map(async (filePath: string) => {
		let imgBuffer: Buffer = Buffer.from('')
		let source: Uint8Array | string = new Uint8Array(Buffer.from(''))
		const imgInfo = getImgInfo(filePath, !!bundler)

		const cacheFileName = generateCacheFileName(imgInfo, resolvedConfig.sharpOptions[imgInfo.newExt])
		const isUseCache: boolean = resolvedConfig.cache && diskCache.has(cacheFileName)

		if (bundler) {
			source = (bundler[filePath] as OutputAsset).source
		} else {
			source = new Uint8Array(await fs.readFileSync(filePath))
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
			changeBundleOutput(imgInfo, imgBuffer, bundler)
		} else {
			changePublicOutput(imgInfo, imgBuffer)
		}
	})
	await Promise.all(handles)
	bundler && replaceImgName(bundler)
}

/**
 * Special config for sharp. eg: .gif images need set animated=true,otherwise you can only get the first frame
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
 * Change final output bundle. Mainly change `source` and `fileName`
 * @param {OutputAsset} bundler
 * @param {string} filePath
 * @param {Buffer} imgBuffer
 */
const changeBundleOutput = (imgInfo: ImgInfo, imgBuffer: Buffer, bundler: OutputBundle) => {
	const { oldFileName, newFileName, filePath } = imgInfo
	imageNameMap.set(oldFileName, newFileName)
	bundler[filePath].fileName = newFileName
	;(bundler[filePath] as OutputAsset).source = new Uint8Array(imgBuffer)
}

/**
 * Change output from public directory. Mainly change `source` and `fileName`
 * @param {OutputAsset} bundler
 * @param {string} filePath
 * @param {Buffer} imgBuffer
 */
const changePublicOutput = (imgInfo: ImgInfo, imgBuffer: Buffer) => {
	const publicDirFull = path.resolve(publicDir)
	const oldFilePath = path.join(outputDir, path.relative(publicDirFull, imgInfo.oldFileName))
	const newFilePath = path.join(outputDir, path.relative(publicDirFull, imgInfo.newFileName))
	if (recordsMap.has(imgInfo.oldFileName) && (
		recordsMap.get(imgInfo.oldFileName).isCache ||
		recordsMap.get(imgInfo.oldFileName).newSize < recordsMap.get(imgInfo.oldFileName).oldSize
	)) {
		fs.unlinkSync(oldFilePath)
		safetyWriteFile(newFilePath, imgBuffer)
	}
	imageNameMap.set(imgInfo.oldFileName, imgInfo.newFileName)
}

/**
 * Generate image files by compress
 * @param {string} filePath
 * @param {OutputBundle} bundler
 * @return {*}
 */
const generateFileByCompress = async (imgInfo: ImgInfo, source: Uint8Array | string) => {
	const { oldFileName, newFileName, newExt } = imgInfo
	const sharpConfig = handleSharpConfig({ ext: newExt })
	const compressOption = resolvedConfig.sharpOptions[newExt]
	const imgBuffer: Buffer = await sharp(source, sharpConfig)[compressMethodMap.get(newExt)](compressOption).toBuffer()
	const oldSize = (source as Uint8Array).byteLength
	const newSize = imgBuffer.byteLength
	const compressRatio = (((oldSize - newSize) / oldSize) * 100).toFixed(2)
	// Sometimes .png images will be larger after sharp.js processed,so only convert compressed files.
	diskCache.set(generateCacheFileName(imgInfo, resolvedConfig.sharpOptions[imgInfo.newExt]), imgBuffer)
	recordsMap.set(oldFileName, {
		newSize,
		oldSize,
		compressRatio,
		newFileName
	})

	return imgBuffer
}

/**
 * Filter image file
 * @param {string} fileName
 */
const imgFilter = (fileName: string) => {
	const imgReg = /\.(png|jpeg|jpg|webp|wb2|avif|gif)$/i
	const res = createFilter(imgReg, [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/])(fileName)
	return res
}

/**
 * Exclude or include files to compress
 * @param {string} fileName
 * @return {boolean}
 */
const excludeAndIncludeFilter = (fileName: string) => {
	const { exclude, include } = resolvedConfig
	const isExclude = exclude.length
	const isInclude = include.length
	// If exclude and inlcude are all empty
	if (!isExclude && !isInclude) return true

	const originImgName = getOriginImageName(fileName)
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
 * Get img origin name before bundle
 * @param {string} fileName
 * @return {string}
 */
const getOriginImageName = (fileName: string): string => {
	// 'assets/pic1-special-6a812720.jpg' or 'pich-special.png'
	const { purePath: name, pureExt: ext } = getPathInfo(fileName)
	const nameArr = name.split(path.sep)
	const fileNameArr: string[] = nameArr[nameArr.length - 1].split('-')
	// if is during bundle process,vite will add hash in file names,it's not what we want
	curStep === 'bundle' && fileNameArr.pop()
	const purFileName = `${fileNameArr.join('-')}.${ext}`
	return purFileName
}

/**
 * Filter image files
 * @param {OutputBundle | string[]} source
 */
const handleFilterImg = (source: OutputBundle | string[]) => {
	const imgFiles: string[] = []

	if (!Array.isArray(source)) {
		source = Object.keys(source)
	}

	source.forEach((fileName: string) => {
		imgFilter(fileName) && excludeAndIncludeFilter(fileName) && imgFiles.push(fileName)
	})
	return imgFiles
}

/**
 * Replace image name in .css and .js files
 * @param {OutputBundle} bundler
 */
const replaceImgName = (bundler: OutputBundle) => {
	// only need replace image names in .css and .js files
	const bundleFiles: string[] = Object.keys(bundler).filter((bundleFileName) => {
		const { pureExt: ext } = getPathInfo(bundleFileName)
		return ext === 'css' || ext === 'js'
	})
	const replaceMap = new Map()
	imageNameMap.forEach((value, key) => {
		const keyArr = key.split(path.sep),
			valueArr = value.split(path.sep)
		const newKey = keyArr[keyArr.length - 1],
			newVal = valueArr[valueArr.length - 1]
		replaceMap.set(newKey, newVal)
	})

	bundleFiles.forEach((file) => {
		const { pureExt: fileExt } = getPathInfo(file)
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
 * Replace multiple values in string
 * @param inputString string need to be replaced
 * @param replacements replace Map
 * @returns replaced string
 */
const replaceMultipleValues = (inputString: string, replacements: Map<string, string>) => {
	if (!inputString) return
	const regex = new RegExp(Array.from(replacements.keys()).join('|'), 'g')
	const result = inputString.replace(regex, (match) => replacements.get(match))
	return result
}

/**
 * Handle generate bundle files
 */
const handleGenerateBundle = async (bundler) => {
	curStep = 'bundle'
	const imgFiles: string[] = handleFilterImg(bundler)
	if (!imgFiles.length) return
	await handleGenerateImgFiles(imgFiles, bundler)
}

/**
 * Handle generate public image files
 */
const handleGeneratePublic = async () => {
	curStep = 'public'
	const publicFiles = await glob(`${publicDir}/**/*.{png,jpg,jpeg,gif,webp,avif}`)
	const imgFiles = handleFilterImg(publicFiles)
	if (!imgFiles.length) return
	await handleGenerateImgFiles(imgFiles)
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
			spinner.text = `${chalk.cyan(`[vite-plugin-minipic] start compressing……`)}`
			await handleGeneratePublic()
			await handleGenerateBundle(bundler)
			spinner.stop()
		},
		async closeBundle() {
			generateLog(recordsMap)
		}
	}
}
