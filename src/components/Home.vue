<template>
	<el-container class="home-wrap">
		<el-header>
			<div>
				<img src="../assets/logo.png" alt="logo">
				<span>电商后台管理系统</span>
			</div>
			<el-button type="info" @click="logout">退出</el-button>
		</el-header>
		<el-container>
			<el-aside :width="isCollapse ? '64px' : '200px'">
				<el-menu background-color="#333744" text-color="#fff" active-text-color="#409eff"
					:unique-opened="true" :collapse="isCollapse" :collapse-transition="false"
					:router="true" :default-active="activePath">
					<div class="toggle-button" @click="toggleCollapase">|||</div>
					<el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
						<template slot="title">
							<i :class="iconsObj[item.id]"></i>
							<span>{{item.authName}}</span>
						</template>
						<el-menu-item :index="'/'+subItem.path + ''" v-for="subItem in item.children" :key="subItem.id"
							@click="savNavState('/'+subItem.path)">
							<i class="el-icon-menu"></i>
							<span>{{subItem.authName}}</span>
						</el-menu-item>
					</el-submenu>
				</el-menu>
			</el-aside>
			<el-main>
				<router-view></router-view>
			</el-main>
		</el-container>
	</el-container>
</template>

<script>
export default {
  data () {
    return {
      menulist: [],
      iconsObj: {
        125: 'iconfont icon-icon_user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      isCollapse: false,
      activePath: ''
    }
  },
  created () {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout () {
      // 退出原理,清空token,跳回login
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList () {
      // 获取所有菜单
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) {
        return this.$message.erroe(res.meta.msg)
      } else {
        this.menulist = res.data
      }
    },
    toggleCollapase () {
      this.isCollapse = !this.isCollapse
    },
    savNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped="scoped">
	.home-wrap{
		height: 100%;
	}
	.el-header {
		background-color: #373d41;
		display: flex;
		justify-content: space-between;
		align-items: center;
		color: #fff;
		font-size: 26px;
		>div{
			display: flex;
			justify-content: center;
			align-items: center;
			span{
				margin-left: 20px;
			}
			img{
				width: 50px;
				height: 50px;
			}
		}
	}
	.el-aside {
		background-color: #333744;
		.el-menu{
			border-right: none;
		}
	}
	.el-main {
		background-color: #eaedf1;
	}
	.iconfont{
		margin-right: 8px;
	}
	.toggle-button{
		background-color: #4a5064;
		font-size: 10px;
		line-height: 24px;
		color: #fff;
		text-align: center;
		letter-spacing: 0.2em;
		cursor: pointer;
	}
</style>
