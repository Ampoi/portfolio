// Development-only frame sampling. Opt in with ?hero-profile; no production UI.
export function profileHero(element: HTMLElement) {
  if (!import.meta.env.DEV || !new URLSearchParams(location.search).has('hero-profile')) return () => {}
  const frames: number[] = []
  let previous = 0
  let start = 0
  let request = 0
  const sample = (now: number) => {
    if (!start) start = now
    if (previous) frames.push(now - previous)
    previous = now
    if (now - start < 6000) request = requestAnimationFrame(sample)
    else {
      const sorted = [...frames].sort((a, b) => a - b)
      element.dataset.frameProfile = JSON.stringify({
        frames: frames.length,
        medianMs: Math.round(sorted[Math.floor(sorted.length * 0.5)] * 10) / 10,
        p95Ms: Math.round(sorted[Math.floor(sorted.length * 0.95)] * 10) / 10,
        maxMs: Math.round(sorted.at(-1)! * 10) / 10,
        over50ms: frames.filter(frame => frame > 50).length,
      })
    }
  }
  request = requestAnimationFrame(sample)
  return () => cancelAnimationFrame(request)
}
