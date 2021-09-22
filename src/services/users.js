import axios from 'axios'

const baseUrl = 'http://localhost:3001/users'


const getAllUsers = () => {
  const req = axios.get(baseUrl)
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


export default { getAllUsers, getUserById, createUser, updateUser}