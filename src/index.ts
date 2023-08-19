import type { PluginOption } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import { extname } from 'path'
import sharp from 'sharp'
import { defaultSharpOptions } from './core/sharpOptions'
import chalk from 'chalk'
import { partial } from 'filesize'

const imgMap = new Map([
	['jpeg', 'jpeg'],
	['png', 'png'],
	['jpg', 'jpeg'],
	['avif', 'avif'],
	['webp', 'webp']
])
const computeSize = partial({ base: 2, standard: 'jedec' })

// 根据后缀名筛选出图片
const imgFilter = (bundle) => {
	const imgReg = /\.(png|jpeg|jpg|webp|wb2|avif|svg)$/i
	const res = createFilter(imgReg, [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/])(bundle)
	return res
}

// 生成日志
const generateLog = (resolvedConfig, recordsMap) => {
	let totalOldSize = 0
	let totalNewSize = 0
	recordsMap.forEach((record, fileName) => {
		const { oldSize, newSize, compressRatio } = record
		// logData.push({
		// 	fileName: fileName,
		// 	oldSize: computeSize(oldSize),
		// 	newSize: computeSize(newSize),
		// 	compressRatio: `${compressRatio}%↓`
		// })
		totalOldSize += oldSize
		totalNewSize += newSize
		logger(
			chalk.white(fileName),
			chalk.red(computeSize(oldSize)),
			'→',
			chalk.green(computeSize(newSize)),
			`${chalk.yellow(`${compressRatio}%`)}↓`
		)
	})
	const totalCompressRatio = (((totalOldSize - totalNewSize) / totalOldSize) * 100).toFixed(2)

	logger(
		chalk.green('✨ Compress done! \n'),
		'OriginSize:',
		chalk.red(computeSize(totalOldSize)),
		'→ NowSize:',
		chalk.green(computeSize(totalNewSize)),
		'Total compress radio:',
		`${chalk.yellow(`${totalCompressRatio}%`)}↓`
	)
}

const logger = (...args) => {
	console.log(...args)
}

const recordsMap = new Map<string, { newSize: number; oldSize: number; compressRatio: string }>()

// 获取压缩后的文件
const compressFile = async (filePath: string, source: Buffer) => {
	const ext: string = extname(filePath).slice(1)
	const compressOption = defaultSharpOptions[ext]
	// eslint-disable-next-line no-unexpected-multiline
	const content: Buffer = await sharp(source)[imgMap.get(ext)](compressOption).toBuffer()
	const oldSize = source.byteLength
	const newSize = content.byteLength

	// 有时候PNG压缩时打包出来的体积会更大，如果体积变大了则返回原来的图片
	if (newSize < oldSize) {
		const compressRatio = ((oldSize - newSize) / oldSize) * 100
		recordsMap.set(filePath, {
			newSize,
			oldSize,
			compressRatio: compressRatio.toFixed(2)
		})
		return content
	} else {
		return source
	}
}

const defaultConfig = {}

export default function vitePluginMinipic(options): PluginOption {
	let resolvedConfig
	let outputPath
	let publicDir

	return {
		// 插件名称
		name: 'vite-plugin-minipic',
		// pre 会较于 post 先执行
		enforce: 'pre', // post
		// 指明它们仅在 'build' 或 'serve' 模式时调用
		apply: 'build', // apply 亦可以是一个函数
		configResolved(config) {
			// TODO: 配置融合
			resolvedConfig = Object.assign({}, config, defaultConfig)
			outputPath = resolvedConfig.build.outDir

			if (typeof resolvedConfig.publicDir === 'string') {
				publicDir = resolvedConfig.publicDir
			}
		},
		async generateBundle(_, bundler) {
			const imgFiles: string[] = []

			Object.keys(bundler).forEach((bundle) => {
				imgFilter(bundle) && imgFiles.push(bundle)
			})

			if (!imgFiles.length) return

			const handles = imgFiles.map(async (filePath: string) => {
				const source = (bundler[filePath] as any).source
				const content = await compressFile(filePath, source)
				logger(`now compressing ${filePath}..`)
				if (content) (bundler[filePath] as any).source = content
			})

			await Promise.all(handles)
		},
		closeBundle() {
			if (publicDir || outputPath) {
				// TODO: closeBundle时转换Public目录下的内容
			}

			generateLog(resolvedConfig, recordsMap)
		}
	}
}
