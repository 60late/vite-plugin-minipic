// eslint-disable-next-line no-undef
module.exports = {
	plugins: {
		'postcss-pxtorem': {
			rootValue: 37.5, // vant 官方根字体大小
			propList: ['*'],
			selectorBlackList: ['.norem'] // 过滤.norem开头的class，不进行rem转换
		}
	}
}
