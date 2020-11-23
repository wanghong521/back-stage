import request from '@/utils/request'

// DELETE /admin/product/baseTrademark/remove/{id}
// 删除BaseTrademark

// POST /admin/product/baseTrademark/save
// 新增BaseTrademark

// PUT /admin/product/baseTrademark/update
// 修改BaseTrademark

// GET /admin/product/baseTrademark/{page}/{limit}


export default {
    // 删除
    delete(id){
        return request.delete(`/admin/product/baseTrademark/remove/${id}`)
    },

    // 新增和修改
    addOrUpdate(trademark){
        if(trademark.id){
            return request.put(`/admin/product/baseTrademark/update`,trademark)
        }else{
            return request.post(`/admin/product/baseTrademark/save`,trademark)
        }
    },

    // 获取
    getPageList(page,limit){
        return request.get(`/admin/product/baseTrademark/${page}/${limit}`)
    },

     ///admin/product/baseTrademark/getTrademarkList  
  //get
  getList(){
    return request.get('/admin/product/baseTrademark/getTrademarkList')
  }
}