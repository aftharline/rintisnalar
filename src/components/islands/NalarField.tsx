import { useEffect, useRef } from 'react'
import { Renderer, Camera, Transform, Program, Mesh, Geometry, Vec3 } from 'ogl'

import './NalarField.css'

interface NalarFieldProps {
  /** "light" untuk section terang (cream), "abyss" untuk section gelap (ink) */
  variant?: 'light' | 'abyss'
  /** pengali jumlah partikel, default 1 */
  density?: number
}

// Palette asli Rintis Nalar
const TEAL = [0.059, 0.463, 0.431] // #0F766E
const TEAL_LIGHT = [0.078, 0.639, 0.596] // #14A398
const AMBER = [0.961, 0.62, 0.043] // #F59E0B
const INK = [0.067, 0.094, 0.153] // #111827

const NalarField = ({ variant = 'light', density = 1 }: NalarFieldProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let renderer: Renderer
    try {
      const isMobile = Math.min(window.innerWidth, window.innerHeight) < 640
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 1.75)
      renderer = new Renderer({ dpr, alpha: true, antialias: false })
    } catch {
      return // fallback: biarkan CSS gradient di belakang
    }
    const gl = renderer.gl
    gl.canvas.style.position = 'absolute'
    gl.canvas.style.top = '0'
    gl.canvas.style.left = '0'
    gl.canvas.style.width = '100%'
    gl.canvas.style.height = '100%'
    gl.canvas.style.pointerEvents = 'none'
    container.appendChild(gl.canvas)

    const camera = new Camera(gl, { fov: 45, near: 0.1, far: 60 })
    camera.position.set(0, 0.6, 9)

    const scene = new Transform()
    const isAbyss = variant === 'abyss'

    // ── Lapisan 1: grid horizon futuristik (fullscreen quad, screen-space) ──
    const quadGeometry = new Geometry(gl, {
      position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
      uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
    })
    const gridProgram = new Program(gl, {
      vertex: `
        attribute vec2 position;
        attribute vec2 uv;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        varying vec2 vUv;
        uniform float uTime;
        uniform vec2 uMouse;
        uniform vec3 uTeal;
        uniform vec3 uAmber;
        uniform float uIsAbyss;

        float gridLine(vec2 p, float scale) {
          vec2 g = abs(fract(p * scale - 0.5) - 0.5) / scale;
          float d = min(g.x, g.y);
          return 1.0 - smoothstep(0.0, 0.035, d);
        }

        void main() {
          vec2 uv = vUv;
          // grid hanya menempati dasar section; menghilang sebelum area konten
          float floorTop = 0.42;
          vec3 col = vec3(0.0);
          float alpha = 0.0;

          if (uv.y < floorTop) {
            // lantai perspektif: melekat di dasar layar, hilang menuju floorTop
            float depth = (floorTop - uv.y) / floorTop; // 0 di horizon → 1 di dasar
            float z = pow(depth, 2.0);
            vec2 gp = vec2((uv.x - 0.5 - uMouse.x * 0.05) / (0.28 + z * 2.2), z * 2.6 - uTime * 0.14);
            float line = gridLine(gp, 1.0);
            float fade = smoothstep(0.0, 0.38, depth);
            col += uTeal * line * (0.35 + 0.65 * depth);
            alpha += line * fade * ${isAbyss ? '0.55' : '0.4'};

            // titik cahaya di vanishing point: pulsasi lembut
            vec2 vpOffset = (uv - vec2(0.5, floorTop)) * vec2(2.4, 10.0);
            float pulse = 0.8 + 0.2 * sin(uTime * 1.4);
            float halo = exp(-length(vpOffset) * 2.6) * 0.55 * pulse;
            col += mix(uTeal, uAmber, 0.45) * halo;
            alpha = max(alpha, halo * 0.65);

            // inti amber kecil di vanishing point
            vec2 coreOffset = (uv - vec2(0.5, floorTop)) * vec2(7.0, 30.0);
            float core = exp(-length(coreOffset) * 3.2) * pulse;
            col = mix(col, uAmber, core * 0.9);
            alpha = max(alpha, core * 0.85);
          } else {
            // area konten: nyaris bersih, hanya vignette samar ke atas
            float up = (uv.y - floorTop) / (1.0 - floorTop);
            alpha += up * 0.04;
            col += uTeal * up * 0.06;
          }

          gl_FragColor = vec4(col, alpha * uIsAbyss);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new Vec3() },
        uTeal: { value: new Vec3(...(isAbyss ? TEAL_LIGHT : TEAL)) },
        uAmber: { value: new Vec3(...AMBER) },
        uIsAbyss: { value: isAbyss ? 1.0 : 0.55 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    })
    const quad = new Mesh(gl, { geometry: quadGeometry, program: gridProgram })
    quad.setParent(scene)

    // ── Lapisan 2: partikel 3D melayang naik (metafora merintis) ──
    const smallScreen = Math.min(container.clientWidth, container.clientHeight) < 560
    const COUNT = Math.round((smallScreen ? 90 : 190) * density)
    const positions = new Float32Array(COUNT * 3)
    const colors = new Float32Array(COUNT * 3)
    const seeds = new Float32Array(COUNT * 2)
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16
      positions[i * 3 + 1] = (Math.random() - 0.5) * 9
      positions[i * 3 + 2] = -Math.random() * 10
      const pick = Math.random()
      const c = pick < 0.62 ? (pick < 0.31 ? TEAL : TEAL_LIGHT) : pick < 0.85 ? AMBER : INK
      colors[i * 3] = c[0]
      colors[i * 3 + 1] = c[1]
      colors[i * 3 + 2] = c[2]
      seeds[i * 2] = Math.random() * Math.PI * 2
      seeds[i * 2 + 1] = 0.4 + Math.random() * 1.2
    }
    const pointsGeometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      aColor: { size: 3, data: colors },
      aSeed: { size: 2, data: seeds },
    })
    const pointsProgram = new Program(gl, {
      vertex: `
        attribute vec3 position;
        attribute vec3 aColor;
        attribute vec2 aSeed;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uDPR;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vec3 p = position;
          p.x += sin(uTime * 0.3 + aSeed.x) * 0.45;
          // naik perlahan dan wrap, memudar di tepi agar pop tak terlihat
          p.y = mod(p.y + 4.5 + uTime * 0.14 * aSeed.y, 9.0) - 4.5;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          float depth = clamp(1.0 + mv.z / 12.0, 0.15, 1.0);
          gl_PointSize = (1.8 + aSeed.y * 2.6) * uDPR * depth;
          vColor = aColor;
          vAlpha = (0.3 + depth * 0.5) * smoothstep(4.5, 3.6, abs(p.y));
        }
      `,
      fragment: `
        precision highp float;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float uIsAbyss;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          float sprite = smoothstep(0.5, 0.05, d);
          gl_FragColor = vec4(vColor, sprite * vAlpha * uIsAbyss);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uDPR: { value: renderer.dpr },
        uIsAbyss: { value: isAbyss ? 0.9 : 0.6 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    })
    const points = new Mesh(gl, { geometry: pointsGeometry, program: pointsProgram, mode: gl.POINTS })
    points.setParent(scene)

    function resize() {
      const w = container!.clientWidth
      const h = container!.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h)
      camera.perspective({ aspect: w / h })
    }
    let resizeRaf = 0
    const onResize = () => {
      cancelAnimationFrame(resizeRaf)
      resizeRaf = requestAnimationFrame(resize)
    }
    window.addEventListener('resize', onResize)
    resize()

    // ── mouse parallax (lerp halus) ──
    const mouseTarget = new Vec3()
    const mouseSmooth = new Vec3()
    const onMouse = (e: MouseEvent) => {
      mouseTarget.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1, 0)
    }
    window.addEventListener('mousemove', onMouse, { passive: true })

    // ── render loop dengan pause offscreen ──
    let frameId = 0
    let visible = true
    let running = true
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible && running && !frameId) {
          lastTime = performance.now()
          frameId = requestAnimationFrame(update)
        }
      },
      { threshold: 0 },
    )
    io.observe(container)

    const onVisibility = () => {
      running = !document.hidden
      if (running && visible && !frameId) {
        lastTime = performance.now()
        frameId = requestAnimationFrame(update)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    let lastTime = performance.now()
    let elapsed = 0
    function update(now: number) {
      frameId = 0
      if (!visible || !running) return
      frameId = requestAnimationFrame(update)
      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now
      elapsed += dt

      mouseSmooth.lerp(mouseTarget, 1 - Math.pow(0.001, dt))
      camera.position.x = mouseSmooth.x * 0.7
      camera.position.y = 0.6 - mouseSmooth.y * 0.25
      camera.lookAt([0, -0.4, 0])

      gridProgram.uniforms.uTime.value = elapsed
      gridProgram.uniforms.uMouse.value.copy(mouseSmooth)
      pointsProgram.uniforms.uTime.value = elapsed

      renderer.render({ scene, camera })
    }
    frameId = requestAnimationFrame(update)

    return () => {
      cancelAnimationFrame(frameId)
      frameId = 0
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouse)
      cancelAnimationFrame(resizeRaf)
      if (gl.canvas && gl.canvas.parentNode === container) {
        container.removeChild(gl.canvas)
      }
      try {
        gl.getExtension('WEBGL_lose_context')?.loseContext()
      } catch {
        /* abaikan */
      }
    }
  }, [variant, density])

  return <div ref={containerRef} className="nalarfield-container" aria-hidden="true" />
}

export default NalarField
