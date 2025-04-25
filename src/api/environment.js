import axios from 'axios'

const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api'

// Get all environment data
export function getAllEnvironments() {
  return axios.get(`${API_BASE_URL}/environment`)
}

// Get environment data by sensor ID
export function getEnvironmentBySensorId(sensorId) {
  return axios.get(`${API_BASE_URL}/environment/${sensorId}`)
}

// Search environment data
export function searchEnvironments(params) {
  return axios.get(`${API_BASE_URL}/environment/search`, { params })
}

// Add new environment data
export function addEnvironment(environmentData) {
  return axios.post(`${API_BASE_URL}/environment`, environmentData)
}

// Update environment data
export function updateEnvironment(environmentData) {
  return axios.put(
    `${API_BASE_URL}/environment/${environmentData.sensorId}/${encodeURIComponent(environmentData.timestamp)}`, 
    environmentData
  )
}

// Delete environment data
export function deleteEnvironment(sensorId, timestamp) {
  return axios.delete(`${API_BASE_URL}/environment/${sensorId}/${encodeURIComponent(timestamp)}`)
}

// Get environment stats
export function getEnvironmentStats() {
  return axios.get(`${API_BASE_URL}/environment/stats`)
} 