import axios from 'axios';
import type { ProductDTO, ProductCreateDTO } from '../models/types';

const API_URL = "http://localhost:8080/api/products"

export default {
    getAll() {
        return axios.get(API_URL);
    },
    getById(id: number) {
        return axios.get(`${API_URL}/${id}`);
    },
    create(product: ProductCreateDTO) {
        return axios.post(API_URL, product);
    },
    update(id: number, product: ProductCreateDTO) {
        return axios.put(`${API_URL}/${id}`, product);
    },
    delete(id: number) {
        return axios.delete(`${API_URL}/${id}`);
    }
}