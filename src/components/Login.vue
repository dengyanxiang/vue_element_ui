<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avater_box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- 表单区域 -->
      <el-form
        ref="loginFormRef"
        class="login_form"
        :model="loginForm"
        :rules="loginFormRule"
        label-width="0px"
      >
        <!-- 用户名输入框  prop进行验证规则绑定 -->
        <el-form-item prop="username">
          <el-input
            prefix-icon="iconfont icon-user"
            v-model="loginForm.username"
          ></el-input>
        </el-form-item>
        <!-- 密码输入框 -->
        <el-form-item prop="password">
          <el-input
            prefix-icon="iconfont icon-3702mima"
            v-model="loginForm.password"
            type="password"
          ></el-input>
        </el-form-item>
        <!-- 两个按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 用户表单信息
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 用户数据验证
      loginFormRule: {
        // 数据验证规划
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '长度在 6 到 15 个字符',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    // 点击重置按钮进行表单重置
    resetLoginForm () {
      //   console.log(this)   // 获取的是整个组件内容  loginFormRef进行表单的回调
      this.$refs.loginFormRef.resetFields()
    },
    // 点击登录按钮进行预验证  validate对整个表单进行验证
    login () {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return
        // 发送器=起一个post的网络请求  { data: res }进行解构赋值
        const { data: res } = await this.$http.post('login', this.loginForm)// 接下来操作：打开MYSQL数据库和API接口
        // 判断用户状态码是否成功
        if (res.meta.status !== 200) {
          return this.$message.error('登陆失败')
        } else {
          this.$message.success('登陆成功')
          // 1.将登陆成功后的 Token 保存到客户端的 sessionStorage中
          window.sessionStorage.setItem('token', res.data.token)
          //    1.1 项目中除了登录之外的API接口，只有登录后才能访问
          //    1.2  Token只应该在当前网页打开时才有效，所以保存在sessionStorage中
          // 2.通过编程式导航跳转到后台主页，路由地址是“/home”
          this.$router.push('/home')
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
.login_container {
  height: 100%;
  background: #2b4d6b;
  .login_box {
    width: 450px;
    height: 300px;
    background: white;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    .avater_box {
      width: 130px;
      height: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 10px #ddd;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: white;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }
    .login_form {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 0 20px;
      box-sizing: border-box;
      // .icon{
      //    font-size: 20px;
      // }
    }
    .btns {
      display: flex;
      justify-content: flex-end; // 右对齐
    }
  }
}
</style>
