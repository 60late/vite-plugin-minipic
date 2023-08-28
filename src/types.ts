import type { OutputBundle, OutputAsset } from 'rollup'
import type { PluginOption } from 'vite'
import type { AvifOptions, JpegOptions, Jp2Options, PngOptions, WebpOptions } from 'sharp'

export { OutputBundle, OutputAsset, PluginOption }

export interface UserOptions {
	/** Sharp.js Options,for more detail options see https://sharp.pixelplumbing.com */
	sharpOptions: SharpOption
	/** Change image type */
	convert: Convert[]
	/** Include files should be processed */
	include: string[] | string
	/** Exclude files should not be processed */
	exclude: string[] | string
}

export interface Convert {
	/** Original image type,now support png/jpg/jpeg/webp */
	from: 'png' | 'jpg' | 'jpeg' | 'webp'
	/** Image type after proccessed,now support png/jpg/jpeg/webp */
	to: 'png' | 'jpg' | 'jpeg' | 'webp'
}

export interface SharpOption {
	avif: AvifOptions
	jpeg: JpegOptions
	jpg: Jp2Options
	png: PngOptions
	webp: WebpOptions
}

export interface RecordsValue {
	/** Image file size after proccessed */
	newSize: number
	/** Original image file size */
	oldSize: number
	/** Image file size compressed ratio */
	compressRatio: string
	/** New image file name after proccessed */
	newFileName: string
}