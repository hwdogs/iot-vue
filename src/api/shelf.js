import api from './index'

export const shelfApi = {
  getAllShelves: () => {
    return api.get('/shelf/getAllShelves')
  },
  
  addShelf: (shelfData) => {
    return api.post('/shelf/addShelf', shelfData)
  },
  
  updateShelf: (shelfData) => {
    return api.post('/shelf/updateShelf', shelfData)
  },
  
  deleteShelf: (shelfId) => {
    return api.post('/shelf/delShelf', null, { params: { shelfId } })
  },
  
  searchShelves: (searchData) => {
    return api.post('/shelf/getAllShelvesByCon', searchData)
  }
} 