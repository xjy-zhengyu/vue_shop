<template>
	<div>
		<!-- 导航 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>权限管理</el-breadcrumb-item>
			<el-breadcrumb-item>角色列表</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 视图 -->
		<el-card>
			<el-row>
				<el-col>
					<el-button type="primary" @click="addRoleVisible = true">添加角色</el-button>
				</el-col>
			</el-row>
			<el-table :data="rolelist" border stripe>
				<!-- 展开列 -->
				<el-table-column type="expand">
					<template slot-scope="scope">
						<el-row :class="['bdtop',i1 === 0 ? 'bdtop' : '','vcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
							<el-col :span="5">
								<!-- 一级权限 -->
								<el-tag :key="i1" @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
								<i class="el-icon-caret-right"></i>
							</el-col>
							<!-- 二级三级权限 -->
							<el-col :span="19">
								<el-row :class="[i2 !== 0 ? 'bdtop' : '','vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
									<el-col :span="6">
										<el-tag type="success" @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
										<i class="el-icon-caret-right"></i>
									</el-col>
									<el-col :span="18">
										<el-tag @close="removeRightById(scope.row,item3.id)" closable type="warning" v-for="(item3) in item2.children" :key="item3.id">{{item3.authName}}</el-tag>
									</el-col>
								</el-row>
							</el-col>
						</el-row>
					</template>
				</el-table-column>
				<!-- 索引列 -->
				<el-table-column type="index"></el-table-column>
				<el-table-column label="角色名称" prop="roleName"></el-table-column>
				<el-table-column label="角色描述" prop="roleDesc"></el-table-column>
				<el-table-column label="操作" width="300px">
					<template slot-scope="scope">
						<el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditRoleDialog(scope.row.id)">编辑</el-button>
						<el-button size="mini" type="danger" icon="el-icon-delete" @click="removeRoleById(scope.row.id)">删除</el-button>
						<el-button size="mini" type="warning" icon="el-icon-setting" @click="showRightDialog(scope.row)">分配权限</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-card>
		<!-- 添加角色 -->
		<el-dialog title="添加角色" :visible.sync="addRoleVisible" width="30%" @close="addDialogClose">
			<span>
				<el-form :model="addRoleForm" :rules="addRoleFormRules" ref="addRoleFormRef" label-width="80px">
					<!-- prop校验规则 -->
					<el-form-item label="角色名称" prop="roleName">
						<el-input v-model="addRoleForm.roleName"></el-input>
					</el-form-item>
					<el-form-item label="角色描述" prop="roleDesc">
						<el-input v-model="addRoleForm.roleDesc"></el-input>
					</el-form-item>
				</el-form>
			</span>
			<span slot="footer" class="dialog-footer">
				<el-button @click="addRoleVisible = false">取 消</el-button>
				<el-button type="primary" @click="addRole">确 定</el-button>
			</span>
		</el-dialog>
		<!-- 编辑角色 -->
		<el-dialog title="编辑角色" :visible.sync="editRoleVisible" width="50%" @close="editRoleClosed">
			<span>
				<el-form :model="editRoleForm" :rules="editRoleFormRules" ref="editRoleFormRef" label-width="80px">
					<el-form-item label="角色名称" prop="roleName">
						<el-input v-model="editRoleForm.roleName"></el-input>
					</el-form-item>
					<el-form-item label="角色描述" prop="roleDesc">
						<el-input v-model="editRoleForm.roleDesc"></el-input>
					</el-form-item>
				</el-form>
			</span>
			<span slot="footer" class="dialog-footer">
				<el-button @click="editRoleVisible = false">取 消</el-button>
				<el-button type="primary" @click="editRoleInfo">确 定</el-button>
			</span>
		</el-dialog>
		<!-- 分配权限 -->
		<el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRighsClosed">
			<span>
				<el-tree ref="treeRef" :data="rightsList" :props="treeProps" show-checkbox node-key="id" :default-expand-all="true" :default-checked-keys="defKeys"></el-tree>
			</span>
			<span slot="footer" class="dialog-footer">
				<el-button @click="setRightDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="allotRights">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
export default {
  data () {
    return {
      // 所有角色列表
      rolelist: [],
      // 添加角色框显示隐藏
      addRoleVisible: false,
      // 添加角色的表单数据
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色验证规则
      addRoleFormRules: {
        roleName: [
          // required必填，message错误信息，trigger触发验证时机
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 7, message: '角色名长度在2~7个字符之间', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      editRoleVisible: false,
      // 编辑用户时查到的用户信息
      editRoleForm: {},
      editRoleFormRules: {
        roleName: [
          // required必填，message错误信息，trigger触发验证时机
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 7, message: '角色名长度在2~7个字符之间', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      // 控制分配权限对话框的显示隐藏
      setRightDialogVisible: false,
      // 获取的权限数据
      rightsList: [],
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认被选中的权限数据id
      defKeys: [],
      // 即将分配权限的id
      roleId: ''
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 获取角色列表
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      } else {
        this.rolelist = res.data
        console.log(this.rolelist)
      }
    },
    // 关闭窗口重置input数据
    addDialogClose () {
      this.$refs.addRoleFormRef.resetFields()
    },
    // 添加角色
    addRole () {
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加角色失败!')
        } else {
          this.getRolesList()
          this.$message.success('添加角色成功')
        }
        this.addRoleVisible = false
      })
    },
    // 编辑时，查询用户信息
    async showEditRoleDialog (id) {
      const { data: res } = await this.$http('roles/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('查询用户信息失败!')
      } else {
        this.editRoleForm = res.data
      }
      this.editRoleVisible = true
    },
    editRoleClosed () {
      this.$refs.editRoleFormRef.resetFields()
    },
    // 编辑角色信息
    editRoleInfo () {
      this.$refs.editRoleFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('roles/' + this.editRoleForm.roleId, { roleName: this.editRoleForm.roleName, roleDesc: this.editRoleForm.roleDesc })
        if (res.meta.status !== 200) {
          this.$message.error('更新角色信息失败!')
        } else {
          this.getRolesList()
          this.$message.success('更新角色信息成功')
        }
        this.editRoleVisible = false
      })
    },
    async removeRoleById (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => { return err })
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      } else {
        const { data: res } = await this.$http.delete('roles/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除角色失败')
        } else {
          this.$message.success('已成功删除角色')
          this.getRolesList()
        }
      }
    },
    async removeRightById (role, rightId) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => { return err })
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除角色权限')
      } else {
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除权限失败')
        } else {
          role.children = res.data
          this.$message.success('已成功删除角色权限')
        }
      }
    },
    // 展示分配权限
    async showRightDialog (role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('数据获取失败')
      } else {
        this.rightsList = res.data
        this.getLeafKeys(role, this.defKeys)
        this.setRightDialogVisible = true
      }
    },
    // 递归获取选中的的id，添加到defKeys数组中
    getLeafKeys (node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    setRighsClosed () {
      this.defKeys = []
    },
    async allotRights () {
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped="scoped">
	.el-tag{
		margin: 7px;
	}
	.bdtop{
		border-top: 1px solid #eee;
	}
	.bdbot{
		border-bottom: 1px solid #eee;
	}
	.vcenter{
		display: flex;
		align-items: center;
	}
</style>
