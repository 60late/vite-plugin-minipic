import fs from 'fs'
import path from 'path'

const cacheDirectory = path.join(process.cwd(), 'node_modules', '.cache')

export class DiskCache {
	constructor() {
		this.directoryGuard(cacheDirectory)
	}
	/**
	 *
	 * @description: Get disk file by Name
	 * @param {string} fileName
	 * @return {*}
	 */
	get(fileName: string) {
		const filePath = this.getPureFilePath(fileName)
		try {
			const imgBuffer: Buffer = fs.readFileSync(filePath)
			return imgBuffer
		} catch {
			return null
		}
	}

	/**
	 * @description:  Check if disk file exist
	 * @param {*} fileName
	 * @return {boolean}
	 */
	has(fileName: string) {
		const filePath = this.getPureFilePath(fileName)
		try {
			fs.statSync(filePath)
			return true
		} catch {
			return false
		}
	}

	/**
	 * @description: Set disk file by fileName and buffer
	 * @param {string} fileName
	 * @param {Buffer} imgBuffer
	 * @return {*}
	 */
	set(fileName: string, imgBuffer: Buffer) {
		const filePath = this.getPureFilePath(fileName)
		fs.writeFileSync(filePath, imgBuffer)
	}

	/**
	 * @description: make sure directory exist
	 * @param {string} directory file directory
	 */
	directoryGuard(directory: string) {
		if (!fs.existsSync(directory)) {
			fs.mkdirSync(directory)
		}
	}

	/**
	 * @description: fileName will be like `assets/img.png` or `public/img.png`, we only need `img.png`
	 * @param {string} fileName
	 * @return {string} filePath
	 */
	getPureFilePath(fileName: string): string {
		const fileNameArry = fileName.split('/')
		const pureFileName = fileNameArry[fileNameArry.length - 1]
		const filePath = path.join(cacheDirectory, pureFileName)
		return filePath
	}
}
