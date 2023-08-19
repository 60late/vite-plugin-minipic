// TODO: 目前先支持jpeg,jpg,png,webp。其他类型待补充

export const defaultSharpOptions = {
	// avif: {
	// 	quality: 50,
	// 	lossless: false,
	// 	effort: 4,
	// 	chromaSubsampling: '4:4:4'
	// 	// options.quality number  quality, integer 1-100 (optional, default 50)
	// 	// options.lossless boolean  use lossless compression (optional, default false)
	// 	// options.effort number  CPU effort, between 0 (fastest) and 9 (slowest) (optional, default 4)
	// 	// options.chromaSubsampling string  set to '4:2:0' to use chroma subsampling (optional, default '4:4:4')
	// },
	jpeg: {
		//     quality (Number) 图片质量，整数1-100(可选，默认80)
		// progressive (Boolean) 使用渐进式(交错)扫描(可选，默认为false)
		// chromaSubsampling (String) 设置为“4:4:4”，以防止质量<= 90时色度子采样(可选，默认为“4:2:0”)
		// trellisQuantisation (Boolean) 应用网格量化，需要mozjpeg(可选，默认为false)
		// overshootDeringing (Boolean) 应用超调脱靶，需要mozjpeg(可选，默认为false)
		// optimiseScans (Boolean) 优化渐进式扫描，强制渐进式扫描，要求mozjpeg(可选，默认为false)
		// optimizeScans (Boolean) optimisescan的替代拼写(可选，默认为false)
		// optimiseCoding (Boolean) 优化Huffman编码表(可选，默认为true)
		// optimizeCoding (Boolean) optimiseCoding的替代拼写(可选，默认为true)
		// quantisationTable (Number) 要使用量子化表，整数0-8，需要mozjpeg(可选，默认为0)
		// quantizationTable(Number) quantisationTable的替代边写，整数0-8，需要mozjpeg(可选，默认为0)
		// force (Boolean) 强制JPEG输出，否则尝试使用输入格式(可选，默认为true)
		quality: 75,
		progressive: false,
		chromaSubsampling: '4:4:4',
		trellisQuantisation: false,
		overshootDeringing: false,
		optimiseScans: false,
		optimizeScans: false,
		optimiseCoding: true,
		optimizeCoding: true,
		quantisationTable: 0,
		quantizationTable: 0,
		force: true
	},
	jpg: {
		//     quality (Number) 图片质量，整数1-100(可选，默认80)
		// progressive (Boolean) 使用渐进式(交错)扫描(可选，默认为false)
		// chromaSubsampling (String) 设置为“4:4:4”，以防止质量<= 90时色度子采样(可选，默认为“4:2:0”)
		// trellisQuantisation (Boolean) 应用网格量化，需要mozjpeg(可选，默认为false)
		// overshootDeringing (Boolean) 应用超调脱靶，需要mozjpeg(可选，默认为false)
		// optimiseScans (Boolean) 优化渐进式扫描，强制渐进式扫描，要求mozjpeg(可选，默认为false)
		// optimizeScans (Boolean) optimisescan的替代拼写(可选，默认为false)
		// optimiseCoding (Boolean) 优化Huffman编码表(可选，默认为true)
		// optimizeCoding (Boolean) optimiseCoding的替代拼写(可选，默认为true)
		// quantisationTable (Number) 要使用量子化表，整数0-8，需要mozjpeg(可选，默认为0)
		// quantizationTable(Number) quantisationTable的替代边写，整数0-8，需要mozjpeg(可选，默认为0)
		// force (Boolean) 强制JPEG输出，否则尝试使用输入格式(可选，默认为true)
		quality: 75,
		progressive: false,
		chromaSubsampling: '4:4:4',
		trellisQuantisation: false,
		overshootDeringing: false,
		optimiseScans: false,
		optimizeScans: false,
		optimiseCoding: true,
		optimizeCoding: true,
		quantisationTable: 0,
		quantizationTable: 0,
		force: true
	},
	// progressive (Boolean) 使用渐进式(交错)扫描(可选，默认为false)
	// compressionLevel (Number) zlib压缩级别，0-9(可选，默认9)
	// adaptiveFiltering (Boolean) 使用自适应行筛选(可选，默认为false)
	// force (Boolean) 强制PNG输出，否则尝试使用输入格式(可选，默认为true)
	png: {
		quality: 75,
		progressive: false,
		compressionLevel: 9,
		adaptiveFiltering: false,
		force: true,
		palette: true,
		effort: 5,
		bitdepth: 8,
		dither: 1
	},
	// options (Object)
	// quality (Number) 质量，整数1-100(可选，默认80)
	// alphaQuality (Number) alpha层的质量，整数0-100(可选，默认100)
	// lossless (Boolean) 使用无损压缩模式(可选，默认为false)
	// nearLossless (Boolean) 使用接近无损压缩模式(可选，默认为false)
	// force (Boolean) 强制WebP输出，否则尝试使用输入格式(可选，默认为true)
	webp: {
		quality: 75,
		alphaQuality: 100,
		lossless: false,
		nearLossless: false,
		smartSubsample: false,
		effort: 4
	}
	// quality (Number) 质量，整数1-100(可选，默认80)
	// force (Boolean) 强制TIFF输出，否则尝试使用输入格式(可选，默认为true)
	// compression (Boolean) 压缩选项:lzw, deflate, jpeg, ccittfax4(可选，默认'jpeg')
	// predictor (String) 压缩预测器选项:无、水平、浮动(可选、默认“水平”)
	// xres (Number) 水平分辨率(像素/mm)(可选，默认1.0)
	// yres (Number) 垂直分辨率(像素/mm)(可选，默认1.0)
	// squash (Boolean) 将8位图像压缩到1位(可选，默认为false)
	// tiff: {
	// 	quality: 80,
	// 	compression: 'jpeg',
	// 	predictor: 'horizontal',
	// 	pyramid: false,
	// 	bitdepth: 8,
	// 	tile: false,
	// 	tileHeight: 256,
	// 	tileWidth: 256,
	// 	xres: 1,
	// 	yres: 1,
	// 	resolutionUnit: 'inch'
	// }
}
