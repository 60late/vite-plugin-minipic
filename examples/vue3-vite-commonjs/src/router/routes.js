// 静态路由
const constantRoutes = [
	{
		path: '/',
		redirect: '/test'
	},
	{
		path: '/test',
		title: '图片测试',
		component: () => import('@/pages/test.vue')
	}
]

export default constantRoutes
