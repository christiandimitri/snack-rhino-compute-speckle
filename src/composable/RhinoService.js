/* eslint-disable no-unused-vars */
export default function RhinoService(rhinoCompute, rhino) {
  this.rhinoCompute = rhinoCompute
  this.rhino = rhino
  this.setServerAuth()
}
RhinoService.prototype.setServerAuth = function () {
  this.rhinoCompute.authToken = import.meta.env.VITE_COMPUTE_AUTH_TOKEN
  this.rhinoCompute.url = import.meta.env.VITE_COMPUTE_SERVER_URL
  console.log('auth successful', this.rhinoCompute)
}
RhinoService.prototype.getGrasshoperFile = async function () {
  let url = import.meta.env.VITE_GRASSHOPPER_FILE_PATH
  let res = await fetch(url)
  let buffer = await res.arrayBuffer()
  this.grasshopperDefinition = new Uint8Array(buffer)
}
RhinoService.prototype.computeGrasshopperDefinition = async function (sendToSpeckle) {
  const trees = ConstructParameters(sendToSpeckle, this.rhinoCompute)
  const grasshopperDefinition = this.grasshopperDefinition
  return new Promise((resolve) => {
    resolve(this.rhinoCompute.Grasshopper.evaluateDefinition(grasshopperDefinition, trees))
  })
}
function ConstructParameters(sendToSpeckle, rhinoCompute) {
  const streamToggle = sendToSpeckle
  const streamToggleParam = new rhinoCompute.Grasshopper.DataTree('streamToggle')
  streamToggleParam.append([0], [streamToggle])
  const streamUrl = import.meta.env.VITE_SPECKLE_STREAM_URL
  const streamIdParam = new rhinoCompute.Grasshopper.DataTree('streamId')
  streamIdParam.append([1], [streamUrl])
  const streamMessage = 'This data is sent from the rhino.compute in the vite app'
  const streamMessageParam = new rhinoCompute.Grasshopper.DataTree('streamMessage')
  streamMessageParam.append([2], [streamMessage])

  // clear values
  let trees = []
  // trees.push(param1)
  trees.push(streamToggleParam)
  trees.push(streamIdParam)
  trees.push(streamMessageParam)
  return trees
}
