import { Canvas, useFrame } from '@react-three/fiber'
import { Stats, OrbitControls, Environment } from '@react-three/drei'
import { useControls, button } from 'leva'
import { Suspense, useMemo, useRef } from 'react'
import TWEEN from '@tweenjs/tween.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

// Component for controlling cube rotations
function Buttons({ cubeGroup }) {
  const rotationGroup = useRef()

  // Leva controls for rotating different parts of the cube
  useControls('Cube', {
    'Left CW': button(() => rotate(cubeGroup.current, rotationGroup.current, 'x', -0.5, 1)),
    'Left CCW': button(() => rotate(cubeGroup.current, rotationGroup.current, 'x', -0.5, -1)),
    'Right CW': button(() => rotate(cubeGroup.current, rotationGroup.current, 'x', 0.5, -1)),
    'Right CCW': button(() => rotate(cubeGroup.current, rotationGroup.current, 'x', 0.5, 1)),
    'Back CW': button(() => rotate(cubeGroup.current, rotationGroup.current, 'z', -0.5, 1)),
    'Back CCW': button(() => rotate(cubeGroup.current, rotationGroup.current, 'z', -0.5, -1)),
    'Front CW': button(() => rotate(cubeGroup.current, rotationGroup.current, 'z', 0.5, -1)),
    'Front CCW': button(() => rotate(cubeGroup.current, rotationGroup.current, 'z', 0.5, 1)),
    'Top CW': button(() => rotate(cubeGroup.current, rotationGroup.current, 'y', 0.5, -1)),
    'Top CCW': button(() => rotate(cubeGroup.current, rotationGroup.current, 'y', 0.5, 1)),
    'Bottom CW': button(() => rotate(cubeGroup.current, rotationGroup.current, 'y', -0.5, 1)),
    'Bottom CCW': button(() => rotate(cubeGroup.current, rotationGroup.current, 'y', -0.5, -1)),
  })

  return <group ref={rotationGroup} />
}

// Main cube component
function Cube() {
  const ref = useRef()

  // Memoize geometry to avoid recreating it on each render
  const roundedBoxGeometry = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 3, 0.1), [])

  // Update TWEEN animations on each frame
  useFrame(() => TWEEN.update())

  return (
    <>
      <group ref={ref}>
        {/* Create 3x3x3 grid of cubelets */}
        {Array.from({ length: 3 }, (_, x) =>
          Array.from({ length: 3 }, (_, y) =>
            Array.from({ length: 3 }, (_, z) => (
              <Cubelet key={`${x}-${y}-${z}`} position={[x - 1, y - 1, z - 1]} geometry={roundedBoxGeometry} />
            ))
          )
        )}
      </group>
      <Buttons cubeGroup={ref} />
    </>
  )
}

// Predefined colors for cubelet sides
const colorSides = [
  [0, 1, 'darkorange'], 
  [0, -1, 'red'], 
  [1, 1, 'white'], 
  [1, -1, 'yellow'], 
  [2, 1, 'green'], 
  [2, -1, 'blue'] 
]

// Cubelet component
function Cubelet({ position, geometry }) {
  return (
    <mesh position={position} geometry={geometry}>
      {/* Assign colors to each side of the cubelet */}
      {colorSides.map(([axis, value, color], i) => (
        <meshStandardMaterial
          key={i}
          attach={`material-${i}`}
          color={position[axis] === value ? color : 'black'}
        />
      ))}
    </mesh>
  )
}

// Reset cube group to original state
function resetCubeGroup(cubeGroup, rotationGroup) {
  rotationGroup.children.slice().reverse().forEach((c) => cubeGroup.attach(c))
  rotationGroup.quaternion.set(0, 0, 0, 1)
}

// Attach cubelets to the rotation group based on the axis and limit
function attachToRotationGroup(cubeGroup, rotationGroup, axis, limit) {
  cubeGroup.children
    .filter((c) => (limit < 0 ? c.position[axis] < limit : c.position[axis] > limit))
    .forEach((c) => rotationGroup.attach(c))
}

// Animate the rotation of the rotation group
function animateRotationGroup(rotationGroup, axis, multiplier) {
  new TWEEN.Tween(rotationGroup.rotation)
    .to({ [axis]: rotationGroup.rotation[axis] + Math.PI / 2 * multiplier }, 250)
    .easing(TWEEN.Easing.Cubic.InOut)
    .start()
}

// Rotate the selected part of the cube
function rotate(cubeGroup, rotationGroup, axis, limit, multiplier) {
  if (TWEEN.getAll().length === 0) {
    resetCubeGroup(cubeGroup, rotationGroup)
    attachToRotationGroup(cubeGroup, rotationGroup, axis, limit)
    animateRotationGroup(rotationGroup, axis, multiplier)
  }
}

// Main App component
export default function App() {
  return (
    <Canvas camera={{ position: [3, 3, 3] }}>
      <Suspense fallback={null}>
        <Environment preset="forest" />
      </Suspense>
      <Cube />
      <OrbitControls target={[0, 0, 0]} />
      <Stats />
    </Canvas>
  )
}
