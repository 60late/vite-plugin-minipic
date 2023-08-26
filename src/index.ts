import ora from 'ora'
import sharp from 'sharp'
import chalk from 'chalk'
import { extname } from 'path'
import { partial } from 'filesize'
import { merge as deepMerge } from 'lodash-es'
import { defaultOptions } from './defaultOptions'
import { createFilter } from '@rollup/pluginutils'
import { PluginOption, OutputBundle, OutputAsset } from './types'

let outputPath
let publicDir
let resolvedConfig

const convertMap = new Map([
	['jpeg', 'jpeg'],
	['png', 'png'],
	['jpg', 'jpeg'],
	['avif', 'avif'],
	['webp', 'webp']
])

const recordsMap = new Map<string, { newSize: number; oldSize: number; compressRatio: string; newFileName: string }>()

const handleResolveOptions = (userOptions) => {
	resolvedConfig = deepMerge(defaultOptions, userOptions)
	setImageConvertMap()
}

const setImageConvertMap = () => {
	const { convert } = resolvedConfig
	convert.map((item) => {
		const { from, to } = item
		convertMap.get(from) && convertMap.delete(from)
		// sharp.js only have .jpeg() function
		to === 'jpg' ? convertMap.set(from, 'jpeg') : convertMap.set(from, to)
	})
}

const computeSize = partial({ base: 2, standard: 'jedec' })

const imgFilter = (bundle) => {
	const imgReg = /\.(png|jpeg|jpg|webp|wb2|avif|svg)$/i
	const res = createFilter(imgReg, [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/])(bundle)
	return res
}

const logger = (...args) => {
	console.log(...args)
}

const generateLog = (resolvedConfig, recordsMap) => {
	logger(chalk.green('\n---------------------------------vite-plugin-minipic---------------------------------'))
	let totalOldSize = 0
	let totalNewSize = 0
	recordsMap.forEach((record, fileName) => {
		const { oldSize, newSize, compressRatio, newFileName } = record
		totalOldSize += oldSize
		totalNewSize += newSize
		logger(
			chalk.blue(fileName),
			'→',
			chalk.blue(newFileName),
			chalk.red(computeSize(oldSize)),
			'→',
			chalk.magentaBright(computeSize(newSize)),
			`${chalk.green(`${compressRatio}%↓`)}`
		)
	})

	const totalCompressRatio = (((totalOldSize - totalNewSize) / totalOldSize) * 100).toFixed(2)

	logger(
		chalk.green('---------------------------------vite-plugin-minipic---------------------------------'),
		chalk.green('\n[vite-plugin-minipic]: ✔ Compress done!'),
		chalk.blue('OriginSize:'),
		chalk.red(computeSize(totalOldSize)),
		chalk.blue('→ NowSize:'),
		chalk.magentaBright(computeSize(totalNewSize)),
		chalk.blue('TotalRatio:'),
		`${chalk.green(`${totalCompressRatio}%↓ \n`)}`
	)
}

const handleGenerateImgFiles = async (bundler: OutputBundle, imgFiles, spinner) => {
	const handles = imgFiles.map(async (filePath: string) => {
		const source = (bundler[filePath] as OutputAsset).source
		await compressFile(filePath, source, bundler)
		spinner.text = `${chalk.blueBright('[vite-plugin-minipic]: now compressing')} ${chalk.yellow(filePath)}`
	})
	await Promise.all(handles)
}

const compressFile = async (filePath: string, source: string | Uint8Array, bundler: OutputBundle) => {
	const ext: string = extname(filePath).slice(1)
	const compressOption = resolvedConfig.sharpOptions[ext]
	// eslint-disable-next-line no-unexpected-multiline
	const content: Buffer = await sharp(source)[convertMap.get(ext)](compressOption).toBuffer()
	const oldSize = (source as Uint8Array).byteLength
	const newSize = content.byteLength
	const compressRatio = (((oldSize - newSize) / oldSize) * 100).toFixed(2)

	// Sometimes .png images will be larger after sharp.js processed,so only convert compressed files.
	if (newSize < oldSize) {
		;(bundler[filePath] as OutputAsset).source = content
		const { to: newExt } = resolvedConfig.convert.find((item) => item.from === ext)
		const newFileName = `${bundler[filePath].fileName.split('.')[0]}.${newExt}`
		bundler[filePath].fileName = newFileName
		recordsMap.set(filePath, {
			newSize,
			oldSize,
			compressRatio,
			newFileName
		})
	}
}

const handleFilterImg = (bundler) => {
	const imgFiles: string[] = []
	Object.keys(bundler).forEach((bundle) => {
		imgFilter(bundle) && imgFiles.push(bundle)
	})
	return imgFiles
}

export default function vitePluginMinipic(options): PluginOption {
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
			generateLog(resolvedConfig, recordsMap)
		}
	}
}
