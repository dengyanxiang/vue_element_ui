<template>
    <div>
        <el-button type="info" @click="logout">退出</el-button>
    </div>
</template>
<script>
export default {
  methods: {
    logout () {
      window.sessionStorage.clear() // 清除本地的Token数据
      this.$router.push('/login') // 将路由重定向回登录页面
    }
  }
}
</script>
<style lang="less" scoped>

</style>
