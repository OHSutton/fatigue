import axios from 'axios'

const cameraActiveUrl = 'http://localhost:3001/camera'
const currentUserUrl = 'http://localhost:3001/current-user'
const baseUrl = 'http://localhost:3001/users'


const getAllUsers = () => {
  const req = axios.get(baseUrl)
  return req.then(response => response.data)
}

const getCurrentUser = () => {
  const req = axios.get(currentUserUrl)
  return req.then(response => response.data)
}

const getUserById = id => {
  const req = axios.get(`${baseUrl}/${id}`)
  return req.then(response => response.data)
}

const createUser = newUser => {
  const req = axios.post(baseUrl, newUser)
  return req.then(response => response.data)
}

const updateUser = (id, newUser) => {
  const req = axios.put(`${baseUrl}/${id}`, newUser)
  return req.then(response => response.data)
}

const setCurrentUser = (newUser) => {
  const req = axios.put(currentUserUrl, newUser)
  return req.then(response => response.data)
}

// active is: 'true' or 'false'
const setCameraActivity = (active) => {
  const req = axios.put(cameraActiveUrl, {"active": active})
  return req.then(response => response.data)
}

export default { getAllUsers, getUserById, getCurrentUser, createUser, updateUser, setCurrentUser,
  setCameraActivity}