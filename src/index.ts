import ora, { Ora } from 'ora'
import sharp from 'sharp'
import chalk from 'chalk'
import boxen from 'boxen'
import type { Options as BoxenOptions } from 'boxen'
import { DiskCache } from './cache'
import { extname } from 'path'
import { partial } from 'filesize'
import { merge as deepMerge } from 'lodash-es'
import { defaultOptions } from './default-options'
import { createFilter } from '@rollup/pluginutils'
import {
	PluginOption,
	OutputBundle,
	OutputAsset,
	UserOptions,
	RecordsValue,
	SharpConfig,
	GetCacheByFilePath
} from './types'

let outputPath: string
let publicDir: string
let resolvedConfig: UserOptions

const convertMap = new Map([
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
	['jpg', 'jpeg'],
	['avif', 'avif'],
	['webp', 'webp'],
	['gif', 'gif']
])

const recordsMap = new Map<string, RecordsValue>()

// nodehash
const diskCache = new DiskCache()

const handleResolveOptions = (userOptions: UserOptions) => {
	resolvedConfig = deepMerge(defaultOptions, userOptions)
	setImageconvertMap()
}

const setImageconvertMap = () => {
	const { convert } = resolvedConfig
	convert.map((item) => {
		const { from, to } = item
		convertMap.get(from) && convertMap.delete(from)
		// sharp.js only have .jpeg() function
		to === 'jpg' ? convertMap.set(from, 'jpeg') : convertMap.set(from, to)
		// TODO: i have to say, these code looks like shit,i will fix it later
		outputExtMap.get(from) && outputExtMap.delete(from)
		outputExtMap.set(from, to)
	})
}

const computeSize = partial({ base: 2, standard: 'jedec' })

const imgFilter = (bundle: string) => {
	const imgReg = /\.(png|jpeg|jpg|webp|wb2|avif|svg|gif)$/i
	const res = createFilter(imgReg, [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/])(bundle)
	return res
}

const logger = (...args) => {
	console.log(...args)
}

const generateLog = (recordsMap: Map<string, RecordsValue>) => {
	if (recordsMap.size) {
		let totalOldSize = 0
		let totalNewSize = 0
		let logContent = ``

		recordsMap.forEach((record, fileName) => {
			const { oldSize, newSize, compressRatio, newFileName } = record
			totalOldSize += oldSize
			totalNewSize += newSize
			logContent += `${chalk.cyan(fileName)} → ${chalk.cyan(newFileName)}  ${chalk.red(
				computeSize(oldSize)
			)} → ${chalk.magentaBright(computeSize(newSize))} ${chalk.green(`${compressRatio}%↓`)} \n`
		})

		const totalCompressRatio = (((totalOldSize - totalNewSize) / totalOldSize) * 100).toFixed(2)
		logContent += `\n🎉 ${chalk.green('Compress done! \n')}🚀 ${chalk.cyan('OriginSize:')} ${chalk.red(
			computeSize(totalOldSize)
		)} ${chalk.cyan('→ NowSize:')} ${chalk.magentaBright(computeSize(totalNewSize))} ${chalk.cyan(
			'TotalRatio:'
		)} ${chalk.green(`${totalCompressRatio}%↓`)}`

		const boxenConfig: BoxenOptions = {
			padding: 1,
			margin: 1,
			title: `${chalk.green('vite-plugin-minipic')}`,
			titleAlignment: 'center'
		}
		logger(boxen(logContent, boxenConfig))
	} else {
		logger(chalk.yellow('\n[vite-plugin-minipic]:There are no images or images are all read from cache'))
	}
}

/**
 * @description: Check if use cache
 * @param {string} filePath
 * @return {GetCacheByFilePath} [isUseCache,imgBuffer]
 */
