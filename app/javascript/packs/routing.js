import * as THREE from 'three'
import oc from 'three-orbit-controls'
import * as dat from 'dat.gui'
import * as RoutingHelpers from './routingHelpers' 
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline';

const context = Object.freeze({
    planeMode: Symbol("plane"),
    objectMode: Symbol("object"),
})

const graph_json = JSON.parse(document.getElementById("generator-container").value)

const segments = graph_json["segments"]
// const planeRoutings = graph_json["planes"]
const dimension = 30 // setup from user choice

console.log(graph_json)

const cubeGroup = RoutingHelpers.makeCubeGroup(dimension, segments)
let planes = RoutingHelpers.makePlanes(dimension, segments)

const planeNeighbors = RoutingHelpers.planeNeighbors(planes)


let current = "front"
let switchContext = context.planeMode
let insetWidth
let insetHeight

const canvas = document.querySelector("#router-webgl")
let canvasContainer = document.querySelector(".router-container")
let canvasContainerWidth = canvasContainer.offsetWidth
let canvasContainerHeight = canvasContainer.offsetHeight

const scene = new THREE.Scene()
let camera = new THREE.PerspectiveCamera(70, canvasContainerWidth / canvasContainerHeight, 0.01, 8000)
camera.position.y = 25
// camera.position.z = 25
const light = new THREE.DirectionalLight(0xffffff, 0.8)
light.position.set(0, 0, 0)

let renderer = new THREE.WebGLRenderer({
    alpha: true,
    canvas: canvas
})

let raycaster = new THREE.Raycaster()
let mouse = new THREE.Vector2()
// change this attribute when edit menu is selected
let isRaycastMode = false 

let prevCamera = camera
const camera2 = new THREE.PerspectiveCamera(40, 1, 1, 2000)
let camera2Object = cubeGroup
camera2.position.set(camera.position.x, camera.position.y + 200, camera.position.z)

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(canvasContainerWidth, canvasContainerHeight);

scene.add(camera)
scene.add(light)

// configure dat.gui

const gui = new dat.GUI({
    autoPlace: false
})

// dat.GUI.toggleHide()
const guiTag = document.querySelector('.datGUIRouting')
if (guiTag.value == undefined) {
    guiTag.append(gui.domElement)
    guiTag.value = "added"
}


const viewParams = {
    scaffold_color: 0xff0000,
    staple_color: 0xffff00,
    switchView: () => {
        if (switchContext == context.objectMode) {
        
            controls.enableRotate = false
            cubeGroup.position.z = 2000
            currPlane.position.set(0, 0, 0)
            camera = prevCamera
            controls = new OrbitControls(camera, renderer.domElement)
            switchContext = context.planeMode
            camera.position.y = 25
            scene.add(camera2)    
            
        } else {
            controls.enableRotate = true
            currPlane.position.set(0, 0, 2000)
            cubeGroup.position.z = 0
            console.log(camera)
            prevCamera = camera.clone()
            switchContext = context.objectMode
            camera.position.y = 40
            scene.remove(camera2)
        }
    }
}

const selectionParams = {
    strand: () => {
        isRaycastMode = !isRaycastMode
        console.log("strand selected")
    },

    crossover: () => {
        isRaycastMode = !isRaycastMode

    },
    loopout: () => {
        isRaycastMode = !isRaycastMode

    }
}

const fivePrimeParams = {
    strand: () => {
        isRaycastMode = !isRaycastMode

    },
    domain: () => {
        isRaycastMode = !isRaycastMode

    }
}

const threePrimeParams = {
    strand: () => {
        isRaycastMode = !isRaycastMode

    },
    domain: () => {
        isRaycastMode = !isRaycastMode

    }
}

const otherParams = {
    pencil: () => {
        // isRaycastMode = true

    },

    split: () => {

    },

    insertion: () => {

    },

    deletion: () => {

    }
}

const viewFolder = gui.addFolder("view")
viewFolder.addColor(viewParams, "scaffold_color").name("scaffold color").onChange(() => {material.color.setHex(viewParams.scaffold_color) })
viewFolder.addColor(viewParams, "staple_color").name("staple color")
viewFolder.add(viewParams, "switchView").name("switch view")
viewFolder.closed = false
const selectionFolder = gui.addFolder("selection")
selectionFolder.add(selectionParams, "strand")

