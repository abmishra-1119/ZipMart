import api from "../../utils/axiosInstance.js";


const getAllProducts =  async ({limit= 10, page=1,query ='' }) =>{
    const response = await api.get(`products?page=${page}&limit=${limit}&${query}`)
    console.log(response)
    return response.data


}

export const productService = {
    getAllProducts
}