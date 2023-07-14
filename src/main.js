/* eslint-disable no-unused-vars */
import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const app = createApp(App)

app.use(router)

window.rhino3dm().then(async (rhino) => {
  if (rhino != null) {
    app.config.globalProperties.$rhino = rhino
    console.log('Rhino3dm loaded')
  }
  if (window.RhinoCompute != null) {
    app.config.globalProperties.$RhinoCompute = window.RhinoCompute
    console.log('Rhino.Compute', window.RhinoCompute.version)
  }
  if (THREE != null) {
    app.config.globalProperties.$THREE = THREE
    console.log('THREE loaded')
  }
  if (OrbitControls != null) {
    app.config.globalProperties.$OrbitControls = OrbitControls
    console.log('OrbitControls loaded')
  }
  app.mount('#app')
})
