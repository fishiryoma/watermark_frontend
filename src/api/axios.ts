import axios from 'axios'

interface ApiResponse<T> {
  data: T
  status: number
  message?: string
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  headers: {
    'Content-Type': 'application/json',
  },
})

// GET
export const doGet = async <T>(url: string): Promise<ApiResponse<T>> => {
  try {
    const res: ApiResponse<T> = await api.get(url)
    return res
  } catch (err) {
    throw new Error('get error')
  }
}

// POST
export const doPost = async <T>(
  url: string,
  data?: Record<string, any>,
): Promise<ApiResponse<T>> => {
  try {
    const res: ApiResponse<T> = await api.post(url, data)
    return res
  } catch (err) {
    throw new Error('post error')
  }
}

// POST FILE
export const doUpload = async <T, R extends Record<string, any>>(
  url: string,
  file: File,
  body?: R,
): Promise<any> => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    if (body) {
      Object.entries(body).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
    }

    const defaultHeaders = { ...api.defaults.headers.common, ...api.defaults.headers.post }

    const res = await api.post(url, formData, {
      headers: { ...defaultHeaders, 'Content-Type': 'multipart/form-data' },
      responseType: 'blob',
    })

    const imgUrl = URL.createObjectURL(res.data)
    const serverFileName = res.headers['content-disposition'].split('filename=')[1]

    return { imgUrl, fileName: serverFileName }
  } catch (err) {
    throw new Error('postfile error')
  }
}
