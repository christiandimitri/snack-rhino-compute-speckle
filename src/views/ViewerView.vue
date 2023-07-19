<template>
  <div></div>
</template>
<!-- eslint-disable no-unused-vars -->
<script>
import ThreeService from '@/composable/ThreeService.js'
import RhinoService from '@/composable/RhinoService.js'
import { ref, shallowRef } from 'vue'
export default {
  setup() {
    const threeService = new ThreeService()
    const rhinoService = shallowRef(null)
    const sendToSpeckle = ref(false)
    return {
      threeService,
      rhinoService,
      sendToSpeckle
    }
  },
  async beforeMount() {
    this.threeService.init()
    this.rhinoService = new RhinoService(this.rhinoCompute, this.rhino)
    await this.rhinoService.getGrasshoperFile()
    await this.rhinoService
      .computeGrasshopperDefinition(this.sendToSpeckle)
      .then((value) => {
        console.log(value)
      })
      .catch((error) => console.log(error))
  }
}
</script>

<style></style>
