import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Rhino3dmLoader } from 'three/examples/jsm/loaders/3DMLoader'
export default function ThreeService() {
  if (THREE != null) this.three = THREE
  if (OrbitControls != null) this.orbitControls = OrbitControls
  if (Rhino3dmLoader != null) this.rhino3dmLoader = Rhino3dmLoader
}
ThreeService.prototype.init = function () {
  // Rhino models are z-up, so set this as the default
  this.three.Object3D.DefaultUp = new this.three.Vector3(0, 0, 1)

  this.scene = new this.three.Scene()
  this.scene.background = new this.three.Color(1, 1, 1)
  this.camera = constructCamera()

  this.renderer = constructRenderer(this)
  document.body.appendChild(this.renderer.domElement)

  // add some controls to orbit the this.camera
  this.controls = constructOrbitControls(this.camera, this.renderer)

  window.addEventListener('resize', this.onWindowResize, false)
  this.animate()
}
function constructRenderer() {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  return renderer
}

function constructOrbitControls(camera, renderer) {
  return new OrbitControls(camera, renderer.domElement)
}

function constructCamera() {
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.x = 100
  camera.position.y = 50
  camera.position.z = 25
  return camera
}
// set the animator
ThreeService.prototype.animate = function () {
  //TODO
  // requestAnimationFrame(this.animate)
  this.renderer.render(this.scene, this.camera)
}
