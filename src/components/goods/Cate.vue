<template>
	<div>
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>商品管理</el-breadcrumb-item>
			<el-breadcrumb-item>商品分类</el-breadcrumb-item>
		</el-breadcrumb>
		<el-card>
			<el-row>
				<el-col>
					<el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
				</el-col>
			</el-row>
			<tree-table class="treeTable" :data="catelist" :columns="columns" :selection-type="false"
			:expand-type="false" :show-row-hover="false" show-index index-text="#" border >
				<template slot="isok" slot-scope="scope">
					<i v-if="scope.row.cat_deleted === false" class="el-icon-success" style="color: lightgreen;"></i>
					<i v-else class="el-icon-erro" style="color: red;"></i>
				</template>
				<template slot="order" slot-scope="scope">
					<el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
					<el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
					<el-tag size="mini" type="warning" v-else>三级</el-tag>
				</template>
				<template slot="opt" slot-scope="scope">
					<el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.cat_id)">编辑</el-button>
					<el-button size="mini" type="danger" icon="el-icon-delete" @click="removeCateById(scope.row.cat_id)">删除</el-button>
				</template>
			</tree-table>
			<!-- 分页 -->
			<el-pagination
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange"
				:current-page="queryInfo.pagenum"
				:page-sizes="[5, 7, 10]"
				:page-size="queryInfo.pagesize"
				layout="total, sizes, prev, pager, next, jumper"
				:total="total">
			</el-pagination>
		</el-card>
		<!-- 添加分类 -->
		<el-dialog title="添加分类" :visible.sync="addCateVisible" width="50%" @close="addCateDialogClose">
			<el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
				<!-- prop校验规则 -->
				<el-form-item label="分类名称:" prop="cat_name">
					<el-input v-model="addCateForm.cat_name"></el-input>
				</el-form-item>
				<el-form-item label="父级分类:">
					<!-- options数据源，props:配置选项 ,v-model:已选择父级分类的，只能是数组-->
					<el-cascader v-model="selectedKeys" :options="parentCateList" :props="cascaderProps"
					@change="parentCateChange" clearable>
					</el-cascader>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="addCateVisible = false">取 消</el-button>
				<el-button type="primary" @click="addCate">确 定</el-button>
			</span>
		</el-dialog>
		<!-- 编辑分类 -->
		<el-dialog title="修改用户" :visible.sync="editCateVisible" width="50%" @close="editCateDialogClosed">
			<span>
				<el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef" label-width="100px">
					<el-form-item label="分类名称" prop="cat_name">
						<el-input v-model="editCateForm.cat_name"></el-input>
					</el-form-item>
				</el-form>
			</span>
			<span slot="footer" class="dialog-footer">
				<el-button @click="editCateVisible = false">取 消</el-button>
				<el-button type="primary" @click="editCate">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
export default {
  data () {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 存放获取的数据
      catelist: [],
      // 总数据数量
      total: 0,
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      addCateVisible: false,
      addCateForm: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0
      },
      addCateFormRules: {
        cat_name: [
          // required必填，message错误信息，trigger触发验证时机
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      cat_level: [],
      parentCateList: [],
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      // 选中的父级分类
      selectedKeys: [],
      editCateVisible: false,
      editCateForm: {},
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }

    }
  },
  created () {
    // 获取数据
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.catelist = res.data.result
      this.total = res.data.total
    },
    // 监听pagesize改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听pagenum改变
    handleCurrentChange (newNum) {
      this.queryInfo.pagenum = newNum
      this.getCateList()
    },
    showAddCateDialog () {
      this.getParentCateList()
      this.addCateVisible = true
    },
    addCateDialogClose () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 获取父级分类数据请求
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级数据失败')
      }
      this.parentCateList = res.data
    },
    parentCateChange (val) {
      // val为this.selectedKeys，选中的父类
      console.log(val)
      // 如果selectedKeys的长度大于0，则选中了父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    async addCate () {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功!')
        this.getCateList()
        this.addCateVisible = false
      })
    },
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询分类信息失败!')
      }
      this.editCateForm = res.data
      this.editCateVisible = true
    },
    editCateDialogClosed () {
      this.$refs.editCateFormRef.resetFields()
    },
    editCate () {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('categories/' + this.editCateForm.cat_id, { cat_name: this.editCateForm.cat_name })
        if (res.meta.status !== 200) {
          this.$message.error('更新分类名称失败!')
        } else {
          this.getCateList()
          this.$message.success('更新分类名称成功')
        }
        this.editCateVisible = false
      })
    },
    async removeCateById (id) {
      // 弹框提示
      const confirmResult = await this.$confirm('此操作将永久删除该商品分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => { return err })
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      } else {
        const { data: res } =  await this.$http.delete('categories/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除失败')
        } else {
          this.$message.success('删除成功')
          this.getCateList()
        }
      }
    }
  }
}
</script>

<style lang="less" scoped="scoped">
	.treeTable{
		margin-top: 15px;
	}
	.el-cascader{
		width: 100%;
	}
</style>