selectionFolder.add(selectionParams, "crossover")
selectionFolder.add(selectionParams, "loopout")
selectionFolder.closed = false

const fivePrimeFolder = selectionFolder.addFolder("5'")
const threePrimeFolder = selectionFolder.addFolder("3'")
fivePrimeFolder.add(fivePrimeParams, "strand")
fivePrimeFolder.add(fivePrimeParams, "domain")

threePrimeFolder.add(threePrimeParams, "strand")
threePrimeFolder.add(threePrimeParams, "domain")

const editFolder = gui.addFolder("edit")
editFolder.add(otherParams, "pencil")
editFolder.add(otherParams, "split")
editFolder.add(otherParams, "insertion")
editFolder.add(otherParams, "deletion")
editFolder.closed = false
const OrbitControls = oc(THREE)
let controls = new OrbitControls(camera, renderer.domElement)

if (switchContext == context.planeMode) {
    controls.enableRotate = false
}
let currPlane = planes[0] 
cubeGroup.position.z = 2000
scene.add(cubeGroup)
scene.add(currPlane)


window.addEventListener( 'resize', onWindowResize )
window.addEventListener( 'pointermove', onMouseMove )
onWindowResize()

// DNA scaffold
let scaffoldObjects = []
const material = new MeshLineMaterial();
material.color.setHex(viewParams.scaffold_color)
material.lineWidth = 0.2

// for (let i = 0; i < planeRoutings.length; i++) {
//     const plane = planeRoutings[i]
//     for (let j = 0; j < plane.sets.length; j++) {
//         let set = plane.sets[j]
//         let next = set[0]
//         let e
//         let points = []
//         let line
//         let mesh 
//         for (let w = 0; w < set.edges.length; w++) {
//             e = find_next_edge(next)
//             // draw edge starting with next
//             line = new MeshLine()
//             line.setPoints(points)
//             mesh = new THREE.Mesh(line, material)
//             scene.add(mesh)
//             // reassign next
//             next = e.v2 
//         }
//     }
// }

const planeRoutings = [
    {
        sets: [
            {
                edges: [
                    {
                        v1: {
                            x: 5,
                            y: 0,
                            z: 5
                        }, 
                        v2: {
                            x: 0,
                            y: 0,
                            z: 5
                        }
                    }
                ]
            }
        ]
    },
    {
        sets: [
            {
                edges: [
                    {
                        v1: {
                            x: -5,
                            y: 0,
                            z: 5
                        }, 
                        v2: {
                            x: -5,
                            y: 0,
                            z: 0
                        }
                    },
                    {
                        v1: {
                            x: -5,
                            y: 0,
                            z: 0
                        }, 
                        v2: {
                            x: 0,
                            y: 0,
                            z: 0
                        }
                    }
                ]
            }
        ]
    }
]





let routingGroup = new THREE.Group() 
let currIndex = 0
let prevIndex = currIndex

function addRoutings() {
    if (currIndex != prevIndex) {
        scene.remove(routingGroup)
        routingGroup = new THREE.Group() 
        generateRoutings()
        scene.add(routingGroup)
        prevIndex = currIndex
    } else {
        generateRoutings()
        scene.add(routingGroup)
    }
}
function generateRoutings() {
    const plane = planeRoutings[currIndex]
    
    for (let j = 0; j < plane.sets.length; j++) {
        let set = plane.sets[j]
        let next = set.edges[0].v1
        let e
        let line
        let mesh 
        for (let w = 0; w < set.edges.length; w++) {
            e = find_next_edge(set.edges, next)
            // draw edge starting with next
            line = new MeshLine()
            line.setPoints([vectorize(e.v1), vectorize(e.v2)])
            mesh = new THREE.Mesh(line, material)
            // mesh.raycast = MeshLineRaycast
            scaffoldObjects.push(mesh)
            routingGroup.add(mesh)
            next = e.v2 
        }
    }
}
// addRoutings()
// scaffoldObjects.push(routingGroup)
// scene.add(routingGroup)

function find_next_edge(edges, start) {

    for (let i = 0; i < edges.length; i++) {
        const curr = edges[i]
        if (equalsVector(curr.v1, start)) {
            return curr
        } 
    }
    return null
}

function vectorize(vertex) {
    return new THREE.Vector3(vertex.x, vertex.y, vertex.z)
}



// const trialPoints = []
// for (let z = 1; z < 2; z += 0.01) {
//     trialPoints.push(5-z, 0, -3/z+5)

