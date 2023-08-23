const defaultSharpOptions = {
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

const defaultConvertOptions = [
	{ from: 'png', to: 'png' },
	{ from: 'jpg', to: 'jpeg' },
	{ from: 'jpeg', to: 'jpeg' },
	{ from: 'webp', to: 'webp' }
]

export const defaultOptions = {
	sharpOptions: defaultSharpOptions,
	convert: defaultConvertOptions, // TODO: change image type
	include: [], // TODO: include process files
	exclude: [] // TODO: exclude process files
}
