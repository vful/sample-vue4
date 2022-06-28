import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

Vue.config.productionTip = false

// export 
const firebaseConfig = {
  apiKey: "AIzaSyAhJ3K-TwKawLEjrytzP-T5gRZBq474LUo",
  authDomain: "kimura-vue4.firebaseapp.com",
  projectId: "kimura-vue4",
  storageBucket: "kimura-vue4.appspot.com",
  messagingSenderId: "336725972056",
  appId: "1:336725972056:web:c15266cdc0a69bd9b2662d",
  measurementId: "G-SW6TFE5D1G"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

new Vue({
  router,
  store,
  render: function (h) { return h(App) },
}).$mount('#app')