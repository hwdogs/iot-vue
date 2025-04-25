import api from './index'

export const goodsApi = {
  getAllGoods: () => {
    return api.get('/goods/getAllGoods')
  },
  
  addGoods: (goodsData) => {
    return api.post('/goods/addGoods', goodsData)
  },
  
  updateGoods: (goodsData) => {
    return api.post('/goods/updateGoods', goodsData)
  },
  
  deleteGoods: (goodsId) => {
    return api.post('/goods/delGoods', null, { params: { goodsId } })
  },
  
  searchGoods: (searchData) => {
    return api.post('/goods/getAllGoodsByCon', searchData)
  }
} 