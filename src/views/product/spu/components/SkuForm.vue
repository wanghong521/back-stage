<template>
  <div>
    <el-form ref="form" :model="skuForm" label-width="100px">
      <el-form-item label="SPU名称"> {{ spu.spuName }} </el-form-item>

      <el-form-item label="SKU 名称">
        <el-input v-model="skuForm.skuName" placeholder="SKU 名称"></el-input>
      </el-form-item>
      <el-form-item label="价格(元)">
        <el-input
          v-model="skuForm.price"
          placeholder="价格(元)"
          type="number"
        ></el-input>
      </el-form-item>
      <el-form-item label="重量(千克)">
        <el-input
          v-model="skuForm.weight"
          placeholder="重量(千克)"
          type="number"
        ></el-input>
      </el-form-item>
      <el-form-item label="规格描述">
        <el-input
          v-model="skuForm.skuDesc"
          placeholder="规格描述"
          type="textarea"
          rows="4"
        ></el-input>
      </el-form-item>

      <el-form-item label="平台属性">
        <el-form :inline="true" ref="form" label-width="100px">
          <el-form-item
            :label="attr.attrName"
            v-for="(attr, index) in attrList"
            :key="attr.id"
          >
            <!-- 用户选择select的时候，我们顺便把属性的id及选中的属性值的id 拼接 收集起来，放在当前选择的这个属性身上 -->
            <!-- select和option 通常勾搭在一起
            最终select收集数据  select收集数据收集的是选中的option的value值
            -->
            <el-select v-model="attr.attrIdValueId" placeholder="请输入">
              <el-option
                :label="attrValue.valueName"
                :value="`${attr.id}:${attrValue.id}`"
                v-for="(attrValue, index) in attr.attrValueList"
                :key="attrValue.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>

      <el-form-item label="销售属性">
        <el-form :inline="true" ref="form" label-width="100px">
          <el-form-item
            :label="spuSaleAttr.saleAttrName"
            v-for="(spuSaleAttr, index) in spuSaleAttrList"
            :key="spuSaleAttr.id"
          >
            <el-select
              v-model="spuSaleAttr.saleAttrValueId"
              placeholder="请输入"
            >
              <el-option
                :label="spuSaleAttrValue.saleAttrValueName"
                :value="spuSaleAttrValue.id"
                v-for="(spuSaleAttrValue,
                index) in spuSaleAttr.spuSaleAttrValueList"
                :key="spuSaleAttrValue.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>

      <el-form-item label="图片列表">
        <el-table
          border
          style="width: 100%"
          :data="spuImageList"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            type="selection"
            prop="prop"
            label="label"
            width="55"
          >
          </el-table-column>
          <el-table-column prop="prop" label="图片">
            <template slot-scope="{ row, $index }">
              <img
                :src="row.imgUrl"
                alt=""
                style="width: 100px; height: 80px"
              />
            </template>
          </el-table-column>
          <el-table-column prop="imgName" label="名称"> </el-table-column>
          <el-table-column prop="prop" label="操作">
            <template slot-scope="{ row, $index }">
              <el-button
                v-if="row.isDefault === '0'"
                type="primary"
                size="mini"
                @click="setDefault(row)"
                >设为默认</el-button
              >
              <el-tag v-else type="success">默认</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "",
  data() {
    return {
      //捏造的不知道对不对
      // attrValueId: "",
      // spuSaleAttrValueId:"",
      skuForm: {
        //父组件传递过来的
        spuId: 0,
        category3Id: 0,
        tmId: 0,

        //v-model收集
        price: "",
        skuName: "",
        skuDesc: "",
        weight: "",

        //需要自己整理的
        skuDefaultImg: "",
        // 这个数组是用来收集用户选中的属性值列表  用户选中的属性值可能有多个
        skuAttrValueList: [
          // {
          //   attrId: 0,
          //   valueId: 0,
          // },
        ],
        skuImageList: [
          // {
          //   id: 0,
          //   imgName: "string",
          //   imgUrl: "string",
          //   isDefault: "string",
          //   skuId: 0,
          //   spuImgId: 0,
          // },
        ],
        skuSaleAttrValueList: [
          // {
          //   saleAttrValueId: 0,
          // },
        ]
      },
      spu: {},
      attrList: [],
      spuSaleAttrList: [],
      spuImageList: [], //是初始化数据为了展示用的

      skuCheckedImageList: [] //为了选中图片组成数组 后期发请求使用的
    };
  },
  methods: {
    //取消添加sku
    cancel() {
      this.$emit("update:visible", false);
      this.resetData();
    },

    //保存添加sku
    async save() {
      //拿参数
      let {
        skuForm,
        spu,
        attrList,
        spuSaleAttrList,
        skuCheckedImageList
      } = this;
      //整理参数
      //1、先把父组件传过来整好
      skuForm.spuId = spu.id;
      skuForm.category3Id = spu.category3Id;
      skuForm.tmId = spu.tmId;

      //2、整理平台属性和销售属性的属性值，添加到skuForm相关的位置
      skuForm.skuAttrValueList = attrList.reduce((prev, item) => {
        if (item.attrIdValueId) {
          let [attrId, valueId] = item.attrIdValueId.split(":");
          let obj = { attrId, valueId };
          prev.push(obj);
        }
        return prev;
      }, []);

      skuForm.skuSaleAttrValueList = spuSaleAttrList.reduce((prev, item) => {
        if (item.saleAttrValueId) {
          let saleAttrValueId = item.saleAttrValueId;
          let obj = { saleAttrValueId };
          prev.push(obj);
        }
        return prev;
      }, []);

      //整理图片
      // 要求的
      // {
      //   imgName: "string",
      //   imgUrl: "string",
      //   isDefault: "string",
      //   spuImgId: 0,
      // },

      //我们的
      // id:9486
      // imgName:"22.jpg"
      // imgUrl:"http://182.92.128.115:8080/group1/M00/00/87/rBFUDF-4hcyALxLrAAUOiMiqm2k418.jpg"
      // isDefault:"0"
      // spuId:1863

      skuForm.skuImageList = skuCheckedImageList.map(item => {
        return {
          imgUrl: item.imgUrl,
          imgName: item.imgName,
          isDefault: item.isDefault,
          spuImgId: item.id
        };
      });

      //发请求
      //成功干啥失败干啥
      try {
        const result = await this.$API.sku.addUpdate(skuForm);
        console.log(111);
        if (result.code === 200) {
          this.$message.success("保存sku成功");
          this.$emit("update:visible", false);
          this.resetData();
        } else {
          this.$message.error("保存sku失败");
        }
      } catch (error) {
        this.$message.error("请求保存sku失败");
      }
    },

    //清空数据
    resetData() {
      this.skuForm = {
        //父组件传递过来的
        spuId: 0,
        category3Id: 0,
        tmId: 0,

        //v-model收集
        price: "",
        skuName: "",
        skuDesc: "",
        weight: "",

        //需要自己整理的
        skuDefaultImg: "",
        // 这个数组是用来收集用户选中的属性值列表  用户选中的属性值可能有多个
        skuAttrValueList: [
          // {
          //   attrId: 0,
          //   valueId: 0,
          // },
        ],
        skuImageList: [
          // {
          //   id: 0,
          //   imgName: "string",
          //   imgUrl: "string",
          //   isDefault: "string",
          //   skuId: 0,
          //   spuImgId: 0,
          // },
        ],
        skuSaleAttrValueList: [
          // {
          //   saleAttrValueId: 0,
          // },
        ]
      };
      this.spu = {};
      this.attrList = [];
      this.spuSaleAttrList = [];
      this.spuImageList = []; //是初始化数据为了展示用的
      this.skuCheckedImageList = [];
    },

    //排它设置默认图片,收集sku的默认图片
    setDefault(row) {
      this.spuImageList.forEach(item => (item.isDefault = "0"));
      row.isDefault = "1";
      this.skuForm.skuDefaultImg = row.imgUrl;
    },

    //选择图片收集选中的图片列表
    handleSelectionChange(val) {
      this.skuCheckedImageList = val;
      console.log(this.skuCheckedImageList);
    },

    //点击添加sku跳转过来的初始化数据获取
    async initAddSkuFormData(row, category1Id, category2Id) {
      this.spu = row;
      //http://localhost:9529/dev-api/admin/product/attrInfoList/2/13/61
      let promise1 = this.$API.attr.getList(
        category1Id,
        category2Id,
        row.category3Id
      );
      //http://localhost:9529/dev-api/admin/product/spuSaleAttrList/1867
      let promise2 = this.$API.sku.getSpuSaleAttrList(row.id);
      //http://localhost:9529/dev-api/admin/product/spuImageList/1867
      let promise3 = this.$API.sku.getSpuImageList(row.id);

      const result = await Promise.all([promise1, promise2, promise3]);
      console.log(result);
      this.attrList = result[0].data;
      this.spuSaleAttrList = result[1].data;

      let spuImageList = result[2].data;
      spuImageList.forEach(item => (item.isDefault = "0"));

      this.spuImageList = spuImageList;
    }
  }
};
</script>
