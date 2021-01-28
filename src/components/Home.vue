<template>
	<div>
		<el-button type="infor" @click="logout">退出</el-button>
	</div>
</template>

<script>
export default {
  methods: {
    logout () {
      // 退出原理,清空token,跳回login
      window.sessionStorage.clear()
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped="scoped">
</style>
