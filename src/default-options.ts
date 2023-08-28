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
	}
}

const defaultConvertOptions: Convert[] = [
	{ from: 'png', to: 'png' },
	{ from: 'jpg', to: 'jpeg' },
	{ from: 'jpeg', to: 'jpeg' },
	{ from: 'jpg', to: 'webp' }
]

export const defaultOptions: UserOptions = {
	sharpOptions: defaultSharpOptions,
	convert: defaultConvertOptions,
	include: [],
	exclude: []
}
