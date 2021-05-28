<template>
    <div>
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item><a href="/">用户管理</a></el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-row :gutter="20">
                <el-col :span="7">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
                </el-col>
            </el-row>
            <!-- 用户列表页 -->
            <el-table :data="userList" border stripe>
              <!-- 添加索引列 -->
              <el-table-column type="index"></el-table-column>
              <el-table-column label="姓名" prop="username"></el-table-column>
              <el-table-column label="邮箱" prop="email"></el-table-column>
              <el-table-column label="电话" prop="mobile"></el-table-column>
              <el-table-column label="角色" prop="role_name"></el-table-column>
              <el-table-column label="状态">
                <!-- slot-scope="scope" 用于接收作用域数据  scope.row用于获取单元格一行的内容-->
                <template slot-scope="scope">
                  <el-switch v-model="scope.row.mg_status" @change="userStatusChange(scope.row)"></el-switch>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="180px">
                <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
                  <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
                      <el-tooltip  effect="dark" content="分配角色" placement="top" :enterable="false">
                         <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
                      </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
            <!-- 分页效果显示 -->
             <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="queryInfo.pagenum"
              :page-sizes="[1, 2, 3, 9]"
              :page-size="queryInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
            </el-pagination>
        </el-card>
        <!-- 添加用户对话框 -->
        <el-dialog
          title="添加用户"
          :visible.sync="addDialogVisible"
          width="50%"
          @close="addDialogClose"
          >
          <!-- prop用数据验证规则  -->
          <el-form :model="addeForm" :rules="addeFormRules" ref="addFormRef" label-width="70px">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="addeForm.username"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="addeForm.password"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="addeForm.email"></el-input>
            </el-form-item>
            <el-form-item label="手机" prop="mobile">
              <el-input v-model="addeForm.mobile"></el-input>
            </el-form-item>
         </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addUser">确 定</el-button>
          </span>
        </el-dialog>
        <!-- 修改用户信息对话框 -->
        <el-dialog
        title="修改用户资料"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed"
        >
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email" ></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="editForm.mobile" ></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>
<script>
export default {
  data () {
    // 验证邮箱规则
    var checkEmail = (rule, value, callback) => {
      // 验证邮箱的正则表达式
      const regEmile = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmile.test(value)) {
        // 合法的邮箱
        return callback()
      } else {
        callback(new Error('邮箱验证失败'))
      }
    }
    // 验证手机号的规则
    var checkPhone = (rule, value, callback) => {
      // 验证手机号码的正则表达式
      const regPhone = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regPhone.test(value)) {
        return callback()
      } else {
        callback(new Error('手机号验证失败'))
      }
    }
    return {
      // 存放请求参数列表
      queryInfo: {
        query: '',
        // 当前页码
        pagenum: 1,
        pagesize: 2
      },
      userList: [],
      total: 0,
      // 对话框的隐藏与显示
      addDialogVisible: false,
      // 添加用户表单数据
      addeForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addeFormRules: {
        username: [
          {
            required: true,
            message: '请输入用户名称',
            trigger: 'blur'
          }, {
            min: 3,
            max: 10,
            message: '用户名的长度在3-10个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: '请输入用户密码',
            trigger: 'blur'
          }, {
            min: 3,
            max: 12,
            message: '密码长度为3-12个字符',
            trigger: 'blur'
          }
        ],
        email: [
          {
            required: true,
            message: '请输入用户邮箱',
            trigger: 'blur'
          }, {
            validator: checkEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: '请输入用户手机号码',
            trigger: 'blur'
          }, {
            validator: checkPhone,
            trigger: 'blur'
          }
        ]
      },
      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      // 查询用户信息表单
      editForm: {
        id: '',
        email: '',
        mobile: ''
      },
      // 修改用户信息验证规则
      editFormRules: {
        email: [
          {
            required: true,
            message: '请输入正确的邮箱格式',
            trigger: 'blur'
          }, {
            validator: checkEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: '请输入正确的手机号',
            trigger: 'blur'
          }, {
            validator: checkPhone,
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    async getUserList () {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      } else {
        this.userList = res.data.users
        this.total = res.data.total
      }
    },
    // 监听用户状态事件
    async userStatusChange (userInfo) {
      // console.log(userInfo)
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_status}`)
      console.log(res)
      if (res.meta.status !== 200) {
        // 对用户状态进行取反
        userInfo.mg_status = !userInfo.mg_status
        return this.$message.error('更新用户状态失败')
      } else {
        this.$message.success('更新用户状态成功')
      }
    },
    // 监听数据分页的时间
    handleSizeChange (newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      // 重新获取数据列表数据
      this.getUserList()
    },
    // 监听页码值改变的事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 关闭对话框重置表单数据,清空表单数据
    addDialogClose () {
      // 通过ref进行调用resetFields()方法进行表单数据的清空
      this.$refs.addFormRef.resetFields()
    },
    addUser () {
      // 进行数据的预验证
      this.$refs.addFormRef.validate(async (valid) => {
        console.log(valid)
        // 如果验证失败则返回,否则发送真正的网络请求
        if (!valid) return
        const { data: res } = await this.$http.post('users', this.addeForm)
        if (res.meta.status !== 201) {
          this.$message.error('用户创建失败')
        } else {
          this.$message.success('用户创建成功')
          // 把添加对话框隐藏
          this.addDialogVisible = false
          // 刷新用户列表,重新获取数据
          this.getUserList()
        }
      })
    },
    // 修改用户信息事件
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('users/' + id)
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('请求用户查询信息失败')
      } else {
        this.editForm = res.data
      }
      this.editDialogVisible = true
    },
    // 监听修改用户信息的关闭事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息并提交
    editUserInfo () {
      // 进行数据的预验证
      this.$refs.editFormRef.validate(async(valid) => {
        console.log(valid)
        if (!valid) return
        const { data: res } = await this.$http.put('users/' + this.editForm.id, this.editForm)
        // console.log(res)
        if (res.meta.status !== 200) {
          return this.$http.error('用户更新数据失败!')
        } else {
          this.$message.success('用户更新数据成功')
          // 把添加对话框隐藏
          this.editDialogVisible = false
          // 刷新用户列表，重新获取数据
          this.getUserList()
        }
      })
    },
    // 用户删除信息的弹出框
    async removeUserById (id) {
      // 提示用户是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err) // 输出cancel字符串
      // console.log(confirmResult) // 输出confirm字符串
      if (confirmResult !== 'confirm') {
        this.$message.info('已取消删除')
      } else {
        // console.log(confirmResult)
        const { data: res } = await this.$http.delete('users/' + id)
        // console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('删除用户失败')
        } else {
          this.$message.success('用户删除成功')
          // 重新更新数据列表
          this.getUserList()
        }
      }
    }
  }
}
</script>
<style lang="less" scoped>

</style>