// }



// const trialLine = new MeshLine()
// trialLine.setPoints(trialPoints)
// const trialMesh = new THREE.Mesh(trialLine, material)
// scene.add(trialMesh) 

const line = new MeshLine()
line.setPoints([vectorize({x: -15, y: 0, z: 0}), vectorize({x: 15, y: 0, z: 0})])
let mesh1 = new THREE.Mesh(line, material)
scene.add(mesh1)

const line2 = new MeshLine()
line2.setPoints([vectorize({x: 0, y: 0, z: 15}), vectorize({x: 0, y: 0, z: -15})])
let mesh2 = new THREE.Mesh(line2, material)
scene.add(mesh2)


function equalsVector(v1, v2) {
    return (v1.x == v2.x && v1.y == v2.y && v1.z == v2.z)
}

function onMouseMove(event) {

    if (!isRaycastMode) {
        return
    }
    // console.log(event.clientX)
    // console.log(( event.clientX / window.innerWidth ) * 2 - 1)
    mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 )

    // raycaster.setFromCamera( pointer, camera )
    // console.log(routingGroup)
    const intersects = raycaster.intersectObjects( scene, false )
    // console.log(intersects)
    // const intersects = raycaster.intersectObjects( scaffold, false )
    // console.log(scaffoldObjects)
    if ( intersects.length > 0 ) {
        console.log("wow")
        const intersect = intersects[ 0 ]

        rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal )
        rollOverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 )

    }

    render()
}

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    const needResize = canvas.width !== width || canvas.height !== height
    if (needResize) {
        renderer.setSize(width, height, false)
    }
    return needResize
}

function onWindowResize() {

    camera.aspect = canvasContainerWidth / canvasContainerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( canvasContainerWidth, canvasContainerHeight );

    insetWidth = canvasContainerHeight / 4
    insetHeight = canvasContainerHeight / 4

    camera2.aspect = insetWidth / insetHeight
    camera2.updateProjectionMatrix()
}

function render(time) {
    renderer.setClearColor( 0x000000, 0 );
    renderer.setViewport( 0, 0, canvasContainerWidth, canvasContainerHeight );
    // matLine.resolution.set( canvasContainerWidth, canvasContainerHeight ); // resolution of the viewport

    time *= 0.001

    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement
        camera.aspect = canvas.clientWidth / canvas.clientHeight
        camera.updateProjectionMatrix()
    }

    renderer.render(scene, camera)
    renderer.setClearColor( 0xf5f5f5, 1 );

    renderer.clearDepth(); // important!

    renderer.setScissorTest( true );

    renderer.setScissor( 20, 20, insetWidth, insetHeight );

    renderer.setViewport( 20, 20, insetWidth, insetHeight );

    if (switchContext == context.planeMode) {
        cubeGroup.rotation.z = time * 0.1


        camera2.position.set(camera2Object.position.x , camera2Object.position.y + 60, camera2Object.position.z)
        camera2.quaternion.copy(camera.quaternion)

        renderer.render( scene, camera2 )

        
    }
    renderer.setScissorTest( false )
    // camera2Object.quaternion.copy(camera.quaternion)


    requestAnimationFrame(render)
}

requestAnimationFrame(render)
renderer.render(scene, camera)

// DOM modifiers
document.getElementById("up-key-button").addEventListener("click", () => {
    scene.remove(currPlane)
    const res = planeNeighbors[current]["up"]
    current = res[0]
    currPlane = res[1]
    currIndex = res[2]
    // addRoutings()
    scene.add(currPlane)
})


document.getElementById("down-key-button").addEventListener("click", () => {
    console.log("down")
    scene.remove(currPlane)
    const res = planeNeighbors[current]["down"]
    current = res[0]
    currPlane = res[1]
    currIndex = res[2]
    // addRoutings()
    scene.add(currPlane)
})


document.getElementById("right-key-button").addEventListener("click", () => {
    scene.remove(currPlane)
    const res = planeNeighbors[current]["right"]
    current = res[0]
    currPlane = res[1]
    currIndex = res[2]
    // addRoutings()
    scene.add(currPlane)
})


document.getElementById("left-key-button").addEventListener("click", () => {
    scene.remove(currPlane)
    const res = planeNeighbors[current]["left"]
    current = res[0]
    currPlane = res[1]
    currIndex = res[2]
    // addRoutings()
    scene.add(currPlane)
})