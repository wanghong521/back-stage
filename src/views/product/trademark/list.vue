<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" @click="showAddDialog"
      >添加</el-button
    >

    <!-- 
        1、找相似复制
        2、删除所有数据相关的
        3、修改每一个列的名称 宽度 对齐方式
    -->
    <!-- table每个列内部都暗含了一个vfor 每个列内部都传递了这个data数据trademarkList进行展示-->
    <el-table style="width: 100%; margin: 20px 0" border :data="trademarkList">
      <el-table-column
        label="序号"
        type="index"
        width="80"
        align="center"
      ></el-table-column>

      <el-table-column label="品牌名称" prop="tmName"> </el-table-column>

      <el-table-column label="品牌LOGO">
        <template slot-scope="{ row, $index }">
          <img :src="row.logoUrl" alt="" style="width: 100px; height: 60px" />
        </template>
      </el-table-column>

      <el-table-column label="操作">
        <template slot-scope="{ row, $index }">
          <el-button
            type="warning"
            icon="el-icon-edit"
            size="mini"
            @click="showUpdateDialog(row)"
            >修改</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteTrademark(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      style="text-align: center"
      :page-sizes="[3, 5, 10]"
      :current-page="page"
      :page-size="limit"
      :total="total"
      :pager-count="7"
      layout=" prev, pager, next, jumper,->,sizes,total"
      @current-change="getTrademarkList"
      @size-change="handleSizeChange"
    >
    </el-pagination>

    <!-- dialog对话框 用于增加和修改的组件 -->

    <el-dialog
      :title="tmForm.id ? '修改品牌' : '添加品牌'"
      :visible.sync="isShowDialog"
    >
      <!-- 只要是form，一般都会有一个属性:model="form" 这个属性值要求必须是一个对象，这个对象是用来收集数据的-->
      <el-form :model="tmForm" style="width: 80%" :rules="rules" ref="tmForm">
        <el-form-item label="品牌名称" label-width="100px" prop="tmName">
          <el-input v-model="tmForm.tmName" autocomplete="off"></el-input>
        </el-form-item>

        <!-- POST /admin/product/fileUpload -->
        <el-form-item label="品牌LOGO" label-width="100px" prop="logoUrl">
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="tmForm.logoUrl" :src="tmForm.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div class="el-upload__tip" slot="tip">
              只能上传jpg/png文件，且不超过500kb
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isShowDialog = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdateTrademark"
          >确 定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
// function validateTmNameLen(rule, value, callback) {
//   if (value.length < 2 || value.length > 10) {
//     callback(new Error("长度只能是 2-10"));
//   } else {
//     callback();
//   }
// }
export default {
  name: "Trademark",
  data() {
    // callback  如果传参数代表失败  如果什么不传代表成功
    var validateTmNameLen = (rule, value, callback) => {
      if (value.length < 2 || value.length > 10) {
        callback(new Error("长度只能是 2-10"));
      } else {
        callback();
      }
    };

    return {
      page: 1,
      limit: 3,
      trademarkList: [],
      total: 0,

      isShowDialog: false,

      tmForm: {
        tmName: "",
        logoUrl: ""
      }, //收集数据要收集的地方
      // imageUrl: '' // upload官方给的测试数据
      rules: {
        tmName: [
          { required: true, message: "请输入品牌名称", trigger: "blur" },
          // {
          //   min: 2,
          //   max: 20,
          //   message: "长度在 2 到 20 个字符",
          //   trigger: "change",
          // },
          { validator: validateTmNameLen, trigger: "change" }
        ],
        logoUrl: [
          { required: true, message: "请上传LOGO图片", trigger: "change" } //上传的时候触发时机只能是整体验证的时候
        ]
      }
    };
  },
  mounted() {
    this.getTrademarkList();
  },
  methods: {
    // validateTmNameLen:(rule, value, callback) => {
    //   if(value.length < 2 || value.length > 10){
    //     callback(new Error('长度只能是 2-10'))
    //   }else{
    //     callback()
    //   }
    // },

    async getTrademarkList(page = 1) {
      this.page = page;
      try {
        const result = await this.$API.trademark.getPageList(
          this.page,
          this.limit
        );
        if (result.code === 200) {
          this.trademarkList = result.data.records;
          this.total = result.data.total;
        }
      } catch (error) {
        this.$message.error("获取品牌列表失败");
      }
    },

    // changeNum(page){
    //   this.page = page
    //   this.getTrademarkList()
    // }

    //处理更改每页个数的回调
    handleSizeChange(size) {
      // size代表修改每页数量  子组件传递给父组件的每页个数
      this.limit = size;
      this.getTrademarkList();
    },

    //上传成功后的回调  在这个回调函数当中收集上传成功图片的在线路径
    handleAvatarSuccess(res, file) {
      // this.imageUrl = URL.createObjectURL(file.raw);  收集的是本地的图片路径
      // console.log( this.imageUrl,res)
      this.tmForm.logoUrl = res.data;
    },

    //上传之前对上传图片做的限定，如果不符合要求会提示信息，但是不能阻止上传
    beforeAvatarUpload(file) {
      let typeArr = ["image/jpeg", "image/png"];
      const isJPGOrPNG = typeArr.indexOf(file.type) !== -1;
      const isLt500K = file.size / 1024 < 500;

      if (!isJPGOrPNG) {
        this.$message.error("上传头像图片只能是 JPG 格式!");
      }
      if (!isLt500K) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isJPGOrPNG && isLt500K;
    },

    //点击显示添加的dialog
    showAddDialog() {
      this.isShowDialog = true;
      //每次打开dialog清空数据
      this.tmForm = {
        tmName: "",
        logoUrl: ""
      };
    },

    //点击修改显示修改的dialog
    showUpdateDialog(row) {
      this.isShowDialog = true;
      this.tmForm = { ...row }; //浅拷贝
    },

    addOrUpdateTrademark() {
      //点击确定后整体验证通过再去发请求，不通过没有任何操作
      this.$refs.tmForm.validate(async valid => {
        if (valid) {
          //获取参数
          let trademark = this.tmForm;
          // 发请求
          //成功干啥失败干啥
          try {
            //不管是添加还是修改最终都是调用addOrUpdate(trademark)
            const result = await this.$API.trademark.addOrUpdate(trademark);
            //提示
            this.$message.success(
              trademark.id ? "修改品牌成功" : "添加品牌成功"
            );
            //关闭对话框
            this.isShowDialog = false;
            //重新获取列表数据  默认添加是放在最后一页的，重新请求之后停留在第一页
            //修改  重新请求数据之后 停留在当前页
            this.getTrademarkList(trademark.id ? this.page : 1);
          } catch (error) {
            this.$message.error(trademark.id ? "修改品牌失败" : "添加品牌失败");
          }
        } else {
          return false; //没有后续操作
        }
      });
    },

    deleteTrademark(row) {
      this.$confirm(`您确定删除${row.tmName}吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          try {
            const result = await this.$API.trademark.delete(row.id);
            this.$message({
              type: "success",
              message: "删除成功!"
            });
            //删除如果当前页只有一条，那么删除完成回到前一页，否则就停留在当前页
            this.getTrademarkList(
              this.trademarkList.length > 1 ? this.page : this.page - 1
            );
          } catch (error) {
            this.$message.error("删除失败");
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    }
  }
};
</script>

<style>
/* 不能带scoped 带了upload就没样式了*/
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
