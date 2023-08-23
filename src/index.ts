import type { PluginOption } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import { extname } from 'path'
import sharp from 'sharp'
import { defaultOptions } from './defaultOptions'
import chalk from 'chalk'
import { partial } from 'filesize'
import ora from 'ora'
import { merge } from 'lodash-es'

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

const recordsMap = new Map<string, { newSize: number; oldSize: number; compressRatio: string }>()

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
	logger(chalk.green('\n------------------vite-plugin-minipic------------------'))
	let totalOldSize = 0
	let totalNewSize = 0
	recordsMap.forEach((record, fileName) => {
		const { oldSize, newSize, compressRatio } = record
		totalOldSize += oldSize
		totalNewSize += newSize
		logger(
			chalk.blue(fileName),
			chalk.red(computeSize(oldSize)),
			'→',
			chalk.magentaBright(computeSize(newSize)),
			`${chalk.green(`${compressRatio}%↓`)}`
		)
	})

	const totalCompressRatio = (((totalOldSize - totalNewSize) / totalOldSize) * 100).toFixed(2)

	logger(
		chalk.green('------------------vite-plugin-minipic------------------'),
		chalk.green('\n[vite-plugin-minipic]: ✔ Compress done!'),
		chalk.blue('OriginSize:'),
		chalk.red(computeSize(totalOldSize)),
		chalk.blue('→ NowSize:'),
		chalk.magentaBright(computeSize(totalNewSize)),
		chalk.blue('TotalRatio:'),
		`${chalk.green(`${totalCompressRatio}%↓ \n`)}`
	)
}

const setImageConvertMap = () => {
	const { convert } = resolvedConfig
	convert.map((item) => {
		const { from, to } = item
		if (convertMap.get(from)) {
			convertMap.delete(from)
		}
		convertMap.set(from, to)
	})
	console.log(convertMap)
}

const compressFile = async (filePath: string, source: Buffer) => {
	const ext: string = extname(filePath).slice(1)
	const compressOption = resolvedConfig.sharpOptions[ext]
	// eslint-disable-next-line no-unexpected-multiline
	console.log('ext', ext, 'to', convertMap.get(ext))
	const content: Buffer = await sharp(source)[convertMap.get(ext)](compressOption).toBuffer()
	const oldSize = source.byteLength
	const newSize = content.byteLength

	// Sometimes .png images will be larger after sharp.js processed,so only return compressed files.
	if (newSize < oldSize) {
		const compressRatio = (((oldSize - newSize) / oldSize) * 100).toFixed(2)
		recordsMap.set(filePath, {
			newSize,
			oldSize,
			compressRatio
		})
		return content
	} else {
		return source
	}
}

export default function vitePluginMinipic(options): PluginOption {
	return {
		name: 'vite-plugin-minipic',
		enforce: 'pre',
		apply: 'build',
		configResolved() {
			resolvedConfig = merge(defaultOptions, options)
			setImageConvertMap()
		},
		async generateBundle(_, bundler) {
			const imgFiles: string[] = []
			Object.keys(bundler).forEach((bundle) => {
				imgFilter(bundle) && imgFiles.push(bundle)
			})
			if (!imgFiles.length) return

			const spinner = ora().start()
			const handles = imgFiles.map(async (filePath: string) => {
				const source = (bundler[filePath] as any).source
				const content = await compressFile(filePath, source)
				if (content) (bundler[filePath] as any).source = content
				spinner.text = `${chalk.blueBright('[vite-plugin-minipic]: now compressing')} ${chalk.yellow(filePath)}`
			})
			await Promise.all(handles)
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
