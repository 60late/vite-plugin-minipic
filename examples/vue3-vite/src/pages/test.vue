<template>
	<div class="test">
		<img src="@/assets/img/pic1.jpg" alt="" />
		<img src="@/assets/img/pic2.jpeg" alt="" />
		<img src="@/assets/img/pic3.png" alt="" />
		<img src="@/assets/img/pic4.webp" alt="" />
		<div class="bg"></div>
		<img src="@/assets/img/pic6.gif" alt="" />
		<img src="@/static/picx.jpeg" alt="" />
		<img src="/img/pic-include.jpg" alt="" />
		<img src="/pic-skipped.jpeg" alt="" />
		<img src="/img/pic-include.jpg" alt="" />
	</div>
</template>
<script setup>
// const getImg = () => {
// 	return new URL(`../assets/img/pic1.jpg`, import.meta.url).href
// }
</script>
<style lang="less" scoped>
img {
	display: block;
	width: 1000px;
	margin: 5px;
}

.bg {
	background: url('@/assets/img/pic5.jpg');
	background-size: 100% 100%;
	width: 1000px;
	height: 1000px;
}
</style>
