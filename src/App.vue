<template>
<div>
  <h1>Inventory</h1>
  <br>
  <form @submit.prevent="addProduct">
    Product:
    <input v-model="newProduct.name" type="text" placeholder="Product Name" required><br>
    Quantity:
    <input v-model="newProduct.quantity" type="number" placeholder="Quantity" required><br>
    Price:
    <input v-model="newProduct.price" type="number" placeholder="Price per Product" required><br>
    <button type="submit">Add Product</button>
  </form>
  <ul>
    <li v-for="(product, index) in products.filter(p => p.quantity !== 0)" :key="product.id">
      {{ product.name }} - stock left: {{ product.quantity }} for {{ product.price }}€ each
    </li>
  </ul>

  <h1>Process Order</h1>
  <br>
  <form @submit.prevent="processOrder">
    Product
    <select v-model="selectProductIndex">
      <option value="" disabled>Select product</option>
      <option v-for="(product, index) in products" :key="index" :value="index">{{ product.name }}</option>
    </select><br>
    Quantity:
    <select v-model="selectQuantity">
      <option value="" disabled>Select quantity</option>
      <option v-for="n in availableQuantity" :key="n" :value="n">{{ n }}</option>
    </select><br>
    <button type="submit">Enter order</button>
  </form>

  <div v-if="revenue > 0">
    <h2>Revenue</h2><br>
    <p>{{ revenue }}€</p>
  </div>
  <br>

  <div v-if="outOfStock.length > 0">
    <h2>Out of stock</h2>
    <ul>
      <li v-for="name in outOfStock">{{ name }}</li>
    </ul>
  </div>
  
</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import ProductService from './services/ProductService';
import type { ProductDTO, ProductCreateDTO } from './models/types.ts';

const products = ref<ProductDTO[]>([])
const newProduct = ref<ProductCreateDTO>({'name': '', 'quantity': 0, 'price': 0});
const selectProductIndex = ref<number | ''>('');
const selectQuantity = ref<number | ''>('');
const revenue = ref<number>(0);
const outOfStock = ref<string[]>([]);

// when starting the app, all products are fetched from the database
onMounted(() => {
  loadProducts();
});

// asynchronous functions for calling backend
async function loadProducts() {
  const response = await ProductService.getAll();
  products.value = response.data;
}

async function addProduct() {
  if (newProduct.value.name == '' || newProduct.value.quantity <= 0 || newProduct.value.price < 0) {
    alert("Invalid input for new product");
    return;
  }
  await ProductService.create(newProduct.value);
  await loadProducts();
  newProduct.value = {'name': '', 'quantity': 0, 'price': 0};
}

async function updateProduct(product:ProductDTO) {
  await ProductService.update(product.id, product);
  await loadProducts();
}

async function deleteProduct(id:number) {
  await ProductService.delete(id);
  await loadProducts();
  
}

const availableQuantity = computed(() => {
  // return empty list if there are no products 
  if (products.value.length === 0 || selectProductIndex.value === '') return [];
  const product = products.value[selectProductIndex.value as number];
  const available: number[] = [];
  for (let i = 1; i <= product.quantity; i++) {
    available.push(i);
  }
  return available;
})

function processOrder() {
  // change the value in products of that product to decrease its quantity by the selected quantity
  if (selectProductIndex.value === '' || selectQuantity.value === '') return;
  const product = products.value[selectProductIndex.value as number];
  product.quantity -= selectQuantity.value;
  updateProduct(product);

  // compute revenue
  revenue.value += product.price * selectQuantity.value;

  // delete product if it has a quantity of 0
  if (product.quantity === 0) {
    if (!outOfStock.value.includes(product.name)) {
      outOfStock.value.push(product.name);
    }
    products.value.splice(selectProductIndex.value, 1);
  }

  // reset input fields
  selectProductIndex.value = '';
  selectQuantity.value = '';

  
}



</script>

<style scoped>
h1 {
  margin-top: 1rem;
}
form {
  margin-bottom: 1rem;
}
</style>
