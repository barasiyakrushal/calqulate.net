"use client"

/**
 * The 3D viewer: a studio-lit stage hosting the procedural MorphingBody, with
 * the camera-view and orbit controls the brief asks for.
 *
 * Studio lighting is done with real lights (key, fill, rim, ambient) plus a
 * soft ContactShadows plane, deliberately NOT drei's <Environment preset>,
 * because that fetches an HDR from a CDN which the app's strict CSP and offline
 * mode would block. This keeps the scene self-contained and privacy-clean.
 */

import { Suspense, useRef, useState, useCallback, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, ContactShadows, Environment, Lightformer, SoftShadows } from "@react-three/drei"
import * as THREE from "three"
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib"
import { MorphingBody } from "./BodyMesh"
import type { BodyProfile } from "@/lib/body-shape/body-profile"
import type { Sex } from "@/lib/body-shape/shapes"
import {
  RotateCw, RotateCcw, ZoomIn, Maximize2, Play, Pause,
} from "lucide-react"

const MODEL_COLOR: Record<Sex, string> = { female: "#E8C9A8", male: "#C3CAD1" }

export type CameraView = "front" | "side" | "back" | "angle"

const VIEWS: Record<CameraView, [number, number, number]> = {
  front: [0, 0.15, 3.2],
  side: [3.2, 0.15, 0.001],
  back: [0, 0.15, -3.2],
  angle: [2.3, 0.5, 2.3],
}

function CameraRig({ view, target }: { view: CameraView; target: React.MutableRefObject<[number, number, number] | null> }) {
  // Set the requested position into a ref the controls animator reads.
  useEffect(() => { target.current = VIEWS[view] }, [view, target])
  return null
}

export function BodyShapeViewer({
  profile,
  sex,
  reducedMotion,
  onMorphStart,
  onMorphEnd,
}: {
  profile: BodyProfile
  sex: Sex
  reducedMotion?: boolean
  onMorphStart?: () => void
  onMorphEnd?: () => void
}) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const desired = useRef<[number, number, number] | null>(null)
  const [view, setView] = useState<CameraView>("angle")
  const [autoRotate, setAutoRotate] = useState(true)
  const [fs, setFs] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  const reset = useCallback(() => {
    setView("angle")
    setAutoRotate(true)
    controlsRef.current?.reset()
  }, [])

  const spin = useCallback((dir: 1 | -1) => {
    const c = controlsRef.current
    if (!c) return
    c.setAzimuthalAngle(c.getAzimuthalAngle() + dir * (Math.PI / 6))
    c.update()
  }, [])

  const toggleFullscreen = useCallback(() => {
    const el = wrapRef.current
    if (!el) return
    if (!document.fullscreenElement) el.requestFullscreen?.().then(() => setFs(true)).catch(() => {})
    else document.exitFullscreen?.().then(() => setFs(false)).catch(() => {})
  }, [])

  useEffect(() => {
    const onFs = () => setFs(Boolean(document.fullscreenElement))
    document.addEventListener("fullscreenchange", onFs)
    return () => document.removeEventListener("fullscreenchange", onFs)
  }, [])

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full overflow-hidden rounded-3xl bg-gradient-to-b from-white to-slate-100 ring-1 ring-slate-200"
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: VIEWS.angle, fov: 40 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        aria-label={`Interactive 3D ${sex} body model`}
      >
        {/* Studio lighting: hemisphere fill + a soft key, with penumbra shadows. */}
        {!reducedMotion && <SoftShadows size={26} samples={12} focus={0.9} />}
        <hemisphereLight args={["#ffffff", "#e2e8f0", 0.55]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[3.5, 6, 4]} intensity={1.15} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} />
        <directionalLight position={[-4, 3, 2]} intensity={0.4} />

        <Suspense fallback={null}>
          {/* Image-based lighting built from soft panels in-scene, so there is no
              HDR to download and nothing leaves the browser. */}
          <Environment resolution={256} frames={1}>
            <color attach="background" args={["#0a0a0a"]} />
            <Lightformer intensity={2.2} position={[0, 3, 3]} scale={[6, 6, 1]} color="#ffffff" />
            <Lightformer intensity={1.1} position={[-4, 1, 2]} scale={[3, 6, 1]} color="#f3f4f6" />
            <Lightformer intensity={1.1} position={[4, 1, 2]} scale={[3, 6, 1]} color="#f3f4f6" />
            <Lightformer intensity={0.8} position={[0, 2, -4]} scale={[6, 4, 1]} color="#e5e7eb" />
          </Environment>

          <group position={[0, -0.05, 0]}>
            <MorphingBody profile={profile} sex={sex} color={MODEL_COLOR[sex]} onMorphStart={onMorphStart} onMorphEnd={onMorphEnd} />
          </group>
          <ContactShadows position={[0, -1.02, 0]} opacity={0.4} scale={5} blur={3} far={2.4} resolution={1024} color="#0f172a" />
        </Suspense>

        <CameraRig view={view} target={desired} />
        <CameraAnimator controlsRef={controlsRef} desired={desired} />

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enablePan
          enableZoom
          autoRotate={autoRotate && !reducedMotion}
          autoRotateSpeed={1.4}
          minDistance={1.8}
          maxDistance={6}
          target={[0, 0.1, 0]}
        />
      </Canvas>

      {/* View buttons (top) */}
      <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
        <div className="pointer-events-auto flex gap-1 rounded-full border border-slate-200 bg-white/90 p-1 shadow-sm backdrop-blur">
          {(["front", "side", "back", "angle"] as CameraView[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => { setAutoRotate(false); setView(v) }}
              aria-pressed={view === v}
              className={`min-h-[36px] rounded-full px-3 text-xs font-bold capitalize transition-colors ${view === v ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              {v === "angle" ? "45°" : v}
            </button>
          ))}
        </div>
      </div>

      {/* Orbit controls (bottom, thumb reach) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 p-1 shadow-sm backdrop-blur">
          <IconBtn label="Rotate left" onClick={() => spin(-1)}><RotateCcw className="h-4 w-4" /></IconBtn>
          <IconBtn label="Rotate right" onClick={() => spin(1)}><RotateCw className="h-4 w-4" /></IconBtn>
          <IconBtn label={autoRotate ? "Stop auto-rotate" : "Auto-rotate 360"} onClick={() => setAutoRotate((s) => !s)} active={autoRotate}>
            {autoRotate ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </IconBtn>
          <IconBtn label="Reset view" onClick={reset}><ZoomIn className="h-4 w-4" /></IconBtn>
          <IconBtn label={fs ? "Exit fullscreen" : "Fullscreen"} onClick={toggleFullscreen}><Maximize2 className="h-4 w-4" /></IconBtn>
        </div>
      </div>
    </div>
  )
}

/** Eases the orbit-controls distance/position toward the requested view. */
function CameraAnimator({
  controlsRef,
  desired,
}: {
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>
  desired: React.MutableRefObject<[number, number, number] | null>
}) {
  const goal = useRef(new THREE.Vector3())
  useFrame(({ camera }) => {
    const c = controlsRef.current
    const d = desired.current
    if (!c || !d) return
    goal.current.set(d[0], d[1], d[2])
    if (camera.position.distanceTo(goal.current) < 0.01) { desired.current = null; return }
    camera.position.lerp(goal.current, 0.12)
    c.update()
  })
  return null
}

function IconBtn({ label, onClick, active, children }: { label: string; onClick: () => void; active?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${active ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-100"}`}
    >
      {children}
    </button>
  )
}
