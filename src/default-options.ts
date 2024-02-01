import { Convert, UserOptions, SharpOption } from './types'

const defaultSharpOptions: SharpOption = {
	avif: {
		quality: 80
	},
	jpeg: {
		quality: 80
	},
	jpg: {
		quality: 80
	},
	png: {
		quality: 80
	},
	webp: {
		quality: 80
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
	include: [],
	exclude: []
}
