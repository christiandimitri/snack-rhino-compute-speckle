/* eslint-disable no-unused-vars */
import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Rhino3dmLoader } from 'three/examples/jsm/loaders/3DMLoader'
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
  if (Rhino3dmLoader != null) {
    app.config.globalProperties.$Rhino3dmLoader = Rhino3dmLoader
    console.log('Rhino3dmLoader loaded')
  }
  app.mount('#app')
})
