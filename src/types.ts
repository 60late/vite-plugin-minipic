import type { OutputBundle, OutputAsset } from 'rollup'
import type { PluginOption, ResolvedConfig } from 'vite'
import type { AvifOptions, JpegOptions, Jp2Options, PngOptions, WebpOptions, GifOptions } from 'sharp'

export { OutputBundle, OutputAsset, PluginOption, ResolvedConfig }

export interface UserOptions {
	/** Sharp.js Options,for more detail options see https://sharp.pixelplumbing.com */
	sharpOptions?: SharpOption
	/** Change image type */
	convert?: Convert[]
	/** Apply convert in public directory? Default value: false */
	convertPublic?: boolean
	/** Use cache mode to improve compress speed.Default value:false */
	cache?: boolean
	/** Include files should be processed */
	include?: string[] | string
	/** Exclude files should not be processed */
	exclude?: string[] | string
	/** Limit gif total pixels. Default value: true */
	limitInputPixels?: boolean
}

export interface Convert {
	/** Original image type,now support png/jpg/jpeg/webp/avif/gif */
	from: 'png' | 'jpg' | 'jpeg' | 'webp' | 'avif' | 'gif'
	/** Image type after proccessed,now support png/jpg/jpeg/webp/avif/gif */
	to: 'png' | 'jpg' | 'jpeg' | 'webp' | 'avif' | 'gif'
}

export interface SharpOption {
	avif: AvifOptions
	jpeg: JpegOptions
	jpg: Jp2Options
	png: PngOptions
	webp: WebpOptions
	gif: GifOptions
}

/**
 * output log records value
 */
export interface RecordsValue {
	/** Is this record read directly from cache */
	isCache?: boolean
	/** New image file name after proccessed */
	newFileName: string
	/** Image file size after proccessed */
	newSize?: number
	/** Original image file size */
	oldSize?: number
	/** Image file size compressed ratio */
	compressRatio?: string
}

export interface SharpConfig {
	/** image extension type */
	ext: string
}

export interface GetCacheByFilePath {
	/** Is use cache from ./node_modules/.cache */
	isUseCache: boolean
	/** Image buffer data */
	imgBuffer: Buffer
}

export interface ImgInfo {
	/** image origin filePath */
	filePath: string
	/** image file name before convert */
	oldFileName: string
	/** image file name after convert */
	newFileName: string
	/** image ext type before convert */
	oldExt: string
	/** image ext type after convert */
	newExt: string
}

export interface FilePathInfo {
	/** File path with out ext. like 'src/assets/images/test' */
	purePath: string
	/** File pur ext. like 'jpg' */
	pureExt: string
}
