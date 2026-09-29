interface LandscapeData {
  version: number
  width: number
  height: number
  count: number
  stride: number
  duration: number
  leadIn: number
  sweep: number
  randomLatency: number
  settleRadius: number
  end: number
  ridgeStep: number
  ridge: number[]
}

const vertexSource = `#version 300 es
precision highp float;
layout(location=0) in vec2 a_start;
layout(location=1) in vec2 a_control;
layout(location=2) in vec2 a_end;
layout(location=3) in vec4 a_paint;
layout(location=4) in vec2 a_randomClip;
uniform vec2 u_viewport;
uniform vec2 u_offset;
uniform float u_scale;
uniform float u_pixel;
uniform float u_time;
uniform float u_duration;
uniform float u_leadIn;
uniform float u_sweep;
uniform float u_randomLatency;
uniform vec3 u_settle;
out vec2 v_position;
flat out vec2 v_start;
flat out vec2 v_control;
flat out vec2 v_end;
flat out vec4 v_color;
flat out float v_radius;
flat out float v_clip;
const vec2 corners[6] = vec2[6](
  vec2(0,0),vec2(1,0),vec2(0,1),vec2(0,1),vec2(1,0),vec2(1,1)
);
void main() {
  // Normalize to the visible screen, including the cover crop, not SVG corners.
  vec2 center = (a_start + 2.0 * a_control + a_end) * 0.25;
  vec2 radial = (center * u_scale + u_offset - u_viewport * 0.5) / max(length(u_viewport) * 0.5, 1.0);
  float undulation = 0.035 * sin(3.14159265 * radial.x) * sin(4.71238898 * radial.y);
  float distance = clamp(length(radial) + undulation, 0.0, 1.0);
  float accelerating = distance * (1.5 - 0.25 * distance - 0.25 * distance * distance);
  // Match velocity at the join; only the outermost 12% eases gently to rest.
  float arrival = distance <= u_settle.x
    ? accelerating * u_settle.z / u_settle.y
    : u_settle.z + (1.0 - u_settle.z) * (1.0 - sqrt(max(0.0, (1.0 - distance) / (1.0 - u_settle.x))));
  // Strokes may lag behind the wave, never jump ahead. Keep the same end time.
  float latency = a_randomClip.x * u_randomLatency * sin(3.14159265 * arrival);
  float delay = u_leadIn + min(u_sweep, u_sweep * arrival + max(0.0, latency));
  float t = clamp((u_time - delay) / u_duration, 0.0, 1.0);
  // Zero velocity and acceleration at both ends: gently swell, then settle.
  float growth = t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  // The quadratic's midpoint tangent is parallel to its endpoint difference.
  vec2 tangentDelta = a_end - a_start;
  vec2 tangent = tangentDelta / max(length(tangentDelta), 0.00001);
  vec2 radialDirection = radial / max(length(radial), 0.00001);
  float radialAlignment = dot(tangent, radialDirection);
  // Screen Y points down. Offset clockwise so settling moves counterclockwise.
  vec2 clockwise = vec2(-radialDirection.y, radialDirection.x);
  float originSign = dot(tangent, clockwise) >= 0.0 ? 1.0 : -1.0;
  // Clearly radial strokes (within ~41 degrees) still arrive from outside.
  if (abs(radialAlignment) >= 0.75) {
    originSign = radialAlignment >= 0.0 ? 1.0 : -1.0;
  }
  vec2 originDirection = tangent * originSign;
  vec2 anchor = originSign > 0.0 ? a_start : a_end;
  float travel = mix(160.0, 480.0, fract(a_randomClip.x * 113.7));
  vec2 scatter = originDirection * travel / u_scale * (1.0 - growth);
  // Elongate toward the arrival origin, keeping the opposite tip as the anchor.
  // Length starts at 2.5–3.5x; length, position and width settle together.
  float stretch = mix(1.5, 2.5, fract(a_randomClip.x * 47.123)) * (1.0 - growth);
  v_start = a_start + originDirection * dot(a_start - anchor, originDirection) * stretch + scatter;
  v_control = a_control + originDirection * dot(a_control - anchor, originDirection) * stretch + scatter;
  v_end = a_end + originDirection * dot(a_end - anchor, originDirection) * stretch + scatter;
  v_color = vec4(a_paint.rgb, smoothstep(0.0, 1.0, t));
  v_radius = a_paint.a * 0.5 * growth;
  v_clip = a_randomClip.y;
  vec2 padding = vec2(v_radius + u_pixel);
  vec2 low = min(min(v_start, v_control), v_end) - padding;
  vec2 high = max(max(v_start, v_control), v_end) + padding;
  v_position = mix(low, high, corners[gl_VertexID]);
  vec2 screen = (v_position * u_scale + u_offset) / u_viewport;
  gl_Position = t <= 0.0 ? vec4(2,2,0,1) : vec4(screen.x * 2.0 - 1.0, 1.0 - screen.y * 2.0, 0, 1);
}`

