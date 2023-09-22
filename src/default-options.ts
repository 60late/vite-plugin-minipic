import { Convert, UserOptions, SharpOption } from './types'

const defaultSharpOptions: SharpOption = {
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
	gif: {}
}

const defaultConvertOptions: Convert[] = [
	{ from: 'png', to: 'png' },
	{ from: 'jpg', to: 'jpg' },
	{ from: 'jpeg', to: 'jpeg' },
	{ from: 'avif', to: 'avif' }
]

export const defaultOptions: UserOptions = {
	sharpOptions: defaultSharpOptions,
	convert: defaultConvertOptions,
	cache: true,
	include: [], // TODO:
	exclude: [] // TODO:
}
