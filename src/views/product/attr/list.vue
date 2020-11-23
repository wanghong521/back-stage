<template>
  <div>
    <el-card>
      <CategorySelector
        @changeCategory="changeCategory"
        :isShowList="isShowList"
      ></CategorySelector>
    </el-card>

    <el-card style="margin-top: 20px">
      <!-- 列表页面 -->
      <div v-show="isShowList">
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="showAddDiv"
          :disabled="!category3Id"
          >添加属性</el-button
        >
        <el-table :data="attrList" border style="width: 100%">
          <el-table-column type="index" label="序号" width="80" align="center">
          </el-table-column>
          <el-table-column
            prop="attrName"
            label="属性名称"
            width="150"
            align="center"
          >
          </el-table-column>
          <el-table-column prop="prop" label="属性值列表" align="center">
            <template slot-scope="{ row, $index }">
              <el-tag
                type="success"
                v-for="(arrtValue, index) in row.attrValueList"
                :key="arrtValue.id"
                >{{ arrtValue.valueName }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="150" align="center">
            <template slot-scope="{ row, $index }">
              <HintButton
                type="warning"
                icon="el-icon-edit"
                title="修改属性"
                size="mini"
                @click="showUpdateDiv(row)"
              ></HintButton>
              <el-popconfirm
                :title="`你确定是删除${row.attrName}吗`"
                @onConfirm="deleteAttr(row)"
              >
                <HintButton
                  slot="reference"
                  type="danger"
                  icon="el-icon-delete"
                  title="删除属性"
                  size="mini"
                ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 添加和修改的页面 -->
      <div v-show="!isShowList">
        <el-form :inline="true" :model="attrForm" ref="form">
          <el-form-item label="属性名">
            <el-input
              v-model="attrForm.attrName"
              placeholder="请输入属性名"
            ></el-input>
          </el-form-item>
        </el-form>
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!attrForm.attrName"
          @click="addAttrValue"
          >添加属性值</el-button
        >

        <el-button @click="isShowList">取消</el-button>
        <el-table
          border
          :data="attrForm.attrValueList"
          style="width: 100%; margin: 20px 0"
        >
          <el-table-column align="center" type="index" label="序号" width="80">
          </el-table-column>
          <el-table-column
            align="center"
            prop="prop"
            label="属性值名称"
            width="width"
          >
            <template slot-scope="{ row, $index }">
              <el-input
                v-model="row.valueName"
                placeholder="请输入属性值名称"
                :ref="$index"
                v-if="row.isEdit"
                @blur="toLook(row)"
                @keyup.enter.native="toLook(row)"
                size="mini"
              ></el-input>
              <span
                v-else
                @click="toEdit(row, $index)"
                style="display: inline-block; width: 100%; height: 100%"
                >{{ row.valueName }}</span
              >
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            prop="prop"
            label="操作"
            width="width"
          >
            <template slot-scope="{ row, $index }">
              <!-- 气泡确认框用在按钮身上 -->
              <!-- @onConfirm事件名称必须是onConfirm  官网上少了个on -->
              <el-popconfirm
                :title="`你确定要删除${row.valueName}吗`"
                @onConfirm="attrForm.attrValueList.splice($index, 1)"
              >
                <HintButton
                  slot="reference"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  title="删除属性值"
                ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-button
          type="primary"
          :disabled="attrForm.attrValueList.length === 0"
          @click="addOrUpdateAttr"
          >保存</el-button
        >
        <el-button @click="isShowList">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import cloneDeep from "lodash/cloneDeep";
export default {
  name: "Attr",
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",
      attrList: [],

      isShowList: true,

      attrForm: {
        attrName: "",
        attrValueList: [],
        categoryId: "",
        categoryLevel: 3
      }
    };
  },

  methods: {
    changeCategory({ categoryId, level }) {
      if (level === 1) {
        this.category1Id = categoryId;
        // 重新选中1级分类 ，那么父组件当中要清空23级id机属性列表
        this.category2Id = "";
        this.category3Id = "";
        this.attrList = [];
      } else if (level === 2) {
        this.category2Id = categoryId;
        //重新选择2级分类，那么父组件当中要清空3级id及属性列表
        this.category3Id = "";
        this.attrList = [];
      } else {
        this.category3Id = categoryId;
        // 点完三级分类需要发送请求获取属性列表数据展示
        this.getAttrList();
      }
    },

    //  发请求获取属性列表
    async getAttrList() {
      let { category1Id, category2Id, category3Id } = this;
      try {
        const result = await this.$API.attr.getList(
          category1Id,
          category2Id,
          category3Id
        );
        if (result.code === 200) {
          this.attrList = result.data;
        } else {
          this.$message.error("获取属性列表失败");
        }
      } catch (error) {
        this.$message.error("获取属性列表失败");
      }
    },

    // 点击添加属性的按钮
    showAddDiv() {
      this.isShowList = false;
      this.attrForm = {
        attrName: "",
        attrValueList: [
          // {
          //   id:0,
          //   attrId: 0,
          //   valueName: "string",
          // },
        ],
        categoryId: this.category3Id, //这个属性只能在这里赋值  不能在data当中直接赋值 ，因为data当中谁先谁后不确定
        categoryLevel: 3
      };
    },

    // 点击修改属性的按钮
    showUpdateDiv(row) {
      this.isShowList = false;
      // this.attrForm = {...row}  浅拷贝可以搞定属性名 但是搞不定属性值 属性名是基本值
      // 属性值是在数组当中 而数组是对象数据  浅拷贝拷贝的还是row当中数组对的地址
      this.attrForm = cloneDeep(row);

      this.attrForm.attrValueList.forEach(item => {
        // item.isEdit = false   代表修改属性当中已经存在的属性值对象添加查看的标识
        this.$set(item, "isEdit", false); //对于后期添加的新属性，那么要这么添加才是响应式数据
      });
    },

    // 点击添加属性值的按钮
    addAttrValue() {
      this.attrForm.attrValueList.push(
        // 这个对象是准备收集的属性值，只不过现在没有用户输入数据，只是占位
        // 添加这个对象是为了显示一个输入框去收集这个对象
        {
          attrId: this.attrForm.id, //属性值所属属性的id  也就是attrForm的id
          valueName: "",
          isEdit: true //代表新添加的属性值对象当中编辑查看标识数据是编辑模式
        }
      );
      // 新添加一个属性值，就牵扯到新添加了一个input，最近新添加的input需要自动获取焦点
      this.$nextTick(() => {
        this.$refs[this.attrForm.attrValueList.length - 1].focus();
      });
    },

    // 点击span切换为编辑模式
    toEdit(row, index) {
      row.isEdit = true;
      // 上面那行赋值很快，一旦值变化页面要去创建dom元素。但是创建dom是比较慢的
      // 而下面代码是不会等待dom结束
      // this.$refs[index].focus()   放在外面是不行的，因为input还不存在
      this.$nextTick(() => {
        // 添加自动获取焦点的逻辑
        thisl.$refs[index].focus();
      });
    },

    // input 失去焦点或者键盘抬起切换为查看模式
    toLook(row) {
      // 变为查看模式之前对输入的数据进行验证
      // 1 。 输入的数据必须有值
      if (row.valueName.trim() === "") {
        this.$message.warning("输入的数据不能为空");
        row.valueName = "";
        return;
      }
      // 2。输入的数据除了自身以为，其他不能有相同
      // let isRepeat = this.attrForm.attrValueList.some(item=>item.valueName === row.valueName)
      // 这样不行，因为遍历的数据当中包含自身，那么永远是true
      let isRepeat = this.attrForm.attrValueList.some(item => {
        if (row !== item) {
          return item.valueName === row.valueName;
        }
        row.isEdit = false;
      });
    },

    // 保存属性
    async addOrUpdateAttr() {
      // 拿参数
      let attr = this.attrForm;
      // 整理参数
      // 1.如果属性值没有值  那就是空串，删除这个对象
      // 2.去除参数中多余的参数，比如自己加的isEdit
      // 3.如果属性当中属性值列表没有属性值对象  不发请求
      attr.attrValueList = attr.attrValueList.filter(item => {
        if (item.valueName !== "") {
          delete item.isEdit;
          return true;
        }
      });

      if (attr.attrValueList.length === 0) {
        this.$message.warning("属性值必须有内容");
        return;
      }

      // 发请求
      try {
        const result = await this.$API.attr.addOrUpdate(attr);
        if (result.code === 200) {
          this.$message.success("添加或者修改属性成功");
          // 回到哪
          this.isShowList = true;
          // 回去以后数据要不要重新获取
          this.getAttrList();
        } else {
          this.$message.error("添加或者修改属性失败");
        }
      } catch (error) {
        this.$$message.error("请求添加或者修改属性失败");
      }
    },

    // 删除属性
    async deleteAttr(row) {
      try {
        const result = await this.$API.attr.delete(row.id);
        if (result.code === 200) {
          this.$message.success("删除属性成功");
          this.getAttrList();
        } else {
          this.$message.error("删除属性失败");
        }
      } catch (error) {
        this.$message.error("请求删除属性失败");
      }
    }
  }
};
</script>
