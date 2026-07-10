"use client"

/**
 * Procedural body mesh, generated from a BodyProfile.
 *
 * There is no GLB to download: the torso, legs and arms are surfaces of
 * revolution-ish tubes, lofted through the elliptical cross-sections the
 * profile defines. Morphing between two bodies is just rebuilding the geometry
 * from an interpolated profile, which is cheap enough to run every frame.
 *
 * Faceless, neutral proportions, soft matte material, per the brief.
 */

import { useEffect, useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { type BodyProfile, type Level, smoothLevels, lerpProfile } from "@/lib/body-shape/body-profile"

/** Duration of the shape morph, seconds (brief 0.8..1.2s in the brief). */
const MORPH_SECONDS = 1.0
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

// Higher radial + ring counts give the smooth topology a scan avatar needs.
const RADIAL = 56
const CM = 0.01 // model units per cm

const gauss = (x: number, mu: number, sigma: number) => Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma))
type Sex = "female" | "male"

/**
 * Cross-section shaper. A plain ellipse reads as a balloon; a real torso is a
 * rounded rectangle (superellipse) that is flatter across the back and sides,
 * with the chest pushed forward and the glutes pushed back at the right
 * heights. `sectionFor` returns, for one anatomical part, a function that maps
 * an angle and the level's half-axes to an (x, z) point with that character.
 */
type Section = (theta: number, a: number, b: number, y: number) => [number, number]

function superellipse(theta: number, a: number, b: number, n: number): [number, number] {
  const ct = Math.cos(theta)
  const st = Math.sin(theta)
  const x = Math.sign(ct) * Math.pow(Math.abs(ct), 2 / n) * a
  const z = Math.sign(st) * Math.pow(Math.abs(st), 2 / n) * b
  return [x, z]
}

function torsoSection(H: number, sex: Sex): Section {
  return (theta, a, b, y) => {
    const f = y / H
    const head = f > 0.83
    const n = head ? 2.05 : 2.5 // rounder head, squircle torso
    let [x, z] = superellipse(theta, a, b, n)
    if (!head) {
      const glute = gauss(f, 0.52, 0.045) * 0.24                     // buttocks, back
      const chest = gauss(f, 0.71, 0.05) * (sex === "female" ? 0.2 : 0.12) // chest / bust, front
      const belly = gauss(f, 0.6, 0.07) * 0.05                       // soft abdomen, front
      if (z > 0) z *= 1 + chest + belly
      else z *= 1 + glute
    }
    return [x, z]
  }
}

function limbSection(H: number, kind: "leg" | "arm"): Section {
  return (theta, a, b, y) => {
    let [x, z] = superellipse(theta, a, b, 2.05)
    if (kind === "leg") {
      const calf = gauss(y / H, 0.15, 0.035) * 0.16 // calf muscle, back
      if (z < 0) z *= 1 + calf
    }
    return [x, z]
  }
}

/**
 * Loft a tube through the levels using `section` for the cross-section shape,
 * finishing open ends with rounded hemispherical caps (rounded shoulders,
 * hands, feet and crown) rather than a pinched cone.
 */
function tubeGeometry(levelsRaw: Level[], rings: number, section: Section, capTop: boolean, capBottom: boolean): THREE.BufferGeometry {
  const levels = smoothLevels(levelsRaw, rings)
  const positions: number[] = []
  const indices: number[] = []

  const emitRing = (y: number, a: number, b: number) => {
    for (let j = 0; j < RADIAL; j++) {
      const theta = (j / RADIAL) * Math.PI * 2
      const [x, z] = section(theta, a, b, y)
      positions.push(x, y * CM, z)
    }
  }

  for (const l of levels) emitRing(l.y, (l.w / 2) * CM, (l.d / 2) * CM)

  const quad = (r0: number, r1: number) => {
    for (let j = 0; j < RADIAL; j++) {
      const jn = (j + 1) % RADIAL
      indices.push(r0 + j, r1 + j, r0 + jn, r0 + jn, r1 + j, r1 + jn)
    }
  }
  for (let i = 0; i < levels.length - 1; i++) quad(i * RADIAL, (i + 1) * RADIAL)

  // Rounded cap: a quarter-ellipsoid of extra rings sharing the section shape.
  const roundedCap = (edge: Level, dir: 1 | -1, firstRingBase: number) => {
    const a0 = (edge.w / 2) * CM
    const b0 = (edge.d / 2) * CM
    const rr = Math.min(a0, b0) * 1.15 // cap height
    const STEPS = 4
    let prevBase = firstRingBase
    for (let k = 1; k <= STEPS; k++) {
      const ang = (k / (STEPS + 1)) * (Math.PI / 2)
      const scale = Math.cos(ang)
      const yy = edge.y + (dir * rr * Math.sin(ang)) / CM
      const base = positions.length / 3
      for (let j = 0; j < RADIAL; j++) {
        const theta = (j / RADIAL) * Math.PI * 2
        const [x, z] = section(theta, a0 * scale, b0 * scale, edge.y)
        positions.push(x, yy * CM, z)
      }
      if (dir === 1) quad(prevBase, base)
      else quad(base, prevBase)
      prevBase = base
    }
    const apex = positions.length / 3
    positions.push(0, (edge.y + (dir * rr) / CM) * CM, 0)
    for (let j = 0; j < RADIAL; j++) {
      const jn = (j + 1) % RADIAL
      if (dir === 1) indices.push(apex, prevBase + j, prevBase + jn)
      else indices.push(apex, prevBase + jn, prevBase + j)
    }
  }

  if (capTop) roundedCap(levels[levels.length - 1], 1, (levels.length - 1) * RADIAL)
  if (capBottom) roundedCap(levels[0], -1, 0)

  const geo = new THREE.BufferGeometry()
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

function buildBodyGeometry(profile: BodyProfile, sex: Sex): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = []
  const torsoS = torsoSection(profile.height, sex)
  const legS = limbSection(profile.height, "leg")
  const armS = limbSection(profile.height, "arm")

  parts.push(tubeGeometry(profile.torso, 96, torsoS, true, false))

  for (const sign of [-1, 1]) {
    const g = tubeGeometry(profile.leg.map((l) => ({ ...l })), 40, legS, false, true)
    g.translate(sign * profile.legOffsetX * CM, 0, 0)
    parts.push(g)

    const ga = tubeGeometry(profile.arm.map((l) => ({ ...l })), 30, armS, true, true)
    ga.translate(sign * profile.armOffsetX * CM, 0, 0)
    parts.push(ga)
  }

  const merged = mergeGeometries(parts)
  parts.forEach((p) => p.dispose())

  // Centre on the origin, standing on y = 0.
  merged.computeBoundingBox()
  const bb = merged.boundingBox!
  const midY = (bb.min.y + bb.max.y) / 2
  merged.translate(0, -midY, 0)
  merged.computeVertexNormals()
  return merged
}

