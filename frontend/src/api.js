import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
})

// Track in-flight requests to prevent duplication
const inFlightRequests = new Map()

const createRequestKey = (method, url) => `${method}:${url}`

export const getEmployees = async (skip = 0, limit = 50) => {
  const response = await api.get('/employees', {
    params: { skip, limit },
  })
  return response.data
}

export const getEmployeesCount = async () => {
  const response = await api.get('/employees/count')
  return response.data
}

export const getEmployee = async (id) => {
  const response = await api.get(`/employees/${id}`)
  return response.data
}

export const createEmployee = async (employee) => {
  // Prevent duplicate requests
  const key = createRequestKey('POST', '/employees')
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key)
  }

  const promise = api.post('/employees', employee)
    .finally(() => inFlightRequests.delete(key))

  inFlightRequests.set(key, promise)
  return promise.then(res => res.data)
}

export const updateEmployee = async (id, employee) => {
  // Prevent duplicate requests
  const key = createRequestKey('PUT', `/employees/${id}`)
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key)
  }

  const promise = api.put(`/employees/${id}`, employee)
    .finally(() => inFlightRequests.delete(key))

  inFlightRequests.set(key, promise)
  return promise.then(res => res.data)
}

export const deleteEmployee = async (id) => {
  // Prevent duplicate requests
  const key = createRequestKey('DELETE', `/employees/${id}`)
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key)
  }

  const promise = api.delete(`/employees/${id}`)
    .finally(() => inFlightRequests.delete(key))

  inFlightRequests.set(key, promise)
  return promise.then(res => res.data)
}