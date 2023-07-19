<!-- eslint-disable no-unused-vars -->

<script>
import { ref, shallowRef } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Rhino3dmLoader } from 'three/examples/jsm/loaders/3DMLoader'

export default {
  setup(props, context) {
    console.log('Setup')
    var rhino3dm = shallowRef(null)
    var three = shallowRef(null)
    var orbitControls = shallowRef(null)
    var rhino3dmLoader = shallowRef(null)
    var definition = shallowRef(null)
    var scene = shallowRef(null)
    var camera = shallowRef(null)
    var renderer = shallowRef(null)
    var doc = shallowRef(null)
    const sendToSpeckle = ref(false)
    return {
      rhino3dm,
      three,
      orbitControls,
      rhino3dmLoader,
      definition,
      scene,
      camera,
      renderer,
      doc,
      sendToSpeckle
    }
  },
  watch: {
    sendToSpeckle(now, before) {
      if (now == true) this.onParamChanged()
      console.log(now, before)
    }
  },
  created() {
    console.log('Created')
  },
  async beforeMount() {
    console.log('before Mounted')

    // if (THREE != null) {
    //   this.three = THREE
    //   console.log('THREE loaded')
    // }
    // if (OrbitControls != null) {
    //   this.orbitControls = OrbitControls
    //   console.log('OrbitControls loaded')
    // }
    // if (Rhino3dmLoader != null) {
    //   this.rhino3dmLoader = Rhino3dmLoader
    //   console.log('Rhino3dmLoader loaded')
    // }
    // this.setServerAuth()
    // await this.getGrasshoperFile(import.meta.env.VITE_GRASSHOPPER_FILE_PATH)
    // this.initThree()
    // await this.compute()
  },
  async mounted() {},
  methods: {
    async collectResults(responseJson) {
      var values = responseJson.values

      // clear doc
      if (this.doc != null || this.doc != undefined) this.doc.delete()
      this.doc = new this.$rhino.File3dm()

      //console.log(values)

      // for each output (RH_OUT:*)...
      for (let i = 0; i < values.length; i++) {
        // ...iterate through data tree structure...
        for (const path in values[i].InnerTree) {
          const branch = values[i].InnerTree[path]
          // ...and for each branch...
          for (let j = 0; j < branch.length; j++) {
            // ...load rhino geometry into doc
            var rhinoObject = this.decodeItem(branch[j])
            console.log(rhinoObject)
            if (rhinoObject != null) {
              this.doc.objects().add(rhinoObject, null)
            }
          }
        }
      }

      if (this.doc.objects().count < 1) {
        console.error('No rhino objects to load!')
        return
      }

      // set up loader for converting the results to threejs
      const loader = new this.rhino3dmLoader()
      loader.setLibraryPath('https://unpkg.com/rhino3dm@7.15.0/')

      const resMaterial = new this.three.MeshBasicMaterial({
        vertexColors: true,
        wireframe: true
      })
      // load rhino doc into three.js scene
      const buffer = new Uint8Array(this.doc.toByteArray()).buffer
      let tempScene = this.scene
      loader.parse(
        buffer,
        function (object) {
          // add material to resulting meshes
          object.traverse((child) => {
            child.material = resMaterial
          })

          // add object graph from rhino model to three.js scene
          tempScene.add(object)
        },
        function (error) {
          // handle the error here
          console.error(error)
        }
      )
    },
    initThree() {
      THREE.Object3D.DEFAULT_UP.set(0, 0, 1)
      // Rhino models are z-up, so set this as the default
      this.three.Object3D.DefaultUp = new this.three.Vector3(0, 0, 1)

      this.scene = new this.three.Scene()
      this.scene.background = new this.three.Color(1, 1, 1)
      this.camera = new this.three.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      )

      this.camera.position.x = 100
      this.camera.position.y = 50
      this.camera.position.z = 25

      this.renderer = new this.three.WebGLRenderer({ antialias: true })
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      document.body.appendChild(this.renderer.domElement)

      // add some controls to orbit the this.camera
      this.controls = new this.orbitControls(this.camera, this.renderer.domElement)

      window.addEventListener('resize', this.onWindowResize, false)

      this.animate()
    },
    async compute() {
      const streamToggle = this.sendToSpeckle
      const streamToggleParam = new this.$rhinoCompute.Grasshopper.DataTree('streamToggle')
      streamToggleParam.append([0], [streamToggle])
      const streamUrl = 'https://speckle.xyz/streams/c68047deaf'
      const streamIdParam = new this.$rhinoCompute.Grasshopper.DataTree('streamId')
      streamIdParam.append([1], [streamUrl])
      const streamMessage = 'This data is sent from the rhino.compute in the vite app'
      const streamMessageParam = new this.$rhinoCompute.Grasshopper.DataTree('streamMessage')
      streamMessageParam.append([2], [streamMessage])

      // clear values
      let trees = []
      // trees.push(param1)
      trees.push(streamToggleParam)
      trees.push(streamIdParam)
      trees.push(streamMessageParam)

      // Call $rhinoCompute
      const res = await this.$rhinoCompute.Grasshopper.evaluateDefinition(this.definition, trees)
      console.log(res)
      await this.collectResults(res)
    },
    decodeItem(item) {
      var data = JSON.parse(item.data)
      if (item.type === 'System.String') {
        // hack for draco meshes
        try {
          var parsedMesh = this.$rhino.DracoCompression.decompressBase64String(data)
          return parsedMesh
        } catch (error) {
          console.log(error)
        } // ignore errors (maybe the string was just a string...)
      } else if (typeof data === 'object') {
        try {
          var geometry = this.$rhino.CommonObject.decode(data)
          return geometry
        } catch (error) {
          console.log(error)
        }
      }
      return null
    },
    async getGrasshoperFile(definitionName) {
      let url = definitionName
      let res = await fetch(url)
      let buffer = await res.arrayBuffer()
      this.definition = new Uint8Array(buffer)
      console.log('definition loaded', this.definition)
    },
    onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.animate()
    },
    setServerAuth() {
      this.$rhinoCompute.authToken = import.meta.env.VITE_COMPUTE_AUTH_TOKEN
      this.$rhinoCompute.url = import.meta.env.VITE_COMPUTE_SERVER_URL
      console.log('auth successful', this.$rhinoCompute)
    },
    animate() {
      requestAnimationFrame(this.animate)
      this.renderer.render(this.scene, this.camera)
    },
    send() {
      this.sendToSpeckle = !this.sendToSpeckle
    },
    async onParamChanged() {
      await this.compute()
    }
  }
}
</script>

<template>
  <main>
    <label class="switch">
      <input value="checkbox" v-model="sendToSpeckle" type="checkbox" />
      <span class="slider round"></span>
    </label>
  </main>
</template>
<style>
/* The switch - the box around the slider */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

.slider:before {
  position: absolute;
  content: '';
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

input:checked + .slider {
  background-color: #2196f3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196f3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>
