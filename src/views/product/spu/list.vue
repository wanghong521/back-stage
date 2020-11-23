<template>
  <div>
    <el-card>
      <CategorySelector
        :isShowList="isShowList"
        @changeCategory="changeCategory"
      ></CategorySelector>
    </el-card>

    <el-card style="margin-top: 20px">
      <!-- 列表相关 -->
      <div v-show="!isShowSpuForm && !isShowSkuForm">
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="showAddSpuForm"
          :disabled="!category3Id"
          >添加SPU</el-button
        >
        <el-table :data="spuList" border style="width: 100%">
          <el-table-column align="center" type="index" label="序号" width="80">
          </el-table-column>
          <el-table-column prop="spuName" label="SPU名称" width="width">
          </el-table-column>
          <el-table-column prop="description" label="SPU描述" width="width">
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
            <template slot-scope="{ row, $index }">
              <HintButton
                type="warning"
                size="mini"
                title="添加SKU"
                icon="el-icon-plus"
                @click="showAddSkuForm(row)"
              ></HintButton>
              <HintButton
                type="primary"
                size="mini"
                title="修改SPU"
                icon="el-icon-edit"
                @click="showUpdateSpuForm(row)"
              ></HintButton>
              <HintButton
                type="info"
                size="mini"
                title="查看SPU所有的SKU"
                icon="el-icon-info"
                @click="showSkuDialog(row)"
              ></HintButton>
              <HintButton
                type="danger"
                size="mini"
                title="删除SPU"
                @click="deleteSpu(row)"
                icon="el-icon-delete"
              ></HintButton>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          @size-change="handleSizeChange"
          @current-change="getSpuList"
          style="text-align: center"
          :pager-count="7"
          :current-page="page"
          :page-sizes="[3, 5, 10]"
          :page-size="limit"
          layout=" prev, pager, next, jumper, ->, sizes,total"
          :total="total"
        >
        </el-pagination>
      </div>
      <!-- 不合适 -->
      <!-- <SpuForm v-show="isShowSpuForm"  v-model="isShowSpuForm"></SpuForm> -->
      <!-- <SpuForm v-show="isShowSpuForm" :value="isShowSpuForm" @input="isShowSpuForm = $event"></SpuForm> -->
      <!-- 合适 -->
      <SpuForm
        v-show="isShowSpuForm"
        :visible.sync="isShowSpuForm"
        ref="spuForm"
        @successBack="successBack"
        @cancelBack="spuId = null"
      ></SpuForm>
      <!-- <SpuForm v-show="isShowSpuForm" :visible="isShowSpuForm" @update:visible="isShowSpuForm = $event"></SpuForm> -->
      <SkuForm
        v-show="isShowSkuForm"
        :visible.sync="isShowSkuForm"
        ref="skuForm"
      ></SkuForm>

      <el-dialog
        :title="`${spu.spuName}的sku列表`"
        :visible.sync="dialogTableVisible"
        :before-close="handlerCloseDialog"
      >
        <el-table border :data="skuList" v-loading="isLoading">
          <el-table-column
            property="skuName"
            label="名称"
            width="150"
          ></el-table-column>
          <el-table-column
            property="price"
            label="价格"
            width="150"
          ></el-table-column>
          <el-table-column
            property="weight"
            label="重量"
            width="150"
          ></el-table-column>
          <el-table-column label="图片">
            <template slot-scope="{ row, $index }">
              <img
                :src="row.skuDefaultImg"
                alt=""
                style="width: 100px; height: 80px"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import SpuForm from "./components/SpuForm";
import SkuForm from "./components/SkuForm";
export default {
  components: {
    SpuForm,
    SkuForm
  },
  name: "Spu",
  data() {
    return {
      isShowList: true, //控制三级分类可操作性的数据

      category1Id: "",
      category2Id: "",
      category3Id: "",
      spuList: [],
      page: 1,
      limit: 3,
      total: 0,

      //控制三个页面切换显示和隐藏的数据
      isShowSpuForm: false,
      isShowSkuForm: false,

      //显示dialog相关数据
      dialogTableVisible: false,
      spu: {},
      skuList: [],

      isLoading: false //用于使用正在加载功能的逻辑
    };
  },

  //通过监视实现三级分类的可操作行
  watch: {
    isShowSpuForm: {
      handler(newVal) {
        this.isShowList = !newVal;
      }
    },
    isShowSkuForm(newVal) {
      this.isShowList = !newVal;
    }
  },
  methods: {
    // 删除
    async deleteSpu(row) {
      try {
        const result = await this.$API.spu.remove(row.id);
        if (result.code === 200) {
          this.$message.success("删除成功");
          this.getSpuList(this.page);
        } else {
          this.$message.error("删除失败");
        }
      } catch (error) {
        this.$message.error("请求删除失败");
      }

      this.getSpuList();
    },
    //当关闭dialog的时候之前会调用这个回调
    handlerCloseDialog() {
      this.skuList = [];
      this.dialogTableVisible = false;
    },

    //点击查看spu的所有sku
    async showSkuDialog(row) {
      this.dialogTableVisible = true;
      this.spu = row;
      this.isLoading = true;
      //发请求获取row的所有sku
      const result = await this.$API.sku.getListBySpuId(row.id);
      if (result.code === 200) {
        console.log(111);
        this.skuList = result.data;
      }
      this.isLoading = false;
    },

    //子组件保存成功返回的事件回调
    successBack() {
      //是添加回来的还是修改回来
      if (this.spuId) {
        //修改回来的 重新获取列表数据并停留在当前页
        this.getSpuList(this.page);
      } else {
        //添加回来的 重新获取列表数据
        this.getSpuList();
      }
      this.$refs.spuForm.resetData();
      this.spuId = null; //重置标志数据
    },

    changeCategory({ categoryId, level }) {
      if (level === 1) {
        this.category2Id = "";
        this.category3Id = "";
        this.spuList = [];
        this.category1Id = categoryId;
      } else if (level === 2) {
        this.category3Id = "";
        this.spuList = [];
        this.category2Id = categoryId;
      } else {
        this.category3Id = categoryId;
        this.getSpuList();
      }
    },

    //请求获取spu列表数据
    async getSpuList(page = 1) {
      this.page = page;
      try {
        const result = await this.$API.spu.getList(
          this.page,
          this.limit,
          this.category3Id
        );
        if (result.code === 200) {
          this.spuList = result.data.records;
          this.total = result.data.total;
        } else {
          this.$message.error("获取spu列表失败");
        }
      } catch (error) {
        this.$message.error("请求获取spu列表失败");
      }
    },

    handleSizeChange(size) {
      this.limit = size;
      this.getSpuList();
    },

    //点击添加Spu按钮
    showAddSpuForm() {
      this.isShowSpuForm = true;
      this.$refs.spuForm.initAddSpuFormData(this.category3Id);
    },
    //点击修改Spu按钮
    showUpdateSpuForm(row) {
      this.spuId = row.id; //就只是为了让父组件可以判断是添加返回还是修改返回的一个标识
      this.isShowSpuForm = true;
      this.$refs.spuForm.initUpdateSpuFormData(row, this.category3Id);
    },
    //点击添加Sku按钮
    showAddSkuForm(row) {
      this.isShowSkuForm = true;
      this.$refs.skuForm.initAddSkuFormData(
        row,
        this.category1Id,
        this.category2Id
      );
    }
  }
};
</script>
