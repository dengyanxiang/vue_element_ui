<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item><a href="/">权限管理</a></el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
                </el-col>
            </el-row>
            <!-- 数据列表视图 -->
            <el-table :data="roleList" border stripe>
                <!-- 展开列 -->
                <el-table-column type="expand">
                  <template slot-scope="scope">
                    <el-row :class="['bdbotton', i1 === 0 ? 'bdtop': '', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
                      <!-- 存放一级权限  一列占用5个占位符-->
                      <el-col :span="5">
                        <el-tag closable @close="removeRightById(scope.row,item1.id)">
                          {{item1.authName}}
                        </el-tag>
                        <i class="el-icon-caret-right"></i>
                      </el-col>
                      <!-- 存放二级权限 -->
                      <el-col :span="19">
                        <!-- 通过for循环遍历二级权限 -->
                        <el-row :class="[ i2 === 0 ? '':'bdtop','vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                          <el-col :span="8">
                            <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                            <i class="el-icon-caret-right"></i>
                          </el-col>
                          <!-- 存放三级权限 -->
                          <el-col :span="16">
                            <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id" closable @close="removeRightById(scope.row,item3.id)">
                              {{item3.authName}}
                            </el-tag>
                          </el-col>
                        </el-row>
                      </el-col>
                    </el-row>
                  </template>
                </el-table-column>
                <!-- 索引列  prop="roleName"挂载数据-->
                <el-table-column type="index"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作" width="300px">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRolesById(scope.row.id)">删除</el-button>
                        <el-button type="warning" icon="el-icon-edit" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <!-- 点击添加用户角色对话框 -->
        <el-dialog
            title="点击添加用户角色"
            :visible.sync="addDialogVisible"
            width="50%"
           >
            <!-- 添加用户角色信息 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="addForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary"  @click="addRoles" >确 定</el-button>
            </span>
        </el-dialog>
        <!-- 点击修改用户信息对话框-->
        <el-dialog
        title="请输入用户修改信息"
        :visible.sync="editDialogVisible"
        width="50%"
        >
         <el-form :model="editForm"  ref="editFormRef" label-width="80px">
           <el-form-item label="角色名称">
             <el-input v-model="editForm.roleName"></el-input>
           </el-form-item>
            <el-form-item label="角色描述">
             <el-input v-model="editForm.roleDesc"></el-input>
           </el-form-item>
         </el-form>
         <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary"  @click="editRoles" >确 定</el-button>
         </span>
      </el-dialog>
      <!-- 展示权限分配对话框 -->
      <el-dialog
        title="提示"
        :visible.sync="setRightDialogVisible"
        width="50%"
        @close="setRightDialogClosed"
        >
        <!-- node-key="id" 表示选中树形控件中的ID值 -->
          <el-tree ref="treeRef" :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defalutKey"></el-tree>
          <span slot="footer" class="dialog-footer">
            <el-button @click="setRightDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="allowRight">确 定</el-button>
          </span>
      </el-dialog>
    </div>
</template>
<script>
export default {
  data () {
    return {
      // 所有角色列表
      roleList: [],
      // 对话框的隐藏和现实
      addDialogVisible: false,
      // 用于接收增加用户角色
      addForm: {
        roleId: '',
        roleName: '',
        roleDesc: ''
      },
      // 验证添加用户规则
      addFormRules: {
        roleName: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          {
            required: false,
            trigger: 'blur'
          }
        ]
      },
      // 修改用户对话框的现实与隐藏
      editDialogVisible: false,
      // 用于接收数据修改的表单数据
      editForm: {
        roleId: '',
        roleName: '',
        roleDesc: ''
      },
      // 展示权限分配对话框的现实与隐藏
      setRightDialogVisible: false,
      // 所有权限列表
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的ID值的数组
      defalutKey: [],
      roleId: ''
    }
  },
  created () {
    //   获取角色信息
    this.getRolesList()
  },
  methods: {
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.console.error('请求用户角色失败')
      } else {
        this.roleList = res.data
        // console.log(this.roleList)
      }
    },
    // 添加角色
    addRoles () {
      // 进行数据的预言证
      this.$refs.addFormRef.validate(async(valid) => {
        // console.log(valid)
        // 如果验证失败则返回，否则发送真正的网络请求
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户角色失败')
        } else {
          this.$message.success('添加用户角色成功')
          this.addForm = res.data
          // 关闭添加用户角色弹框
          this.addDialogVisible = false
          // 刷新用户列表重新获取数据
          this.getRolesList()
        }
      })
    },
    // 查询用户角色信息
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('roles/' + id)
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户角色信息失败')
      } else {
        this.editForm = res.data
      }
      this.editDialogVisible = true
    },
    // 添加用户角色
    editRoles () {
      // 数据预言证
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put('roles/' + this.editForm.roleId, this.editForm)
        if (res.meta.status !== 200) {
          return this.$message.error('添加用户角色失败')
        } else {
          this.$message.success('添加用户成功')
          // 关闭添加用户角色对话框
          this.editDialogVisible = false
          // 重新加载用户角色列表
          this.getRolesList()
        }
      })
    },
    // 通过ID删除用户角色
    async removeRolesById (id) {
      // const { data: res } = await  this.$http.delete('roles/' + this.addForm.roleId)
      const confirmResult = await this.$confirm('此操作将永久删除用户角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err) // 输出cancel字符串
      // console.log(confirmResult) // 输出confirm字符串
      if (confirmResult !== 'confirm') {
        this.$message.info('已取消删除')
      } else {
        const { data: res } = await this.$http.delete('roles/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('用户信息删除失败')
        } else {
          this.$message.success('用户信息删除成功')
          // 重新加载数据列表
          this.getRolesList()
        }
      }
    },
    // 根据指定的ID删除用户权限
    async removeRightById (role, rightId) {
      // 弹框提示用户是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err) // 输入cancel字符串
      if (confirmResult !== 'confirm') {
        return this.$message.error('已取消删除')
      } else {
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if (res.meta.status !== 200) {
          return this.$message.err('取消权限失败')
        } else {
          // this.getRolesList() 会造成页面重新渲染关闭权限列表
          role.children = res.data
        }
      }
    },
    // 展示分配权限的对话框
    async showSetRightDialog (role) {
      this.roleId = role.id
      // 获取所有权限数据
      const { data: res } = await this.$http.get('rights/tree')
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户权限失败')
      } else {
        // 把获取到的所有权限存放到rightsList数组中
        this.rightsList = res.data
        // 递归方式获取三级节点ID
        this.getLeafKey(role, this.defalutKey)
        this.setRightDialogVisible = true
        // console.log(this.rightsList)
      }
    },
    // 通过递归的方式获取所有角色下的三级权限的ID，并将ID保存到defalutKey数组中
    getLeafKey (node, arr) {
      if (!node.children) { // 判断是否存在子节点children
        return arr.push(node.id)
      } else {
        node.children.forEach(item => {
          this.getLeafKey(item, arr)
        })
      }
    },
    setRightDialogClosed () {
      this.defalutKey = [] // 重置数组数据，以防数据堆砌
    },
    async allowRight () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',') // 数组以英文字符串拼接
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('权限分配失败')
      } else {
        this.$message.success('权限分配成功')
        this.getRolesList()
        this.setRightDialogVisible = false
      }
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag{
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee
}
.bdbotton {
  border-bottom: 1px solid #eee;
}
.vcenter{
  display: flex;
  align-items: center;
}
</style>
