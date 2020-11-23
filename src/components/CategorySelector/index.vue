<template>
  <div>
    <el-form
      :inline="true"
      :model="cForm"
      class="demo-form-inline"
      :disabled="!isShowList"
    >
      <el-form-item label="一级分类">
        <el-select
          v-model="cForm.category1Id"
          @change="handlerCategory1"
          placeholder="请选择"
        >
          <el-option
            :label="c1.name"
            :value="c1.id"
            v-for="(c1, index) in category1List"
            :key="c1.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="二级分类">
        <el-select
          v-model="cForm.category2Id"
          @change="handlerCategory2"
          placeholder="请选择"
        >
          <el-option
            :label="c2.name"
            :value="c2.id"
            v-for="(c2, index) in category2List"
            :key="c2.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="三级分类">
        <el-select
          v-model="cForm.category3Id"
          @change="handlerCategory3"
          placeholder="请选择"
        >
          <el-option
            :label="c3.name"
            :value="c3.id"
            v-for="(c3, index) in category3List"
            :key="c3.id"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "",
  props: ["isShowList"],
  data() {
    return {
      cForm: {
        category1Id: "",
        category2Id: "",
        category3Id: ""
      },
      category1List: [],
      category2List: [],
      category3List: []
    };
  },
  mounted() {
    this.getCategory1List(); //获取1级分类列表
  },
  methods: {
    async getCategory1List() {
      try {
        const result = await this.$API.category.getCategorys1();
        if (result.code === 200) {
          this.category1List = result.data;
        }
      } catch (error) {
        this.$message.error("获取一级分类失败");
      }
    },

    // 选中1级分类  请求获取对应的2级分类
    async handlerCategory1(category1Id) {
      // 点击1级分类 清空2 3 级分类的列表和收集的id
      this.cForm.category2Id = "";
      this.cForm.category3Id = "";
      this.category2List = [];
      this.category3List = [];

      this.$emit("changeCategory", { categoryId: category1Id, level: 1 });

      try {
        const result = await this.$API.category.getCategorys2(category1Id);
        if (result.code === 200) {
          this.category2List = result.data;
        }
      } catch (error) {
        this.$message.error("获取二级分类失败");
      }
    },

    // 选中2级分类  请求获取对应的3级分类
    async handlerCategory2(category2Id) {
      // 点击2级分类 清空3 级分类的列表和收集的id

      this.cForm.category3Id = "";

      this.category3List = [];

      this.$emit("changeCategory", { categoryId: category2Id, level: 2 });

      try {
        const result = await this.$API.category.getCategorys3(category2Id);
        if (result.code === 200) {
          this.category3List = result.data;
        }
      } catch (error) {
        this.$message.error("获取三级分类失败");
      }
    },

    // 选中三级分类
    handlerCategory3(category3Id) {
      this.$emit("changeCategory", { categoryId: category3Id, level: 3 });
    }
  }
};
</script>

<style lang="less" scoped></style>