const getCacheByFilePath = (filePath: string): GetCacheByFilePath => {
	const [outputName, outputExt] = filePath.split('.')
	const outputFileName = `${outputName}.${outputExtMap.get(outputExt)}`
	const imgBuffer: Buffer = diskCache.get(outputFileName)
	const isCacheExist = diskCache.has(outputFileName)
	const isUseCache: boolean = resolvedConfig.cache && isCacheExist

	return { isUseCache, imgBuffer }
}

const handleGenerateImgFiles = async (bundler: OutputBundle, imgFiles: string[], spinner: Ora) => {
	let compressedFileNum: number = 0
	const totalFileNum: number = imgFiles.length
	const handles = imgFiles.map(async (filePath: string) => {
		const { isUseCache, imgBuffer } = getCacheByFilePath(filePath)
		if (isUseCache) {
			changeOutputBundle(bundler, filePath, imgBuffer)
		} else {
			await compressFile(filePath, bundler)
		}
		compressedFileNum += 1
		spinner.text = `${chalk.cyan(`[vite-plugin-minipic] now compressing`)} ${chalk.yellowBright(
			filePath
		)} (${compressedFileNum}/${totalFileNum})`
	})
	await Promise.all(handles)
}

// special config for sharp. eg: .gif images need set animated=true,otherwise you can only get the first frame
const handleSharpConfig = ({ ext }: SharpConfig) => {
	let config = {}
	if (ext === 'gif') {
		config = { animated: true }
	}
	return config
}

/**
 * @description: Change final output bundle
 * @param {OutputBundle} bundler
 * @param {string} filePath
 * @param {Buffer} imgBuffer
 */
const changeOutputBundle = (bundler: OutputBundle, filePath: string, imgBuffer: Buffer) => {
	const ext = extname(filePath).slice(1)
	;(bundler[filePath] as OutputAsset).source = imgBuffer
	const newExt = outputExtMap.get(ext)
	const newFileName = `${bundler[filePath].fileName.split('.')[0]}.${newExt}`
	bundler[filePath].fileName = newFileName
	return { newFileName }
}

const compressFile = async (filePath: string, bundler: OutputBundle) => {
	const source = (bundler[filePath] as OutputAsset).source
	const ext: string = extname(filePath).slice(1)
	const sharpConfig = handleSharpConfig({ ext })
	const compressOption = resolvedConfig.sharpOptions[ext]
	// eslint-disable-next-line no-unexpected-multiline
	const imgBuffer: Buffer = await sharp(source, sharpConfig)[convertMap.get(ext)](compressOption).toBuffer()
	const oldSize = (source as Uint8Array).byteLength
	const newSize = imgBuffer.byteLength
	const compressRatio = (((oldSize - newSize) / oldSize) * 100).toFixed(2)

	// Sometimes .png images will be larger after sharp.js processed,so only convert compressed files.
	if (newSize < oldSize) {
		const { newFileName } = changeOutputBundle(bundler, filePath, imgBuffer)
		diskCache.set(newFileName, imgBuffer)
		recordsMap.set(filePath, {
			newSize,
			oldSize,
			compressRatio,
			newFileName
		})
	}
}

const handleFilterImg = (bundler: OutputBundle) => {
	const imgFiles: string[] = []
	Object.keys(bundler).forEach((bundle) => {
		imgFilter(bundle) && imgFiles.push(bundle)
	})
	return imgFiles
}

export default function vitePluginMinipic(options: UserOptions): PluginOption {
	return {
		name: 'vite-plugin-minipic',
		enforce: 'pre',
		apply: 'build',
		configResolved() {
			handleResolveOptions(options)
		},
		async generateBundle(_, bundler) {
			const imgFiles: string[] = handleFilterImg(bundler)
			if (!imgFiles.length) return

			const spinner = ora().start()
			await handleGenerateImgFiles(bundler, imgFiles, spinner)
			spinner.stop()
		},
		closeBundle() {
			if (publicDir || outputPath) {
				// TODO: compress images in /public and index.html
			}
			generateLog(recordsMap)
		}
	}
}
