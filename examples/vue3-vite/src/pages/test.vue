<template>
	<div class="test">
		<img src="@/assets/img/pic1.jpg" alt="" />
		<img src="@/assets/img/pic2.jpeg" alt="" />
		<img src="@/assets/img/pic3.png" alt="" />
		<img src="@/assets/img/pic4.webp" alt="" />
		<div class="bg"></div>
		<img src="@/assets/img/pic6.gif" alt="" />
		<img src="@/static/picx.jpeg" alt="" />
	</div>
</template>
<script setup></script>
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
