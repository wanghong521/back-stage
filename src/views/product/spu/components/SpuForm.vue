<template>
  <div>
    <el-form ref="form" :model="spuForm" label-width="100px">
      <el-form-item label="SPU名称">
        <el-input v-model="spuForm.spuName" placeholder="SPU名称"></el-input>
      </el-form-item>

      <el-form-item label="品牌">
        <el-select v-model="spuForm.tmId" placeholder="请选择品牌">
          <el-option
            :label="tm.tmName"
            :value="tm.id"
            v-for="(tm, index) in trademarkList"
            :key="tm.id"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="SPU描述">
        <el-input
          v-model="spuForm.description"
          placeholder="SPU描述"
          type="textarea"
          rows="4"
        ></el-input>
      </el-form-item>

      <!-- :file-list="spuImageList" 照片墙要显示的所以图片，把获取到的图片列表得写过来 -->
      <el-form-item label="SPU图片">
        <el-upload
          action="/dev-api/admin/product/fileUpload"
          list-type="picture-card"
          :file-list="spuImageList"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :on-success="handleSuccess"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="" />
        </el-dialog>
      </el-form-item>

      <el-form-item label="销售属性">
        <el-select
          v-model="saleAttrIdName"
          :placeholder="
            unUsedSaleAttrList.length > 0
              ? `还剩${unUsedSaleAttrList.length}个未选择`
              : '没有啦！！！'
          "
        >
          <!-- 添加销售属性的时候选中某一个需要把id和name全部收集起来，点击按钮后后面去处理 -->
          <el-option
            :label="unUsedSaleAttr.name"
            :value="`${unUsedSaleAttr.id}:${unUsedSaleAttr.name}`"
            v-for="(unUsedSaleAttr, index) in unUsedSaleAttrList"
            :key="unUsedSaleAttr.id"
          >
          </el-option>
        </el-select>
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="addSaleAttr"
          :disabled="!saleAttrIdName"
          >添加销售属性</el-button
        >
        <el-table
          :data="spuForm.spuSaleAttrList"
          border
          style="width: 100%; margin-top: 20px"
        >
          <el-table-column align="center" type="index" label="序号" width="80">
          </el-table-column>
          <el-table-column prop="saleAttrName" label="属性名" width="150">
          </el-table-column>
          <el-table-column prop="prop" label="属性值名称列表" width="width">
            <template slot-scope="{ row, $index }">
              <!-- 属性和属性值要分清  row代表属性  $index代表属性在属性列表当中的下标
              v-for循环循环的是 当前属性所对应的属性值列表  v-for当中的index代表是属性值在数组中的下标
              -->
              <el-tag
                closable
                :disable-transitions="false"
                @close="row.spuSaleAttrValueList.splice(index, 1)"
                v-for="(spuSaleAttrValue, index) in row.spuSaleAttrValueList"
                :key="spuSaleAttrValue.id"
              >
                {{ spuSaleAttrValue.saleAttrValueName }}
              </el-tag>

              <!-- 和之前的平台属性有区别
              之前平台属性当中每个属性值都对应有自己的input和span，也就是说每个属性值都有自己的编辑模式和查看模式
              现在这个销售属性值，不是每个属性值都有自己的编辑模式和查看模式，而是每个属性有自己的一个编辑模式和查看模式 -->
              <el-input
                class="input-new-tag"
                v-if="row.isEdit"
                v-model="row.saleAttrValueName"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(row)"
                @blur="handleInputConfirm(row)"
              >
              </el-input>
              <el-button
                v-else
                class="button-new-tag"
                size="small"
                @click="showInput(row)"
                >+添加</el-button
              >
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="150">
            <template slot-scope="{ row, $index }">
              <HintButton
                type="danger"
                size="mini"
                icon="el-icon-delete"
                title="删除spu销售属性"
                @click="spuForm.spuSaleAttrList.splice($index, 1)"
              ></HintButton>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="save" :disabled="!spuForm.spuName"
          >保存</el-button
        >
        <el-button @click="cancelBack">取消</el-button>
        <!-- <el-button @click="$emit('input',false)">取消</el-button> -->
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "",
  // props:['visible'],  //接收不接收都行，因为在子组件没用
  data() {
    return {
      spuForm: {
        category3Id: 0,
        description: "", //v-model
        spuImageList: [
          // {
          //   id: 0,
          //   imgName: "string",
          //   imgUrl: "string",
          //   spuId: 0,
          // },
        ],
        spuName: "", //v-model
        spuSaleAttrList: [
          // {
          //   baseSaleAttrId: 0,
          //   id: 0,
          //   saleAttrName: "string",
          //   spuId: 0,
          //   spuSaleAttrValueList: [
          // {
          //   baseSaleAttrId: 0,
          //   id: 0,
          //   isChecked: "string",
          //   saleAttrName: "string",
          //   saleAttrValueName: "string",
          //   spuId: 0,
          // },
          //   ],
          // },
        ],
        tmId: "" //v-model
      },
      //添加spu的时候收集数据需要收集的一个对象
      //这个spuForm 修改的时候，被请求回来的spu详情就覆盖了

      spuImageList: [], //用来存储修改请求回来的spu对应的图片列表数据

      trademarkList: [], //所有的品牌列表

      baseSaleAttrList: [], //所有的销售属性列表

      saleAttrIdName: "",

      dialogImageUrl: "",
      dialogVisible: false,

      category3Id: "" //从父组件接收到的参数，最后保存需要
    };
  },
  methods: {
    //清空数据
    resetData() {
      (this.spuForm = {
        category3Id: 0,
        description: "", //v-model
        spuImageList: [
          // {
          //   id: 0,
          //   imgName: "string",
          //   imgUrl: "string",
          //   spuId: 0,
          // },
        ],
        spuName: "", //v-model
        spuSaleAttrList: [
          // {
          //   baseSaleAttrId: 0,
          //   id: 0,
          //   saleAttrName: "string",
          //   spuId: 0,
          //   spuSaleAttrValueList: [
          // {
          //   baseSaleAttrId: 0,
          //   id: 0,
          //   isChecked: "string",
          //   saleAttrName: "string",
          //   saleAttrValueName: "string",
          //   spuId: 0,
          // },
          //   ],
          // },
        ],
        tmId: "" //v-model
      }),
        (this.spuImageList = []); //用来存储修改请求回来的spu对应的图片列表数据
      this.trademarkList = []; //所有的品牌列表
      this.baseSaleAttrList = []; //所有的销售属性列表
      this.saleAttrIdName = "";
      this.dialogImageUrl = "";
      this.dialogVisible = false;
      this.category3Id = ""; //从父组件接收到的参数，最后保存需要
    },

    //点击取消
    cancelBack() {
      this.$emit("update:visible", false);
      this.resetData();

      this.$emit("cancelBack"); //通知父组件清除身上的spuId标识
    },

    //保存操作
    async save() {
      //取参数
      let { spuForm, spuImageList, category3Id } = this;
      //整理参数
      //1、先整category3Id
      spuForm.category3Id = category3Id;

      //2、再整图片列表
      //要求的图片对象格式
      // {
      //       imgName: "string",
      //       imgUrl: "string",
      // },
      //我们现在的
      // 新的图片  只有name和url 而且url是本地的路径  没有imgName和imgUrl
      // 老的图片  有name和url  还有imgName和imgUrl  都是正确的路径

      spuImageList = spuImageList.map(item => {
        return {
          imgName: item.name,
          imgUrl: item.imgUrl || item.response.data
          //获取图片的路径 老的里面有imgUrl和url都可以
          //但是新的当中url不行而且也没有imgUrl,但是新的当中有response
        };
      });
      // console.log(spuImageList)
      spuForm.spuImageList = spuImageList;

      //3、最后整理属性去除属性当中添加的数据
      spuForm.spuSaleAttrList.forEach(item => {
        delete item.isEdit;
        delete item.saleAttrValueName;
      });

      //发请求
      //成功干啥失败干啥
      try {
        const result = await this.$API.spu.addUpdate(spuForm);
        if (result.code === 200) {
          //提示
          this.$message.success("保存spu成功");
          //返回到列表
          this.$emit("update:visible", false);
          //通知父组件回来了
          this.$emit("successBack");
        } else {
          this.$message.error("保存失败");
        }
      } catch (error) {
        this.$message.error("请求保存失败");
      }
    },

    // input输入框失去焦点
    //回调函数内部去获取刚收集在属性身上的属性值名称
    handleInputConfirm(row) {
      // console.log(111)

      let { saleAttrValueName, baseSaleAttrId } = row;
      let obj = { saleAttrValueName, baseSaleAttrId };

      //判断输入的属性值名称是否存在（是不是空白）
      if (saleAttrValueName.trim() === "") {
        // this.$message.warning('输入的数据不能为空')
        row.isEdit = false; // 没有数据直接变为button 是最好的
        row.saleAttrValueName = ""; //清空input输入框当中的数据
        return;
      }

      //不用除去自身，因为现在属性值列表当中还没有自己
      //平台属性当时属性值添加的时候，直接已经把数据添加到对应数组当中了，因此后期判断需要除去自身，而现在不需要
      let isRepeat = row.spuSaleAttrValueList.some(
        item => obj.saleAttrValueName.trim() === item.saleAttrValueName.trim()
      );
      if (isRepeat) {
        console.log(111);
        this.$message.warning("不能和已有的属性值重复");
        row.saleAttrValueName = "";
        return;
      }

      //把属性值添加到对应属性的属性值列表当中
      row.spuSaleAttrValueList.push(obj);

      row.saleAttrValueName = "";

      row.isEdit = false; //切换为查看模式  button
    },

    //点击添加属性值按钮切换为insaleAttrValueNameput
    showInput(row) {
      // row.isEdit = true
      this.$set(row, "isEdit", true);
      this.$set(row, "saleAttrValueName", ""); //点击切换为input的时候，设置saleAttrValueName的初始值为空串
      //自动获取焦点
      this.$nextTick(() => {
        this.$refs.saveTagInput.focus();
      });
    },

    //添加销售属性
    addSaleAttr() {
      //把刚才收集到的字符串拿过来拆开，组装成一个对象，塞到spuForm.spuSaleAttrList
      let [baseSaleAttrId, saleAttrName] = this.saleAttrIdName.split(":");

      let obj = {
        baseSaleAttrId,
        saleAttrName,
        spuSaleAttrValueList: []
      };
      this.spuForm.spuSaleAttrList.push(obj);

      this.saleAttrIdName = ""; //清空收集的数据，清空之后select就不会一直显示着这项了
    },

    //处理删除图片后收集最终的spu图片列表
    handleRemove(file, fileList) {
      // console.log(file, fileList);
      this.spuImageList = fileList;
    },
    //放大镜点击后弹出dialog显示大图，不需要处理任何事情，别人写好的
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    // 上传成功后收集最终的spu图片列表
    handleSuccess(response, file, fileList) {
      // console.log(fileList)
      this.spuImageList = fileList;
      // 新的图片  只有name和url 而且url是本地的路径  没有imgName和imgUrl
      // 老的图片  有name和url  还有imgName和imgUrl  都是正确的路径
    },

    //点击添加spu的时候，要去发送请求获取的初始化动态数据
    async initAddSpuFormData(category3Id) {
      this.category3Id = category3Id;
      //获取所有的品牌列表数据
      //http://localhost:9529/dev-api/admin/product/baseTrademark/getTrademarkList
      const trademarkResult = await this.$API.trademark.getList();
      if (trademarkResult.code === 200) {
        this.trademarkList = trademarkResult.data;
      }
      //获取所有的销售属性数据
      //http://localhost:9529/dev-api/admin/product/baseSaleAttrList
      const baseSaleAttrResult = await this.$API.spu.getSaleList();
      if (baseSaleAttrResult.code === 200) {
        this.baseSaleAttrList = baseSaleAttrResult.data;
      }
    },

    //点击修改spu的时候，要去发送请求获取的初始化动态数据
    async initUpdateSpuFormData(row, category3Id) {
      this.category3Id = category3Id;
      //根据spu的id获取spu详情数据（需要展示）
      //http://localhost:9529/dev-api/admin/product/getSpuById/1851
      const spuInfoResult = await this.$API.spu.get(row.id);
      if (spuInfoResult.code === 200) {
        this.spuForm = spuInfoResult.data;
      }
      //根据spu的id获取spu的图片列表数据
      //http://localhost:9529/dev-api/admin/product/spuImageList/1851
      const imageListResult = await this.$API.sku.getSpuImageList(row.id);

      if (imageListResult.code === 200) {
        //请求回来的图片列表赋值之前，先把图片给加工一下，最后再赋值给spuImageList，而spuImageList是响应式属性
        let imgList = imageListResult.data;
        imgList.forEach(item => {
          item.name = item.imgName;
          item.url = item.imgUrl;
        });

        this.spuImageList = imgList;
      }
      //获取所有的品牌列表数据
      //http://localhost:9529/dev-api/admin/product/baseTrademark/getTrademarkList
      const trademarkResult = await this.$API.trademark.getList();
      if (trademarkResult.code === 200) {
        this.trademarkList = trademarkResult.data;
      }
      //获取所有的销售属性数据
      //http://localhost:9529/dev-api/admin/product/baseSaleAttrList
      const baseSaleAttrResult = await this.$API.spu.getSaleList();
      if (baseSaleAttrResult.code === 200) {
        this.baseSaleAttrList = baseSaleAttrResult.data;
      }
    }
  },

  computed: {
    unUsedSaleAttrList() {
      //我们现在又两个销售属性列表
      //1个是所有的销售属性列表i
      //还有一个spu自己的销售属性列表
      //spu销售属性列表是从所有的销售属性列表当中选择了其中几项
      //现在我们需要spu选择后剩余的未选择的销售属性列表

      //从所有的销售属性列表当中过滤出，在spu属性列表当中不存在的属性组成新数组

      return this.baseSaleAttrList.filter(baseSaleAttr =>
        //从baseSaleAttrList当中拿到一项
        //就用这一项去和spuForm.spuSaleAttrList当中所有的项去对比名称是不是不相等
        //如果是真的所有的都不相等，那么every的方法返回true，filter返回的就是every返回的true
        this.spuForm.spuSaleAttrList.every(
          spuSaleAttr => spuSaleAttr.saleAttrName !== baseSaleAttr.name
        )
      );
    }
  }
};
</script>

<style>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
