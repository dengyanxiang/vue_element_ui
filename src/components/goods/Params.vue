<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item><a href="/">商品管理</a></el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
            <el-alert
                title="注意：仅可以为第三级分类设置相关参数！"
                :closable="false"
                type="warning"
                show-icon>
            </el-alert>
            <el-row class="cat_row">
                <el-col>
                    <!-- 选择商品分类的级联选择框 -->
                    <span>选择商品分类：</span>
                    <el-cascader
                            expanded-trigger="hover"
                            :options="cateList"
                            :props="cateProps"
                            v-model="selectedCateKeys"
                            @change="CateChanged" ></el-cascader>
                </el-col>
            </el-row>
            <!-- Tab标签页 -->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <!-- 添加动态参数的按钮 -->
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
                    <el-table :data="manyTabData" border stripe>
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag size="small" v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handClose(i, scope.row)">{{item}}</el-tag>
                                <!-- 动态添加Tag标签 -->
                                    <el-input
                                        class="input-new-tag"
                                        v-if="scope.row.inputVisible"
                                        v-model="scope.row.inputValue"
                                        ref="saveTagInput"
                                        size="small"
                                        @keyup.enter.native="handleInputConfirm(scope.row)"
                                        @blur="handleInputConfirm(scope.row)"
                                        >
                                    </el-input>
                                    <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeDialogById(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <!-- 添加静态属性的按钮 -->
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" size="small" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
                    <el-table :data="onlyTabDate" border stripe>
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag size="small" v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handClose(i, scope.row)">{{item}}</el-tag>
                                <!-- 动态添加Tag标签 -->
                                    <el-input
                                        class="input-new-tag"
                                        v-if="scope.row.inputVisible"
                                        v-model="scope.row.inputValue"
                                        ref="saveTagInput"
                                        size="small"
                                        @keyup.enter.native="handleInputConfirm(scope.row)"
                                        @blur="handleInputConfirm(scope.row)"
                                        >
                                    </el-input>
                                    <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeDialogById(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>
        <!-- 添加参数的对话框 -->
        <el-dialog
            :title="'添加' + titleText"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="addDialogClosed"
            >
            <el-form :model="addForm" ref="addFormRef" :rules="addFormRule">
                <el-form-item :label="titleText" prop="attr_name" label-width="95px">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addParams">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 删除参数的对话框 -->
         <el-dialog
            :title="'修改' + titleText"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editDialogClose"
            >
            <el-form :model="editForm" ref="editFormRef" :rules="editFormRule">
                <el-form-item :label="titleText" prop="attr_name" label-width="95px">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
  data () {
    return {
      cateList: [],
      cateProps: { // 级联选择框的配置对象
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      selectedCateKeys: [], // 接收被选中的数组名称
      // 被激活的选项
      activeName: 'many',
      // 动态和今天数据的存放
      manyTabData: [],
      onlyTabDate: [],
      addDialogVisible: false,
      //   // 接收添加动态操作的数据
      addForm: {
        attr_name: ''
      },
      addFormRule: {
        attr_name: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }
        ]
      },
      editDialogVisible: false,
      editForm: {
        attr_name: ''
      },
      editFormRule: {
        attr_name: [
          {
            required: true,
            message: '请输入修改的名称',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      } else {
        this.$message.success('获取商品列表成功')
        this.cateList = res.data
        console.log(this.cateList)
      }
    },
    // 级联选择器的数据的变化事件
    CateChanged () {
      this.getParamsData()
    },
    // tabs 的点击事件
    handleTabClick () {
      this.getParamsData()
    },
    // 获取参数事件
    async getParamsData () {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTabData = []
        this.onlyTabDate = []
      } else {
        // console.log(this.selectedCateKeys)
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数失败')
        } else {
          this.$message.success('获取动态参数成功')
          // 对获取的数据进行遍历，并且转换成一个数组
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
            // 控制文本框的显示与隐藏
            item.inputVisible = false
            // 文本框的输入的值
            item.inputValue = ''
          })
          console.log(res.data)
          if (this.activeName === 'many') {
            this.manyTabData = res.data
            console.log(this.manyTabData)
          } else {
            this.onlyTabDate = res.data
          }
        }
      }
    },
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 提交修改的数据
    addParams () {
      this.$refs.addFormRef.validate(async(valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, { attr_name: this.addForm.attr_name, attr_sel: this.activeName })
        if (res.meta.status !== 201) {
          return this.$message.error('更新数据失败')
        } else {
          this.$message.success('更新数据成功')
          this.addDialogVisible = false
          this.getParamsData()
        }
      })
    },
    // 根据ID查询参数
    async showEditDialog (attrId) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, { params: { attr_sel: this.activeName } })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('查询参数失败')
      } else {
        this.editForm = res.data
        // console.log(this.editForm)
      }
      this.editDialogVisible = true
    },
    editDialogClose () {
      this.$refs.editFormRef.resetFields()
    },
    // 提交修改的参数
    editParams () {
      this.$refs.editFormRef.validate(async(valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, { attr_name: this.editForm.attr_name, attr_sel: this.activeName })
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('数据提交失败')
        } else {
          this.$message.success('数据提交成功')
          this.getParamsData()
        }
      })
      this.editDialogVisible = false
    },
    async removeDialogById (attrId) {
      const confirmResult = await this.$confirm('此操作将永久删除该属性, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        this.$message.info('已取消删除')
      } else {
        const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除属性失败')
        } else {
          this.$message.success('删除属性成功')
          this.getParamsData()
        }
      }
    },
    // 文本框失去焦点或者按下ENter键触发的事件
    // trim(): 取出字符串首尾空格
    async handleInputConfirm (row) {
      //  判断输入的数字是否有效
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
      } else {
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue = ''
        row.inputVisible = false
        // 重新发起新的网络请求，把数据提交到后台数据库
        this.savaAttrValue(row)
      }
    },
    // Tag按钮的点击事件
    showInput (row) {
      row.inputVisible = true
      // 控制输入框自动获得焦点
      // $nextTick 函数：当页面上的函数被重新渲染后才会触发回调函数
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    async savaAttrValue (row) {
      // 重新发起新的网络请求，把数据提交到后台数据库
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, { attr_name: row.attr_name, attr_sel: row.attr_sel, attr_vals: row.attr_vals.join(' ') })
      // console.log(res)
      if (res.meta.status !== 200) {
        this.$message.error('数据更新失败')
      } else {
        this.$message.success('数据更新成功')
        this.getParamsData()
      }
    },
    // 删除可选参数
    handClose (i, row) {
      row.attr_vals.splice(i, 1)
      this.savaAttrValue(row)
    }
  },
  computed: {
    // 如果按钮被禁用则返回true，否则返回false
    isBtnDisabled () {
      if (this.selectedCateKeys.length !== 3) {
        return true
      } else {
        return false
      }
    },
    // 获取当前选中的三级分类ID
    cateId () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      } else {
        return null
      }
    },
    // 动态设置提示文本值
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>
<style lang="less" scoped>
.cat_row{
    margin-top: 10px;
}
.el-tag{
    margin: 15px;
}
.input-new-tag{
    width: 120px;
}
</style>
