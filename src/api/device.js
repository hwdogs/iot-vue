import api from './index'

export const deviceApi = {
  getAllDevices: () => {
    return api.get('/device/getAllDevices')
  },
  
  addDevice: (deviceData) => {
    return api.post('/device/addDevice', deviceData)
  },
  
  updateDevice: (deviceData) => {
    return api.post('/device/updateDevice', deviceData)
  },
  
  deleteDevice: (deviceId) => {
    return api.post('/device/delDevice', null, { params: { deviceId } })
  },
  
  searchDevices: (searchData) => {
    return api.post('/device/getAllDevicesByCon', searchData)
  }
} 