const fragmentSource = `#version 300 es
precision highp float;
in vec2 v_position;
flat in vec2 v_start;
flat in vec2 v_control;
flat in vec2 v_end;
flat in vec4 v_color;
flat in float v_radius;
flat in float v_clip;
uniform sampler2D u_ridge;
uniform float u_ridgeStep;
uniform float u_pixel;
out vec4 color;
float segmentDistance(vec2 p, vec2 a, vec2 b) {
  vec2 delta = b - a;
  float t = clamp(dot(p - a, delta) / max(dot(delta, delta), 0.00001), 0.0, 1.0);
  return length(p - a - t * delta);
}
void main() {
  float distance = 10000.0;
  vec2 previous = v_start;
  // Four segments approximate the short quadratic curves, including their stretch.
  // Distance to the centerline gives round caps and continuous stroke-width growth.
  for (int i = 1; i <= 4; i++) {
    float t = float(i) * 0.25;
    vec2 next = mix(mix(v_start, v_control, t), mix(v_control, v_end, t), t);
    distance = min(distance, segmentDistance(v_position, previous, next));
    previous = next;
  }
  float coverage = 1.0 - smoothstep(v_radius - u_pixel * 0.5, v_radius + u_pixel * 0.5, distance);
  if (v_clip != 0.0) {
    int last = textureSize(u_ridge, 0).x - 1;
    float x = clamp(v_position.x / u_ridgeStep, 0.0, float(last));
    int index = int(floor(x));
    float ridge = mix(texelFetch(u_ridge, ivec2(index, 0), 0).r,
      texelFetch(u_ridge, ivec2(min(index + 1, last), 0), 0).r, fract(x));
    coverage *= clamp((v_position.y - ridge) * v_clip / u_pixel + 0.5, 0.0, 1.0);
  }
  float alpha = coverage * v_color.a;
  color = vec4(v_color.rgb * alpha, alpha);
}`

