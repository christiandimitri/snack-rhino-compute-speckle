import { ref } from 'vue'
export function RhinoServices() {
  const url = ref('')
  const definition = ref()
  function getAuth(key) {
    url.value = localStorage[key]
    if (url.value === undefined) {
      const prompt = key.includes('URL') ? 'Server URL' : 'Server API Key'
      url.value = window.prompt('RhinoCompute ' + prompt)
      if (url.value !== null) {
        localStorage.setItem(key, url.value)
      }
    }
  }
  async function sourceGrasshoperFile(definitionName) {
    // source a .gh / .ghx file in the same directory
    let url = definitionName
    let res = await fetch(url)
    let buffer = await res.arrayBuffer()
    definition.value = new Uint8Array(buffer)
  }

  return {
    url,
    definition,
    getAuth,
    sourceGrasshoperFile
  }
}
