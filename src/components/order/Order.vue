<template>
    <div>
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item><a href="/">订单管理</a></el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-row :gutter="20">
                <el-col :span="7">
                    <el-input placeholder="请输入内容" clearable >
                        <el-button slot="append" icon="el-icon-search" ></el-button>
                    </el-input>
                </el-col>
            </el-row>
            <el-table :data="orderList" border stripe>
                    <el-table-column type="index"></el-table-column>
                    <el-table-column label="订单编号" prop="order_number"></el-table-column>
                    <el-table-column label="订单价格" prop="order_price"></el-table-column>
                    <el-table-column label="是否付款" prop="pay_status">
                        <template slot-scope="scope">
                            <el-tag v-if="scope.row.pay_status === '1'" type="success"> 已付款</el-tag>
                            <el-tag v-else type="warning">未付款</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="是否发货" prop="is_send"></el-table-column>
                    <el-table-column label="下单时间" prop="create_time">
                        <template slot-scope="scope">
                            {{scope.row.create_time | dateFormat}}
                        </template>
                    </el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button type="primary" size="mini" icon="el-icon-edit" @click="editOrder(scope.row.order_id)">
                            </el-button>
                            <el-button type="success" size="mini" icon="el-icon-location" @click="showProgressBox"></el-button>
                        </template>
                    </el-table-column>
            </el-table>
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[1, 5, 7, 9]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total" background>
            </el-pagination>
        </el-card>
        <!-- 修改信息的弹出框 -->
        <el-dialog
        title="请修改地址："
        :visible.sync="editDialogVisible"
        width="50%"
        @close="addressDialogClose"
        >
        <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
            <el-form-item label="省市区/县" prop="address1">
                           <!-- :props="cateProps":级联选择器的配置项 -->
                           <!-- v-model="addForm.goods_cat": 绑定索引项 -->
                           <el-cascader
                            width="100%"
                            expanded-trigger="hover"
                            :options="citydate"
                            :props="addressProps"
                            v-model="addressForm.address1"
                            ></el-cascader>
            </el-form-item>
            <el-form-item label="详细地址：" prop="address2">
                <el-input v-model="addressForm.address2"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editDialogVisible = false">确 定</el-button>
        </span>
        </el-dialog>
        <!-- 查询快递物流对话框 -->
        <el-dialog
        title="请输入订单编号"
        :visible.sync="progressVisible"
        width="50%"
        >
            <span>这是一段信息</span>
        </el-dialog>
    </div>
</template>
<script>
import cityDate from './citydata'
export default {
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      orderList: [],
      total: 0,
      editDialogVisible: false,
      addressForm: {
        address1: [],
        address2: ''
      },
      addressFormRules: {
        address1: [
          {
            required: true,
            message: '请选定省市区/县:',
            trigger: 'blur'
          }
        ],
        address2: [
          {
            required: true,
            message: '请输入详细地址:',
            trigger: 'blur'
          }
        ]
      },
      citydate: cityDate,
      addressProps: {
        value: 'value',
        label: 'label',
        children: 'children'
      },
      progressVisible: false,
      progressInfo: []
    }
  },
  created () {
    this.getOrderList()
  },
  methods: {
    async getOrderList () {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        this.$message.console.error('数据订单请求失败')
      } else {
        this.$message.success('数据订单请求成功')
        this.total = res.data.total
        this.orderList = res.data.goods
        console.log(this.orderList)
      }
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    editOrder () {
      this.editDialogVisible = true
    },
    addressDialogClose () {
      this.$refs.addressFormRef.resetFields()
    },
    async showProgressBox () {
    //   const { data: res } = await this.$http.get('/kuaidi/1106975712662')
    //   if (res.meta.status !== 200) {
    //     return this.$message.error('快递进度查询失败！')
    //   } else {
    //     this.$message.success('快递进度查询成功！')
    //     this.progressInfo = res.data
    //     // console.log(this.progressInfo)
    //     // this.progressVisible = true
    //   }
      this.progressVisible = true
    }
  }
}
</script>
<style lang="less" scoped>
.el-cascader{
    width: 100%;
}
</style>
