import api from './index'

export const warehouseApi = {
  getAllWarehouses: () => {
    return api.get('/warehouse/getAllWarehouses')
  },
  
  addWarehouse: (warehouseData) => {
    return api.post('/warehouse/addWarehouse', warehouseData)
  },
  
  updateWarehouse: (warehouseData) => {
    return api.post('/warehouse/updateWarehouse', warehouseData)
  },
  
  deleteWarehouse: (warehouseId) => {
    return api.post('/warehouse/delWarehouse', null, { params: { warehouseId } })
  },
  
  searchWarehouses: (searchData) => {
    return api.post('/warehouse/getAllWarehousesByCon', searchData)
  }
} 