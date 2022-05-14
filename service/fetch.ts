import axios  from 'axios' 
const requestInstance = axios.create({
  baseURL: '/'
})

requestInstance.interceptors.request.use(
  (config: any) => config,
  (error: any) => Promise.reject(error)
)

requestInstance.interceptors.response.use((response: any) => {
  if (response?.status === 200) {
    return response?.data;
  } else {
    return {
      code: -1,
      msg: '未知错误',
      data: null
     }
  }
},
(error: any) => Promise.reject(error)
)

export default requestInstance