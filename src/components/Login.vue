<template>
	<div class="login">
		<div class="login_box">
			<div class="login_logo">
				<img src="../assets/logo.png" alt="logo">
			</div>
			<!-- 登录 -->
			<el-form ref="loginFormRef" :rules="loginFormRules" :model="loginForm" label-width="0px" class="login_form">
				<el-form-item prop="username">
					<el-input v-model="loginForm.username" prefix-icon="el-icon-user"></el-input>
				</el-form-item>
				<el-form-item prop="password">
					<el-input v-model="loginForm.password" prefix-icon="el-icon-lock" type="password"></el-input>
				</el-form-item>
				<el-form-item class="login_btns">
					<el-button type="primary" @click="login">登录</el-button>
					<el-button type="info" @click="reset">重置</el-button>
				</el-form-item>
			</el-form>
		</div>
	</div>
</template>

<script>
export default {
  data () {
    return {
      // 数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 表单验证规则
      loginFormRules: {
        username: [
          { required: true, message: '请输入登录名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    reset () { // 表单重置
      this.$refs.loginFormRef.resetFields() // 对整个表单进行重置，将所有字段值重置为初始值并移除校验结果
    },
    login () { // 登录验证
      this.$refs.loginFormRef.validate(async valid => { // 对整个表单进行校验的方法，参数为一个回调函数。并传入两个参数：是否校验成功和未通过校验的字段
        if (!valid) {
          return
        } // valid是否为true
        const { data: res } = await this.$axios.post('login', this.loginForm)
        if (res.meta.status !== 200) { // 判断状态码，200为登录成功
          return this.$message.error('登陆失败')
        } else {
          this.$message.success('登陆成功')
        }
        // 把token保存在内存
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped="scoped">
	.login {
		height: 100%;
		background-color: #2b4b6b;
	}

	.login_box {
		width: 450px;
		height: 300px;
		background-color: #fff;
		border-radius: 3px;
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);

		.login_logo {
			width: 130px;
			height: 130px;
			background-color: #fff;
			border: 1px solid #eee;
			box-shadow: 0 0 10px #ddd;
			border-radius: 50%;
			position: absolute;
			left: 50%;
			transform: translate(-50%, -50%);
			box-sizing: border-box;

			img {
				width: 100%;
				height: 100%;
				border-radius: 50%;
			}
		}
	}

	.login_form {
		width: 100%;
		padding: 0 30px;
		box-sizing: border-box;
		position: absolute;
		bottom: 0;
	}

	.login_btns {
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
