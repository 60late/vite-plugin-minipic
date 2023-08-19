// eslint-disable-next-line @typescript-eslint/no-var-requires
const sharp = require('sharp')

sharp('./img/pic4.png')
	.png({
		quality: 75,
		force: true
	})
	.toFile('img/pic4test11.png')
	.then(() => console.log('保存完成'))
