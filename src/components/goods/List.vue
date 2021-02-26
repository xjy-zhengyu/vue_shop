<template>
	<div>
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>商品管理</el-breadcrumb-item>
			<el-breadcrumb-item>商品列表</el-breadcrumb-item>
		</el-breadcrumb>
		<el-card>
			<el-row :gutter="20">
				<el-col :span="8">
					<el-input placeholder="请输入内容" v-model="queryInfo.query">
						<el-button slot="append" icon="el-icon-search" @click="getGoodsList" clearable @clear="getGoodsList"></el-button>
					</el-input>
				</el-col>
				<el-col :span="4">
					<el-button type="primary" @click="goAddPage">添加商品</el-button>
				</el-col>
			</el-row>
			<el-table :data="goodslist" border stripe="">
				<el-table-column type="index"></el-table-column>
				<el-table-column label="商品名称" prop="goods_name"></el-table-column>
				<el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
				<el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
				<el-table-column label="创建时间" prop="add_time" width="140px">
					<template slot-scope="scope">{{scope.row.add_time | dateFormat}}</template>
				</el-table-column>
				<el-table-column label="操作" width="180px">
					<template slot-scope="scope">
						<el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.goods_id)">编辑</el-button>
						<el-button size="mini" type="danger" icon="el-icon-delete" @click="removeById(scope.row.goods_id)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
			<!-- 分页 -->
			<el-pagination
			@size-change="handleSizeChange"
			@current-change="handleCurrentChange"
			:current-page="queryInfo.pagesize"
			:page-sizes="[3, 5, 10, 15]"
			:page-size="queryInfo.pagesize"
			layout="total, sizes, prev, pager, next, jumper"
			:total="this.total" background>
			</el-pagination>
		</el-card>
		<!-- 编辑 -->
		<el-dialog title="修改参数" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
			<span>
				<el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
					<el-form-item label="商品名称" prop="goods_name">
						<el-input v-model="editForm.goods_name"></el-input>
					</el-form-item>
					<el-form-item label="商品价格" prop="goods_price">
						<el-input v-model="editForm.goods_price"></el-input>
					</el-form-item>
					<el-form-item label="商品重量" prop="goods_weight">
						<el-input v-model="editForm.goods_weight"></el-input>
					</el-form-item>
					<el-form-item label="商品数量" prop="goods_number">
						<el-input v-model="editForm.goods_number"></el-input>
					</el-form-item>
				</el-form>
			</span>
			<span slot="footer" class="dialog-footer">
				<el-button @click="editDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="editList">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
export default {
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      goodslist: [],
      total: 0,
      // 是否显示编辑商品对话框
      editDialogVisible: false,
      editForm: {
        goods_name: '',
        goods_price: '',
        goods_number: '',
        goods_weight: ''
      },
      editFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入数量', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入重量', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      this.goodslist = res.data.goods
      this.total = res.data.total
    },
    // pagesize改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      // 重新请求商品数据
      this.getGoodsList()
    },
    // pagenum改变
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    async removeById (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) {
        this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      this.getGoodsList()
    },
    // 点击跳转到添加商品页面
    goAddPage () {
      this.$router.push('/goods/add')
    },
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('goods/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询商品信息失败!')
      }
      this.editForm = res.data
      console.log(this.editForm)
      this.editDialogVisible = true
    },
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    editList () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('goods/' + this.editForm.goods_id, this.editForm)
        if (res.meta.status !== 200) {
          this.$message.error('更新商品信息失败!')
        } else {
          this.getGoodsList()
          this.$message.success('更新商品信息成功')
        }
        this.editDialogVisible = false
      })
    }
  }
}
</script>

<style>
	.cat_opt{
		margin-top: 15px;
	}
</style>
