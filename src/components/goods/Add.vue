<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
            <el-alert
                title="添加商品信息"
                type="info"
                center
                show-icon>
            </el-alert>
            <!-- 进度条部分 :active="activeIndex - 0" 用于绑定激活对象 -->
            <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
                <el-tabs v-model="activeIndex" tab-position="left" :before-leave="beforeTabsLeave" @tab-click="tabsClicked">
                    <el-tab-pane label="基本信息" name="0">
                       <el-form-item label="商品名称" prop="goods_name">
                           <el-input v-model="addForm.goods_name"></el-input>
                       </el-form-item>
                       <el-form-item label="商品价格" prop="goods_price">
                           <el-input v-model="addForm.goods_price" type="number"></el-input>
                       </el-form-item>
                       <el-form-item label="商品重量" prop="goods_weight">
                           <el-input v-model="addForm.goods_weight" type="number"></el-input>
                       </el-form-item>
                       <el-form-item label="商品数量" prop="goods_number">
                           <el-input v-model="addForm.goods_number" type="number"></el-input>
                       </el-form-item>
                       <el-form-item label="商品分类" prop="goods_cat">
                           <!-- :props="cateProps":级联选择器的配置项 -->
                           <!-- v-model="addForm.goods_cat": 绑定索引项 -->
                           <el-cascader
                            expanded-trigger="hover"
                            :options="cateList"
                            :props="cateProps"
                            v-model="addForm.goods_cat"
                            @change="handChanged" ></el-cascader>
                       </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
                             <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox :label="cd" v-for="(cd, i) in item.attr_vals" :key="i" border></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
                                <el-input v-model="item.attr_vals"></el-input>
                            </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <el-upload
                            :action="onloadUrl"
                            :on-preview="handlePreview"
                            :on-remove="handleRemove"
                            :headers = "headerObj"
                            :on-success="handleSuccess"
                            list-type="picture">
                            <el-button size="small" type="primary">点击上传</el-button>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <quill-editor
                            ref="myQuillEditor"
                            v-model="addForm.goods_introduce">
                        </quill-editor>
                        <el-button class="btns" type="primary" @click="addGoods">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>
        <!-- 图标预览 -->
        <el-dialog
            title="图片预览"
            :visible.sync="previewDialogVisible"
            width="50%"
            >
            <img :src="prievePath" alt="" class="pic">
        </el-dialog>
    </div>
</template>
<script>
import _ from 'lodash'
export default {
  data () {
    return {
      activeIndex: '0',
      addForm: {
        goods_id: '',
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        // 添加图片的数组
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      addFormRules: {
        goods_name: [
          {
            required: true,
            message: '请输入商品名称:',
            trigger: 'blur'
          }
        ],
        goods_price: [
          {
            required: true,
            message: '请输入商品价格:',
            trigger: 'blur'
          }
        ],
        goods_weight: [
          {
            required: true,
            message: '请输入商品重量:',
            trigger: 'blur'
          }
        ],
        goods_number: [
          {
            required: true,
            message: '请输入商品数量:',
            trigger: 'blur'
          }
        ],
        goods_cat: [
          {
            required: true,
            message: '请输入商品分类:',
            trigger: 'blur'
          }
        ]
      },
      cateList: [],
      // 级联选择器的配置项
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      manyTableData: [],
      onlyTableData: [],
      onloadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      prievePath: '',
      previewDialogVisible: false
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      // console.log(res.data)
      if (res.meta.status !== 200) {
        return this.$message.console.error('获取分类参数失败')
      } else {
        this.cateList = res.data
      }
    },
    // 级联选择器选项的变化触发的函数
    handChanged () {
      // console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // 监听变迁页的切换事件
    beforeTabsLeave (activeName, oldActiveName) {
    //   console.log(activeName) // activeName：表示即将进入的标签页的索引
    //   console.log(oldActiveName) // oldActiveName：表示即将离开的标签页的索引
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类！')
        return false
      }
    },
    // 获取Tab 的点击事件
    async tabsClicked () {
      // console.log(this.activeIndex)
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数失败')
        } else {
          this.$message.success('获取动态参数成功')
          res.data.forEach(item => {
            //   将 attr_vals 字符串转化成数组
            item.attr_vals = item.attr_vals.length === 3 ? [] : item.attr_vals.split(' ')
          })
          this.manyTableData = res.data
          console.log(this.manyTableData)
        }
      }
      if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
        if (res.meta.status !== 200) {
          return this.$message.error('商品属性请求失败')
        } else {
          this.onlyTableData = res.data
          // console.log(this.onlyTableData)
        }
      }
    },
    handlePreview (file) {
      console.log(file)
      this.prievePath = file.response.data.url
      this.previewDialogVisible = true
    },
    handleRemove (file) {
      // 1,获取需要删除的图片的临时路径
      // console.log(file)
      const filePath = file.response.data.tmp_path
      // 2，从pics数组中找到该图片的索引值
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      // 3,使用splice将对应的索引值进行移除
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm)
    },
    // 监听图片上传成功的事件
    handleSuccess (response) {
      // 1,先拼接一个图片对象
      // 2，将拼接到的对象 push 到 pics数组中
      // console.log(response)
      const picsInfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picsInfo)
      // console.log(this.addForm)
    },
    addGoods () {
      // console.log(this.addForm)
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写相应的表单项！')
        } else {
          const Form = _.cloneDeep(this.addForm)
          Form.goods_cat = Form.goods_cat.join(',')
          // 处理动态参数
          this.manyTableData.forEach(item => {
            const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals.join(' ') }
            this.addForm.attrs.push(newInfo)
          })
          // 处理静态属性
          this.onlyTableData.forEach(item => {
            const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
            this.addForm.attrs.push(newInfo)
          })
          Form.attrs = this.addForm.attrs
          // console.log(Form)
          const { data: res } = await this.$http.post('goods', Form)
          if (res.meta.status !== 201) {
            return this.$message.error('添加商品失败')
          } else {
            this.$message.success('添加商品成功')
            // 跳转会商品信息面板n
            this.$router.push('/goods')
          }
        }
      })
    }
  },
  computed: {
    cateId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      } else {
        return null
      }
    }
  }
}
</script>
<style lang="less" scoped>
.el-tabs{
    margin-top: 20px;
}
.el-checkbox{
    margin: 0 7px 0 0 !important
}
.pic{
    width: 100%;
}
.btns{
    margin-top: 10px;
}
</style>
