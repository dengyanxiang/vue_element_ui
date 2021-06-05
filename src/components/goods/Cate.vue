<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item><a href="/">商品管理</a></el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <el-row>
                <el-col>
                    <el-button class="btns" type="primary" @click="addCateGoods">添加分类</el-button>
                </el-col>
            </el-row>
            <!-- 表格区域 -->
            <tree-table class="tree-table" :data="catalist"  :columns="columns" :selection-type="false" :expand-type="false" :show-index="true" index-text="#" :border="true">
                <!-- 是否有效数据排放 -->
                <template slot="isOk" slot-scope="scope">
                    <i class="el-icon-success" v-if="scope.row.cat_deleted === false " style="color:lightgreen"></i>
                    <i class="el-icon-error" v-else style="color:red"></i>
                </template>
                <!-- 排序的渲染 -->
                <template slot="order" slot-scope="scope">
                    <!-- {{scope.row.cat_level + 1}} -->
                    <el-tag type="primary" size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
                    <el-tag type="success" mini v-else-if="scope.row.cat_level === 1">二级</el-tag>
                    <el-tag type="warning" mini v-else>三级</el-tag>
                </template>
                <!-- 编辑列的渲染 -->
                <template slot="edit" slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.cat_id)">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCateById(scope.row.cat_id)">删除</el-button>
                </template>
            </tree-table>
            <!-- 分页区域 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="querInfo.pagenum"
                :page-sizes="[3, 5, 10, 11]"
                :page-size="querInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
        </el-card>
        <!-- 添加商品的弹出框 -->
            <el-dialog
                title="添加分类:"
                :visible.sync="addCateDialogVisible"
                width="50%"
                @close="addCateDialogClosed"
                >
                <el-form :model="addCateForm" :rules="addCateRules" ref="addCateRef" label-width="100px">
                    <el-form-item label="分类名称：" prop="cat_name">
                        <el-input v-model="addCateForm.cat_name"></el-input>
                    </el-form-item>
                    <el-form-item label="父级分类：">
                        <!--:props="cascaderProps" 用来指定配置对象  -->
                        <!-- :options="parenCateList" 指定数据源 -->
                         <el-cascader
                            expanded-trigger="hover"
                            :options="parenCateList"
                            :props="cascaderProps"
                            v-model="selectedKeys"
                            @change="parentCateChanged" clearable></el-cascader>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="addCateDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="addCate">确 定</el-button>
                </span>
            </el-dialog>
        <!-- 编辑分类的弹出框 -->
        <el-dialog
            title="提示"
            :visible.sync="editCateDialogVisible"
            width="50%"
            >
            <el-form :model="editCateForm" ref="editCateRef" label-width="80px">
                <el-form-item label="角色名称">
                    <el-input v-model="editCateForm.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editCate">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
  data () {
    return {
      // 用于接收所有的分类列表数据
      catalist: [],
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 总数据条数
      total: 0,
      // 表格列的数据数据
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        }, {
          label: '是否有效',
          // 设置该列为作用域插槽，插槽名称为isOK
          type: 'template',
          template: 'isOk'
        }, {
          label: '排序',
          // 设置该列为作用域插槽，插槽名称为isOK
          type: 'template',
          template: 'order'
        }, {
          label: '编辑',
          // 设置该列为作用域插槽，插槽名称为isOK
          type: 'template',
          template: 'edit'
        }
      ],
      // 控制添加商品的对话框的显示与隐藏
      addCateDialogVisible: false,
      // 接收添加分类表单数据
      addCateForm: {
        cat_name: '',
        // 默认父级ID为1级
        cat_pid: 0,
        // 默认父级等级为1级
        cat_level: ''
      },
      addCateRules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: 'blur'
          }
        ]
      },
      // 接收父级列表数据
      parenCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中父级的Id的数组
      selectedKeys: [],
      editCateDialogVisible: false,
      // 接收修改分类的表单数据
      editCateForm: {
        cat_id: '',
        cat_name: '',
        cat_pid: '',
        cat_level: ''
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.querInfo })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.console.error('请求数据分类列表失败')
      } else {
        this.$message.success('请求数据列表成功')
        this.catalist = res.data.result
        this.total = res.data.total
      }
    },
    // 监听 pagesize 的改变
    handleSizeChange (newSize) {
      // 改变页码
      this.querInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听 pagenum 的改变
    handleCurrentChange (newPage) {
      this.querInfo.pagenum = newPage
      this.getCateList()
    },
    // 添加分类事件
    addCateGoods () {
      this.getParentCateList()
      // this.$http.post('categories')
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表(只需要获取两级即可，type=2)
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error('请求获取父级列表失败')
      } else {
        // this.$message.success('请求获取父级列表成功')
        this.parenCateList = res.data
        // this.editParenCateList = this.parenCateList
        console.log(this.parenCateList)
      }
    },
    // 监听父级分类ID的改变
    parentCateChanged () {
      console.log(this.selectedKeys)
      // 如果  selectedKeys 的长度大于0，则表明存在父级分类，反之，则不存在父级分类
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 点击添加分类的确定按钮触发的事件
    addCate () {
      // console.log(this.addCateForm)
      // 数据预验证
      this.$refs.addCateRef.validate(async(valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        // console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        } else {
          this.$message.success('分类添加成功')
          this.getCateList()
          this.addCateDialogVisible = false
        }
      })
    },
    // 监听对话框的关闭事件
    addCateDialogClosed () {
      this.$refs.addCateRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 查询分类信息
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('categories/' + id)
      // console.log(this.editCateForm)
      if (res.meta.status !== 200) {
        return this.$message.error('查询分类数据失败')
      } else {
        this.editCateForm = res.data
        this.editCateDialogVisible = true
        this.getCateList()
      }
    },
    // 提交分类修改
    editCate () {
      this.$refs.editCateRef.validate(async(valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put('categories/' + this.editCateForm.cat_id, this.editCateForm)
        // console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('分类名称更新失败')
        } else {
          this.getCateList()
          this.editCateDialogVisible = false
        }
      })
    },
    async removeCateById (id) {
      const confirmResult = await this.$confirm('此操作将永久删除分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        this.$message.info('已删除')
      } else {
        const { data: res } = await this.$http.delete('categories/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('分类删除失败')
        } else {
          this.$message.success('分类删除成功')
          this.getCateList()
        }
      }
    }
  }
}
</script>
<style lang="less" scoped>
.tree-table{
    margin-top: 20px;
}
.el-cascader{
    width: 100%;
}
</style>