/** Upload SVG stroke geometry once; animate all strokes with one GPU draw per frame. */
export async function playLandscape(
  canvas: HTMLCanvasElement,
  signal: AbortSignal,
  onComplete: () => void,
  onReady: () => void,
): Promise<() => void> {
  const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false })
  if (!gl) throw new Error('WebGL2 is unavailable')
  const shaders: WebGLShader[] = []
  let program: WebGLProgram | null = null
  let buffer: WebGLBuffer | null = null
  let ridge: WebGLTexture | null = null
  let vertexArray: WebGLVertexArrayObject | null = null
  let resize: ResizeObserver | undefined
  let request = 0
  let disposed = false
  const contextLost = (event: Event) => { event.preventDefault(); onComplete(); dispose() }
  const dispose = () => {
    if (disposed) return
    disposed = true
    cancelAnimationFrame(request)
    resize?.disconnect()
    canvas.removeEventListener('webglcontextlost', contextLost)
    signal.removeEventListener('abort', dispose)
    shaders.forEach(shader => gl.deleteShader(shader))
    gl.deleteProgram(program)
    gl.deleteBuffer(buffer)
    gl.deleteTexture(ridge)
    gl.deleteVertexArray(vertexArray)
    gl.getExtension('WEBGL_lose_context')?.loseContext()
  }
  signal.addEventListener('abort', dispose, { once: true })
  canvas.addEventListener('webglcontextlost', contextLost)

  try {
    signal.throwIfAborted()
    const responses = await Promise.all([
      fetch('/artwork/flower-hills-brushes.json', { signal }),
      fetch('/artwork/flower-hills-brushes.bin', { signal }),
    ])
    if (responses.some(response => !response.ok)) throw new Error('Could not load the landscape')
    const [data, binary]: [LandscapeData, ArrayBuffer] = await Promise.all([
      responses[0].json(), responses[1].arrayBuffer(),
    ])
    signal.throwIfAborted()
    if (disposed) throw new Error('Landscape context was lost')
    if (data.version !== 2 || data.stride !== 12 || binary.byteLength !== data.count * 48) {
      throw new Error('Invalid landscape data')
    }
    for (const [type, source] of [[gl.VERTEX_SHADER, vertexSource], [gl.FRAGMENT_SHADER, fragmentSource]] as const) {
      const shader = gl.createShader(type)!
      shaders.push(shader)
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? 'Shader compilation failed')
    }
    program = gl.createProgram()!
    shaders.forEach(shader => gl.attachShader(program!, shader))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Shader linking failed')
    gl.useProgram(program)
    vertexArray = gl.createVertexArray()
    gl.bindVertexArray(vertexArray)
    buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, binary, gl.STATIC_DRAW)
    for (const [location, size, offset] of [[0, 2, 0], [1, 2, 2], [2, 2, 4], [3, 4, 6], [4, 2, 10]]) {
      gl.enableVertexAttribArray(location)
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, 48, offset * 4)
      gl.vertexAttribDivisor(location, 1)
    }
    ridge = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, ridge)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, data.ridge.length, 1, 0, gl.RED, gl.FLOAT, new Float32Array(data.ridge))
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    const uniform = (name: string) => gl.getUniformLocation(program!, name)
    const time = uniform('u_time')
    const viewport = uniform('u_viewport')
    const offset = uniform('u_offset')
    const scaleUniform = uniform('u_scale')
    const pixel = uniform('u_pixel')
    gl.uniform1i(uniform('u_ridge'), 0)
    gl.uniform1f(uniform('u_ridgeStep'), data.ridgeStep)
    gl.uniform1f(uniform('u_duration'), data.duration)
    gl.uniform1f(uniform('u_leadIn'), data.leadIn)
    gl.uniform1f(uniform('u_sweep'), data.sweep)
    gl.uniform1f(uniform('u_randomLatency'), data.randomLatency)
    const r = data.settleRadius
    const joinArrival = r * (1.5 - 0.25 * r - 0.25 * r * r)
    const joinSlope = 1.5 - 0.5 * r - 0.75 * r * r
    const settleTime = joinArrival / (joinArrival + 2 * (1 - r) * joinSlope)
    gl.uniform3f(uniform('u_settle'), r, joinArrival, settleTime)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    gl.clearColor(247 / 255, 247 / 255, 247 / 255, 1)

    const updateSize = () => {
      if (disposed) return
      const { width, height } = canvas.getBoundingClientRect()
      // Bound fragment work on high-density mobile displays during the brief reveal.
      const density = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.max(1, Math.round(width * density))
      canvas.height = Math.max(1, Math.round(height * density))
      const scale = Math.max(width / data.width, height / data.height)
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(viewport, width, height)
      gl.uniform2f(offset, (width - data.width * scale) / 2, (height - data.height * scale) / 2)
      gl.uniform1f(scaleUniform, scale)
      gl.uniform1f(pixel, 1 / Math.max(scale * density, 0.001))
      // Resizing replaces the drawing buffer with black; clear it before any paint.
      gl.clear(gl.COLOR_BUFFER_BIT)
    }
    updateSize()
    resize = new ResizeObserver(updateSize)
    resize.observe(canvas)
    let start: number | undefined
    let presented = false
    const frame = (now: number) => {
      if (disposed) return
      start ??= now
      const elapsed = (now - start) / 1000
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform1f(time, elapsed)
      gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, data.count)
      // Keep the default black WebGL buffer hidden throughout loading and setup.
      if (!presented) {
        presented = true
        onReady()
      }
      if (elapsed < data.end) request = requestAnimationFrame(frame)
      else { onComplete(); dispose() }
    }
    request = requestAnimationFrame(frame)
    return dispose
  } catch (error) {
    dispose()
    throw error
  }
}
