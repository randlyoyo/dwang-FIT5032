import 'bootstrap/dist/css/bootstrap.min.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


const app = createApp(App)
app.use(PrimeVue, { theme: { preset: Aura } })
app.use(router)

app.mount('#app')

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBgVwm_TBUDXjeDVtr13SWcSe2n4ggFUqI",
  authDomain: "week7-dingao-2ee99.firebaseapp.com",
  projectId: "week7-dingao-2ee99",
  storageBucket: "week7-dingao-2ee99.firebasestorage.app",
  messagingSenderId: "217861418342",
  appId: "1:217861418342:web:4a0eb70a38632f76136ca7"
};

// Initialize Firebase
initializeApp(firebaseConfig);