/** Minimal BufferGeometry merge (positions + normals + index), no extra deps. */
function mergeGeometries(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const out = new THREE.BufferGeometry()
  const position: number[] = []
  const index: number[] = []
  let offset = 0
  for (const g of geos) {
    const pos = g.getAttribute("position") as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) position.push(pos.getX(i), pos.getY(i), pos.getZ(i))
    const idx = g.getIndex()!
    for (let i = 0; i < idx.count; i++) index.push(idx.getX(i) + offset)
    offset += pos.count
  }
  out.setAttribute("position", new THREE.Float32BufferAttribute(position, 3))
  out.setIndex(index)
  out.computeVertexNormals()
  return out
}

/**
 * A body that smoothly morphs to `profile` whenever it changes. Geometry is
 * rebuilt imperatively only while the morph is in flight, so an idle model costs
 * nothing per frame.
 */
export function MorphingBody({
  profile,
  sex,
  color,
  selected = true,
  onMorphStart,
  onMorphEnd,
}: {
  profile: BodyProfile
  sex: Sex
  color: string
  selected?: boolean
  onMorphStart?: () => void
  onMorphEnd?: () => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const outlineRef = useRef<THREE.Mesh>(null)

  // Matte skin-like PBR: soft roughness, a whisper of clearcoat sheen and a
  // little env reflection so the studio lighting reads on the surface.
  const material = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.62,
      metalness: 0,
      clearcoat: 0.15,
      clearcoatRoughness: 0.6,
      sheen: 0.25,
      sheenRoughness: 0.8,
      sheenColor: new THREE.Color(color),
      envMapIntensity: 0.85,
    })
    return m
  }, [color])
  const outlineMat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#FBBF24", side: THREE.BackSide }), [])

  const anim = useRef<{ from: BodyProfile; to: BodyProfile; start: number | null; running: boolean }>({
    from: profile, to: profile, start: null, running: false,
  })
  const displayed = useRef<BodyProfile>(profile)

  const setGeometry = (p: BodyProfile) => {
    const geo = buildBodyGeometry(p, sex)
    for (const m of [meshRef.current, outlineRef.current]) {
      if (!m) continue
      const old = m.geometry
      m.geometry = geo
      if (old && old !== geo) old.dispose()
    }
  }

  // Initial build.
  useEffect(() => {
    setGeometry(profile)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Kick off a morph when the target profile changes.
  useEffect(() => {
    anim.current = { from: displayed.current, to: profile, start: null, running: true }
    onMorphStart?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  useFrame((state) => {
    const a = anim.current
    if (!a.running) return
    if (a.start == null) a.start = state.clock.elapsedTime
    const t = Math.min(1, (state.clock.elapsedTime - a.start) / MORPH_SECONDS)
    const p = lerpProfile(a.from, a.to, easeInOut(t))
    displayed.current = p
    setGeometry(p)
    if (t >= 1) {
      a.running = false
      onMorphEnd?.()
    }
  })

  return (
    <group>
      <mesh ref={meshRef} material={material} castShadow receiveShadow />
      <mesh ref={outlineRef} material={outlineMat} scale={1.012} visible={selected} />
    </group>
  )
}
