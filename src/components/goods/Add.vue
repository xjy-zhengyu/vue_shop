<template>
	<div>
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>商品管理</el-breadcrumb-item>
			<el-breadcrumb-item>添加商品</el-breadcrumb-item>
		</el-breadcrumb>
		<el-card>
			<el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
			<!-- 进度条,active:显示激活索引，字符串-0,隐式转换把字符串变成数字  -->
			<el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
				<el-step title="基本信息"></el-step>
				<el-step title="商品参数"></el-step>
				<el-step title="商品属性"></el-step>
				<el-step title="商品图片"></el-step>
				<el-step title="商品内容"></el-step>
				<el-step title="完成"></el-step>
			</el-steps>
			<el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
				<!-- tab栏区域 -->
				<!-- :tab-position标签位置, :before-leave 是否阻止切换标签页, @tab-click切换时触发,判断动态参数还是静态属性-->
				<el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeLeave" @tab-click="tabClickd">
					<!-- el-tab-pane:每一项，label标题，name对应 进度条的activeIndex -->
					<!-- el-tab-pane只能为el-tabs的子节点 -->
					<el-tab-pane label="基本信息" name="0">
						<el-form-item label="商品名称" prop="goods_name">
							<el-input v-model="addForm.goods_name"></el-input>
						</el-form-item>
						<el-form-item label="商品价格" prop="goods_price">
							<!--  type="number"  只能输入数字-->
							<el-input v-model="addForm.goods_price" type="number"></el-input>
						</el-form-item>
						<el-form-item label="商品重量" prop="goods_weight">
							<el-input v-model="addForm.goods_weight" type="number"></el-input>
						</el-form-item>
						<el-form-item label="商品数量" prop="goods_number">
							<el-input v-model="addForm.goods_number" type="number"></el-input>
						</el-form-item>
						<el-form-item label="商品分类" prop="goods_cat">
							<!-- 级联选择器 -->
							<el-cascader v-model="addForm.goods_cat" :options="cateList" :props="cateProps" @change="handleChange"></el-cascader>
						</el-form-item>
					</el-tab-pane>
					<el-tab-pane label="商品参数" name="1">
						<!-- 渲染表单item项目 -->
						<el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
							<!-- 多选框组 -->
							<el-checkbox-group v-model="item.attr_vals">
								<el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
							</el-checkbox-group>
						</el-form-item>
					</el-tab-pane>
					<el-tab-pane label="商品属性" name="2">
						<el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
							<el-input v-model="item.attr_vals"></el-input>
						</el-form-item>
					</el-tab-pane>
					<el-tab-pane label="商品图片" name="3">
						<!-- action：图片上传地址，on-preview：点击预览事件， on-remove 删除事件，list-type：预览文件的显示形式
						headers：设置上传的请求头部，on-success上传成功的钩子函数-->
						<el-upload :action="imgUploadURL" :on-preview="handlePreview" :on-remove="handleRemove"
						list-type="picture" :headers="headersObj" :on-success="handleSuccess">
							<el-button size="small" type="primary">点击上传</el-button>
						</el-upload>
					</el-tab-pane>
					<el-tab-pane label="商品内容" name="4">
						<quill-editor v-model="addForm.goods_introduce"></quill-editor>
						<el-button type="primary" class="addBtn" @click="add">添加商品</el-button>
					</el-tab-pane>
				</el-tabs>
			</el-form>
			<!-- 预览放大图片 -->
			<el-dialog title="预览图片" :visible.sync="previewImgVisible" width="50%">
				<img :src="previewPath" alt class="previewImg" />
			</el-dialog>
		</el-card>
	</div>
</template>

<script>
import _ from 'lodash'
export default {
  data () {
    return {
      // 激活步骤下标
      activeIndex: '0',
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 选中的商品类别id数组
        goods_cat: [],
        // 上传图片临时地址数组
        pics: [],
        // 商品详情描述
        goods_introduce: '',
        // 动态参数和静态属性
        attrs: []
      },
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '选择商品分类', trigger: 'blur' }
        ]
      },
      // 商品分类数组
      cateList: [],
      // 配置级联分类
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      manyTableData: [],
      onlyTableData: [],
      // 上传图片地址
      imgUploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传使用内部封装的axjx，需要为其指定token
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片预览地址
      previewPath: '',
      // 是否显示图片预览对话框
      previewImgVisible: false
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.cateList = res.data
    },
    // 级联选择器选择发生变化时，触发
    handleChange () {
      // 判断选择的分类不能为一级或二级分类
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // 切换标签页触发
    beforeLeave (activeName, oldActiveName) {
      // activeName：切换的标签页名称 , oldActiveName切换前的标签名
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选者商品分类！')
        return false
      }
    },
    // 点击tab触发
    async tabClickd () {
      // activeIndex === '1' ，访问动态参数面板
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败')
        }
        // v-model绑定的为数组， 实际数据为字符转，需要转换
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length !== 0 ? item.attr_vals.split(' ') : []
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') { // 静态属性
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.onlyTableData = res.data
      }
    },
    // 上传成功触发
    handleSuccess (response) {
      // response服务器返回的数据，network里面可以看到
      // 将上传成功的图片的临时地址保存在数组中
      const picURL = {
        pic: response.data.tmp_path
      }
      this.addForm.pics.push(picURL)
      console.log(this.addForm)
    },
    // 移除图片触发
    handleRemove (file) {
      // 将要删除的图片的信息
      console.log(file)
      // 获取图片在服务器上的临时地址
      const uploadURL = file.response.data.tmp_path
      // 根据图片地址查找其在addForm的pics中的下标
      const i = this.addForm.pics.findIndex(item =>
        item.pic === uploadURL
      )
      // 根据下标删除图片
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm)
    },
    // 点击图片预览
    handlePreview (file) {
      console.log(file)
      this.previewPath = file.response.data.url
      this.previewImgVisible = true
    },
    // 点击添加商品
    add () {
      console.log(this.addForm)
      // 添加商品前的表单预验证
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单选项！')
        }
        // 执行添加商品操作
        // 将addForm 中的goods_cat转化成由逗号分隔的字符串,为了不影响级联选择框使用，深度拷贝一份
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs

        // 添加商品
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败')
        }
        this.$message.success('添加商品成功')
        // 跳转到商品列表页
        this.$router.push('/goods')
        console.log(form)
      })
    }
  },
  computed: {
    // 三级分类当前ID
    cateId () {
      if (this.addForm.goods_cat.length === 3) {
        // 返回最后一个
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.addBtn{
  margin-top: 15px;
}
</style>
ss
