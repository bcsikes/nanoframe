import * as THREE from "three";
import oc from "three-orbit-controls";
import { Line2 } from "./threejs/Line2";
import { LineMaterial } from "./threejs/LineMaterial";
import { LineGeometry } from "./threejs/LineGeometry";

if (signOutBtn != null || boxState != null) {
  let size = 1;
  let visualize = true;
  if (generatorSize != null) {
    size = parseInt(generatorSize.value);
    visualize = false;
  }
  let insetWidth, insetHeight, camera2;
  let firstStartPoint, firstEndPoint, lastStartPoint, lastEndPoint;
  let id, segments, scaffold_length;
  let canvas, zoomUpdate;
  let line0, line1, line2, line3, line4, line5, line6, line7;
  let canvasContainer, canvasContainerWidth, canvasContainerHeight;
  let routingColors;
  let isInterpolated;
  let isSplit;
  let sequence = [];

  
  let linearGroup = new THREE.Group();
  linearGroup.name = "Linear";
  let interpolatedGroup = new THREE.Group();
  interpolatedGroup.name = "Interpolated";
  
  let splitLinearGroup = new THREE.Group();
  splitLinearGroup.name = "Linear Open";

  let splitInterpolatedGroup = new THREE.Group();
  splitInterpolatedGroup.name = "Interpolated Open";

  let currentGroup;

  let toggle = 0;
  let sphereInter;
  let globalPositions;
  let matLine = new LineMaterial({
    color: 0xffffff,
    linewidth: 5,
    vertexColors: true,
    dashed: false,
    alphaToCoverage: true,
  });

  let matLineBasic = new THREE.LineBasicMaterial({
    vertexColors: true,
  });
  const clock = new THREE.Clock();
  const OrbitControls = oc(THREE);
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  for (let i = 0; i < scaffold_length; i++) {
    if (i % 2 == 0) {
      sequence.push("T");
    } else if (i % 3 == 0) {
      sequence.push("C");
    } else {
      sequence.push("G");
    }
  }

  function adjustSplitPosition(points) {
    for (let i = 1; i < points.length; i += 3) {
      points[i] += 30;
      points[i+1] += 10;
    }
    return points;
  }

  function generateDisplay(
    positions = linear_points,
    type = "linear",
    colors = colors,
    split = false,
    fullDisplay = true
  ) {
    if (!fullDisplay) {
      positions = positions.concat(positions).slice(start, end);
      if (!residualEdges) {
        firstStartPoint = positions.slice(0, 3);
        firstEndPoint = positions.slice(-3);
      } else {
        lastStartPoint = positions.slice(0, 3);
        lastEndPoint = positions.slice(-3);
      }
    }

    if (fullDisplay) {
      routingColors = colors;
    } else {
      colors = findColorSequnece(start, positions.length, divisions);
    }

    if (split && (positions.length > linear_points.length / 2 || positions.length > interpolated_points.length / 2)) {
      positions = adjustSplitPosition(positions);
    }

    const geometry = new LineGeometry();
    geometry.setPositions(positions);
    // console.log(colors.length)
    geometry.setColors(colors);

      line0 = new Line2(geometry, matLine);

      // const geo = new THREE.BufferGeometry();
      // geo.setAttribute(
      //   "position",
      //   new THREE.Float32BufferAttribute(positions, 3)
      // );
      // geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
      // line1 = new THREE.Line(geo, matLineBasic);
      // line1.computeLineDistances();
      // line1.visible = false;
    // console.log(line0.geometry.attributes.instanceColorStart.data.array)
      if (fullDisplay) {
        if (type === "linear") {
          let _ = split ? splitLinearGroup.add(line0) : linearGroup.add(line0);
        } else if (type == "interpolated") {
          let _ = split ? splitInterpolatedGroup.add(line0) : interpolatedGroup.add(line0);
        }
      }

      if (split && (positions.length < linear_points.length / 2 || positions.length < interpolated_points.length / 2)) {
        line0.geometry.center()
      }
  }

  function updateDisplay(scene) {
    scene.remove(currentGroup);
    
    if (isInterpolated) {
      currentGroup = isSplit ? splitInterpolatedGroup : interpolatedGroup;
      scene.add(currentGroup);
    } else {
      currentGroup = isSplit ? splitLinearGroup : linearGroup;
      scene.add(currentGroup);
    }
  }

  /**
   *
   * @param {*} start
   * @param {*} length
   * @returns
   */
  function findColorSequnece(start, length) {
    let count = 0;
    let modIndex;
    let subarray = [];
    let adjStart = start * 12 * 3;
    for (let i = adjStart; count < length; i++, count++) {
      modIndex = i % routingColors.length;
      subarray.push(routingColors[modIndex]);
    }
    return subarray;
  }

  /**
   *
   * @param {*} scene
   */
  function connectEnds(scene) {
    let [positions, colors] = getCurvePoints(lastStartPoint, firstEndPoint);
    // let colors = Array(30).fill(0.5)
    let geometry = new LineGeometry();
    geometry.setPositions(positions);
    geometry.setColors(colors);
    line4 = new Line2(geometry, matLine);
    line4.computeLineDistances();
    line4.scale.set(1, 1, 1);
    scene.add(line4);
    let geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    line5 = new THREE.Line(geo, matLineBasic);
    scene.add(line5);

    let [positions2, colors2] = getCurvePoints(lastEndPoint, firstStartPoint);
    geometry = new LineGeometry();
    geometry.setPositions(positions2);
    geometry.setColors(colors2);

    line6 = new Line2(geometry, matLine);
    line6.computeLineDistances();
    line6.scale.set(1, 1, 1);
    scene.add(line6);
    geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions2, 3)
    );
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors2, 3));
    line7 = new THREE.Line(geo, matLineBasic);
    scene.add(line7);
  }

  function getCurvePoints(start, end) {
    let positions = [];
    let colors = [];
    const divisions = 96;
    const point = new THREE.Vector3();
    const spline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(start[0], start[1], start[2]),
      new THREE.Vector3(end[0], end[1], end[2]),
    ]);
    for (let i = 0, l = divisions; i < l; i++) {
      const t = i / l;
      spline.getPoint(t, point);
      positions.push(
        point.x + (Math.random() - 0.5),
        point.y + (Math.random() - 0.5),
        point.z + (Math.random() - 0.5)
      );
      colors.push(t, 0.5, t);
    }

    return [positions, colors];
  }
  let linear_points, interpolated_points;
  let start, end;
  let colors, staples_colors;

  for (let i = 0; i < size; i++) {
    if (!visualize) {
      id = document.getElementById("index-" + i.toString()).value;
      canvas = document.getElementById("webgl-public-" + id);
    } else {
      canvas = document.getElementById("visualize-webgl");
    }

    scaffold_length = graph_json["scaffold_length"];
    segments = graph_json["segments"];

    canvasContainer = document.querySelector(".canvas-container");
    canvasContainerWidth = canvasContainer.offsetWidth;
    canvasContainerHeight = canvasContainer.offsetHeight;

    let renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvasContainerWidth, canvasContainerHeight);

    let scene = new THREE.Scene();

    let camera = new THREE.PerspectiveCamera(
      40,
      canvasContainerWidth / canvasContainerHeight,
      1,
      1000
    );
    camera.position.set(-40, 60, 90);
    if (visualize) {
      camera2 = new THREE.PerspectiveCamera(40, 1, 1, 1000);
      camera2.position.copy(camera.position);
    }

    linear_points = graph_json["linear_points"];
    globalPositions = linear_points;
    interpolated_points = graph_json["interpolated_points"];
    colors = graph_json["colors"];
    staples_colors = graph_json["staple_colors"];
    start = graph_json["start"];
    end = graph_json["end"];
    // console.log(colors)
    let doubleLinearPoints = linear_points.concat(linear_points);
    let doubleInterpolatedPoints = interpolated_points.concat(interpolated_points);
    let doubleColors = colors.concat(colors);
    // console.log(colors)
    generateDisplay(linear_points, "linear", colors);
    generateDisplay(interpolated_points, "interpolated", colors);

    let group1LinearPoints = doubleLinearPoints.slice(start * 3, end * 3);
    let group2LinearPoints = doubleLinearPoints.slice(end * 3, linear_points.length + start * 3);

    generateDisplay(group1LinearPoints, "linear", doubleColors.slice(start * 3, end * 3), true);
    generateDisplay(group2LinearPoints, "linear", doubleColors.slice(end * 3, linear_points.length + start * 3), true);

    let group1InterpolatedPoints = doubleInterpolatedPoints.slice(start * 3, end * 3)
    let group2InterpolatedPoints = doubleInterpolatedPoints.slice(end * 3, interpolated_points.length + start * 3);

    generateDisplay(group1InterpolatedPoints, "interpolated", doubleColors.slice(start * 3, end * 3), true);
    generateDisplay(group2InterpolatedPoints, "interpolated", doubleColors.slice(end * 3, interpolated_points.length + start * 3), true);

    
    let stapleLinearGroup = new THREE.Group();
    let stapleInterpolatedGroup = new THREE.Group();
    stapleLinearGroup.visible = false;
    stapleInterpolatedGroup.visible = false;

    generateStapleGroup(staples.linear, stapleLinearGroup);
    generateStapleGroup(staples.interpolated, stapleInterpolatedGroup); // TODO Fix

    linearGroup.add(stapleLinearGroup);
    interpolatedGroup.add(stapleInterpolatedGroup);
    // interpolatedGroup.add(stapleGroup)
    new THREE.Box3()
      .setFromObject(linearGroup)
      .getCenter(linearGroup.position)
      .multiplyScalar(-1);
    new THREE.Box3()
      .setFromObject(interpolatedGroup)
      .getCenter(interpolatedGroup.position)
      .multiplyScalar(-1);
    currentGroup = linearGroup;
    scene.add(currentGroup);


    let controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 10;
    controls.maxDistance = 5000;
    // controls.enableZoom = false

    window.addEventListener("resize", onWindowResize);
    canvas.addEventListener("wheel", onZoom);
    document.addEventListener("pointermove", onPointerMove);
    onWindowResize();

    const sphereGeometry = new THREE.SphereGeometry(
      controls.target.distanceTo(controls.object.position) * 0.005
    );
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    sphereInter = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereInter.visible = false;
    scene.add(sphereInter);

    requestAnimationFrame(render);



    function generateStapleGroup(staples, group) {
      let pointer = 0
      for (let i = 0; i < staples.length; i++) {
        if (pointer > staples_colors.length) continue; // TODO fix for interpolated
        let staple_points = staples[i];
        let staple_colors = staples_colors.slice(pointer, pointer + staples[i].length); //Array(staples[i].length).fill(0);
        
        pointer += staples[i].length;
        let geometry = new LineGeometry();
        geometry.setPositions(staple_points);
        geometry.setColors(staple_colors);

        let staple_line = new Line2(geometry, matLine);

        camera.lookAt(staple_line.position);

        let staple_geo = new THREE.BufferGeometry();
        staple_geo.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(staple_points, 3)
        );
        staple_geo.setAttribute(
          "color",
          new THREE.Float32BufferAttribute(staple_colors, 3)
        );
        let staple_line1 = new THREE.Line(staple_geo, matLineBasic);
        staple_line1.computeLineDistances();
        staple_line1.visible = false;
        group.add(staple_line);
        // scene.add(staple_line1)
      }
    }

    function onZoom(event) {
      zoomUpdate = true;
    }

    function onPointerMove(e) {
      // const rect = canvas.getBoundingClientRect()
      // mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      // mouse.y = -((event.clientY - rect.top) / rect.height) * 2 - 1
      
      const rect = e.target.getBoundingClientRect();
      // console.log(rect.top, e.clientY)
      const x = ((e.clientX) / window.innerWidth) * 2 - 1;
      const y = -((e.clientY) / window.innerHeight) * 2 + 1;
      mouse.x = x //(event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = y //-(event.clientY / window.innerHeight) * 2 + 1;
    }

    function onWindowResize() {
      camera.aspect = canvasContainerWidth / canvasContainerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvasContainerWidth, canvasContainerHeight);

      if (visualize) {
        insetWidth = canvasContainerHeight / 4;
        insetHeight = canvasContainerHeight / 4;
        camera2.aspect = insetWidth / insetHeight;
        camera2.updateProjectionMatrix(line1);
      }
    }

    function findIndex(pos) {
      let min = Infinity;
      let idx = null;
      for (let i = 0; i < globalPositions.length; i += 3) {
        let temp =
          Math.abs(pos.x - globalPositions[i]) +
          Math.abs(pos.y - globalPositions[i + 1]) +
          Math.abs(pos.z - globalPositions[i + 2]);
        if (temp < min) {
          min = temp;
          idx = Math.floor(i / 3);
        }
      }
      return idx;
    }

    function render() {
      renderer.setClearColor(0x000000, 0);
      renderer.setViewport(0, 0, canvasContainerWidth, canvasContainerHeight);
      matLine.resolution.set(canvasContainerWidth, canvasContainerHeight); // resolution of the viewport
      renderer.render(scene, camera);

      if (visualize) {
        // console.log(mouse)
        raycaster.setFromCamera(mouse, camera);
        // raycaster.set(controls.position, controls.getDirection(), 0, 40)
        // let x = line0.raycast(raycaster, globalPositions)
        const intersections = raycaster.intersectObject(currentGroup, true);
        // let intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null
        if (intersections.length > 0) {
          if (zoomUpdate) {
            sphereInter.geometry.dispose()
            sphereInter.geometry = new THREE.SphereGeometry(
              controls.target.distanceTo(controls.object.position) * 0.005
            );
            zoomUpdate = false;
          }
          sphereInter.visible = true;
          sphereInter.position.copy(intersections[0].point);
          const line = intersections[0].object;
          // console.log(line.raycast(raycaster, intersections))
          // console.log(line)
          const idx = findIndex(intersections[0].point);
          const colorsCopy = [...colors]
          colorsCopy[colors[idx * 3]] = 0;
          colorsCopy[colors[idx * 3 + 1]] = 0;
          colorsCopy[colors[idx * 3 + 2]] = 0;
          // line.geometry.setPositions(colorsCopy);
          // console.log(intersections[ 0 ].object)
          // console.log()
          if (idx != null) {
            document.querySelector(".sequence-base").value = sequence[idx];
            document.querySelector(".sequence-id").value = idx;
            // document.querySelector(".sequnce-name").innerHTML = "Base selection: " + sequence[idx] + "\n" + "Index: " + idx
          }
        } else {
          sphereInter.visible = false;
        }

        renderer.setClearColor(0xf5f5f5, 1);
        renderer.clearDepth();
        renderer.setScissorTest(true);
        renderer.setScissor(20, 20, insetWidth, insetHeight);
        renderer.setViewport(20, 20, insetWidth, insetHeight);
        camera2.position.copy(camera.position);
        camera2.quaternion.copy(camera.quaternion);
        matLine.resolution.set(insetWidth, insetHeight);
        renderer.render(scene, camera2);
        renderer.setScissorTest(false);
      }
      toggle += clock.getDelta();
      requestAnimationFrame(render);
    }
    if (visualize) {
      const box = document.getElementById("box-state");
      const boxLabel = document.getElementById("box-state-label");
      const stapleToggler = document.getElementById("box-state-staples");
      const stapleTogglerLabel = document.getElementById("box-state-staples-label");
      const interpolationToggler = document.getElementById(
        "box-state-interpolated"
      );

      box.addEventListener("click", () => {
        if (box.checked) {
          boxLabel.innerHTML = "Close Form";
          scene.remove(currentGroup);
          isSplit = true;
          // console.log(splitLinearGroup)
          currentGroup = isInterpolated ? splitInterpolatedGroup : splitLinearGroup;
          scene.add(currentGroup)

        } else {
          boxLabel.innerHTML = "Open Form";
          isSplit = false;
          scene.remove(currentGroup);
          currentGroup = isInterpolated ? interpolatedGroup : linearGroup;
          scene.add(currentGroup);
        }
      });

      stapleToggler.addEventListener("click", () => {
        if (stapleToggler.checked) {
          stapleTogglerLabel.innerHTML = "Hide Staples";
        } else {
          stapleTogglerLabel.innerHTML = "Show Staples";
        }

        if (isInterpolated) {
          stapleInterpolatedGroup.visible = !stapleInterpolatedGroup.visible;
        } else {
          stapleLinearGroup.visible = !stapleLinearGroup.visible;
        }
      });

      interpolationToggler.addEventListener("click", () => {
        isInterpolated = !isInterpolated;
        updateDisplay(scene);
      });
    }
  }
}
