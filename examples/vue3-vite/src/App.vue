<template>
	<div id="app">
		<header>
			<router-view name="header"></router-view>
		</header>
		<main class="main">
			<router-view></router-view>
		</main>
		<footer>
			<router-view name="footer"></router-view>
		</footer>
	</div>
</template>

<script setup></script>

<style lang="less" scoped></style>
