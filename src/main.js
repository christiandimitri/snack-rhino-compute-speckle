/* eslint-disable no-unused-vars */
import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
const app = createApp(App)
app.use(router)

window.rhino3dm().then(async (rhino) => {
  if (rhino != null) {
    app.config.globalProperties.rhino = rhino
    console.log('Rhino3dm loaded')
  }
  if (window.RhinoCompute != null) {
    app.config.globalProperties.rhinoCompute = window.RhinoCompute
    console.log('Rhino.Compute', window.RhinoCompute.version)
  }
  app.mount('#app')
})
