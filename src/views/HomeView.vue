<!-- eslint-disable no-unused-vars -->

<script>
import { computed, ref } from 'vue'
export default {
  setup(props, context) {
    console.log('Setup')
    const definition = null
    let scene = null
    let camera = null
    let renderer = null
    let doc = null
    return { definition, scene, camera, renderer, doc }
  },
  created() {
    console.log('Created')
  },
  beforeMount() {
    console.log('before Mounted')
    this.setServerAuth()
    this.definition = this.getGrasshoperFile(import.meta.env.VITE_GRASSHOPPER_FILE_PATH)
  },
  async mounted() {
    this.initThree()
    await this.compute()
  },
  methods: {
    collectResults(responseJson) {
      const values = responseJson.values

      // clear doc
      if (this.doc !== undefined) this.doc.delete()

      //console.log(values)
      this.doc = new this.$rhino.File3dm()

      // for each output (RH_OUT:*)...
      for (let i = 0; i < values.length; i++) {
        // ...iterate through data tree structure...
        for (const path in values[i].InnerTree) {
          const branch = values[i].InnerTree[path]
          // ...and for each branch...
          for (let j = 0; j < branch.length; j++) {
            // ...load rhino geometry into doc
            const rhinoObject = this.decodeItem(branch[j])
            if (rhinoObject !== null) {
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
      const loader = new this.$Rhino3dmLoader()
      loader.setLibraryPath('https://unpkg.com/rhino3dm@7.15.0/')

      const resMaterial = new this.$THREE.MeshBasicMaterial({
        vertexColors: true,
        wireframe: true
      })
      // load rhino doc into three.js scene
      const buffer = new Uint8Array(this.doc.toByteArray()).buffer
      loader.parse(buffer, function (object) {
        // add material to resulting meshes
        object.traverse((child) => {
          child.material = resMaterial
        })

        // add object graph from rhino model to three.js scene
        this.scene.add(object)
      })
    },
    initThree() {
      // Rhino models are z-up, so set this as the default
      this.$THREE.Object3D.DefaultUp = new this.$THREE.Vector3(0, 0, 1)

      this.scene = new this.$THREE.Scene()
      this.scene.background = new this.$THREE.Color(1, 1, 1)
      this.camera = new this.$THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      )

      this.camera.position.x = 100
      this.camera.position.y = 50
      this.camera.position.z = 25

      this.renderer = new this.$THREE.WebGLRenderer({ antialias: true })
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      document.body.appendChild(this.renderer.domElement)

      // add some controls to orbit the this.camera
      this.controls = new this.$OrbitControls(this.camera, this.renderer.domElement)

      window.addEventListener('resize', this.onWindowResize, false)

      this.animate()
    },
    async compute() {
      const crvPoints = new this.$rhino.Point3dList()
      crvPoints.add(0, 0, 0)
      crvPoints.add(10, 10, 0)
      crvPoints.add(20, -10, 0)
      crvPoints.add(30, 10, 20)
      crvPoints.add(40, -10, -20)
      crvPoints.add(50, 0, 0)

      const nCrv = this.$rhino.NurbsCurve.create(false, 3, crvPoints)

      const crvData = JSON.stringify(nCrv.encode())

      const param1 = new this.$RhinoCompute.Grasshopper.DataTree('curve')
      param1.append([0], [crvData])

      // clear values
      let trees = []
      trees.push(param1)

      // Call RhinoCompute

      const res = await this.$RhinoCompute.Grasshopper.evaluateDefinition(this.definition, trees)

      console.log(res)

      this.collectResults(res)
    },
    decodeItem(item) {
      const data = JSON.parse(item.data)
      if (item.type === 'System.String') {
        // hack for draco meshes
        try {
          return this.$rhino.DracoCompression.decompressBase64String(data)
        } catch (error) {
          console.log(error)
        } // ignore errors (maybe the string was just a string...)
      } else if (typeof data === 'object') {
        return this.$rhino.CommonObject.decode(data)
      }
      return null
    },
    async getGrasshoperFile(definitionName) {
      let url = definitionName
      let res = await fetch(url)
      let buffer = await res.arrayBuffer()
      return new Uint8Array(buffer)
    },
    onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.animate()
    },
    setServerAuth() {
      this.$RhinoCompute.authToken = import.meta.env.VITE_COMPUTE_AUTH_TOKEN
      this.$RhinoCompute.url = import.meta.env.VITE_COMPUTE_SERVER_URL
    },
    animate() {
      requestAnimationFrame(this.animate)
      this.renderer.render(this.scene, this.camera)
    }
  }
}
</script>

<template>
  <main></main>
</template>
