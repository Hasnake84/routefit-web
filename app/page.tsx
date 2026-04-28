'use client'
import { useMemo, useState } from 'react'

type View = 'submit' | 'dashboard'
type Slide = 'left' | 'right'

export default function Home() {
  const [view, setView]           = useState<View>('submit')
  const [slide, setSlide]         = useState<Slide>('left')
  const [from, setFrom]           = useState('')
  const [to, setTo]               = useState('')
  const [timeWindow, setTimeWindow] = useState('')
  const [note, setNote]           = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  // Preview completeness score shown to the user before submit
  const confidence = useMemo(() => {
    const n = [from, to, timeWindow, note].filter(Boolean).length
    return n === 4 ? 87 : n === 3 ? 78 : n === 2 ? 62 : n === 1 ? 40 : 0
  }, [from, to, timeWindow, note])

  const goToDashboard = () => { setSlide('left'); setView('dashboard') }
  const goToSubmit    = () => { setSlide('right'); setView('submit') }

  const handleSubmit = async () => {
    setError('')
    if (!to || to.trim().length < 2) {
      setError('Please enter a destination.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/submit-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to, timeWindow, note }),
      })
      if (res.ok) {
        goToDashboard()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to submit. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const screenClass = view === 'submit'
    ? (slide === 'left'  ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0')
    : (slide === 'left'  ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100')

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#143a5b_0%,#04111f_45%,#02070d_100%)] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.04),transparent_30%,transparent_70%,rgba(255,255,255,0.02))]" />

      <div className={`relative mx-auto min-h-screen w-full max-w-md transition-all duration-300 ease-out ${screenClass}`}>

        {/* ── Submit form ───────────────────────────────────────────────── */}
        {view === 'submit' && (
          <section className="flex min-h-screen items-center justify-center px-4 py-6">
            <div className="w-full rounded-[2rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>RouteFit</span>
                <span>Intent submission</span>
              </div>
              <h1 className="mt-3 text-3xl font-semibold">Where are you headed?</h1>
              <p className="mt-2 text-sm text-zinc-300">
                Share the route. RouteFit estimates destination intent and confidence.
              </p>

              <div className="mt-5 space-y-3">
                <input
                  value={from}
                  onChange={e => setFrom(e.target.value)}
                  placeholder="Starting location"
                  className="w-full rounded-2xl border border-white/10 bg-[#081423] px-4 py-3.5 text-sm outline-none placeholder:text-zinc-500"
                />
                <input
                  value={to}
                  onChange={e => setTo(e.target.value)}
                  placeholder="Destination"
                  className="w-full rounded-2xl border border-white/10 bg-[#081423] px-4 py-3.5 text-sm outline-none placeholder:text-zinc-500"
                />
                <input
                  value={timeWindow}
                  onChange={e => setTimeWindow(e.target.value)}
                  placeholder="Time window, optional"
                  className="w-full rounded-2xl border border-white/10 bg-[#081423] px-4 py-3.5 text-sm outline-none placeholder:text-zinc-500"
                />
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Note, optional"
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-white/10 bg-[#081423] px-4 py-3.5 text-sm outline-none placeholder:text-zinc-500"
                />
              </div>

              {/* Confidence preview bar */}
              <div className="mt-4 rounded-2xl border border-cyan-400/15 bg-cyan-400/8 p-4">
                <div className="flex justify-between">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">Preview</p>
                  <p className="text-sm font-medium text-cyan-300">{confidence}% fit</p>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-cyan-300 transition-all duration-300"
                    style={{ width: `${confidence}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-zinc-300">
                  Starting location, destination, and time window improve matching quality.
                </p>
              </div>

              {/* Error message */}
              {error && (
                <p className="mt-3 text-sm text-red-400">{error}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="mt-5 w-full rounded-2xl bg-cyan-300 py-3.5 text-sm font-semibold text-[#04111f] disabled:opacity-60 transition-opacity"
              >
                {loading ? 'Submitting…' : 'Submit Intent'}
              </button>
              <p className="mt-2 text-center text-xs text-zinc-500">Review your route before sending</p>
            </div>
          </section>
        )}

        {/* ── Confirmation + dashboard ──────────────────────────────────── */}
        {view === 'dashboard' && (
          <section className="flex min-h-screen items-center justify-center px-4 py-6">
            <div className="w-full space-y-4">

              {/* Confirmation card */}
              <div className="rounded-[2rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">RouteFit</p>
                <h1 className="mt-2 text-3xl font-semibold">Intent submitted</h1>
                <p className="mt-2 text-sm text-zinc-300">
                  Matching your route and estimating confidence.
                </p>

                {/* Submitted values */}
                <div className="mt-5 rounded-3xl border border-white/10 bg-[#081423] p-4 space-y-2 text-sm">
                  <p><span className="text-zinc-400">From:</span> {from || 'Not set'}</p>
                  <p><span className="text-zinc-400">To:</span> {to || 'Not set'}</p>
                  <p><span className="text-zinc-400">Time:</span> {timeWindow || 'Anytime'}</p>
                  {note ? <p><span className="text-zinc-400">Note:</span> {note}</p> : null}
                </div>

                {/* Match preview bar */}
                <div className="mt-4 rounded-2xl border border-cyan-400/15 bg-cyan-400/8 p-4">
                  <div className="flex justify-between">
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">Match preview</p>
                    <p className="text-sm font-medium text-cyan-300">{confidence || 78}%</p>
                  </div>
                  <div className="mt-3 h-2 w-full rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-cyan-300"
                      style={{ width: `${confidence || 78}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-zinc-300">
                    Likely destination area and route fit preview.
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    onClick={goToSubmit}
                    className="rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-medium"
                  >
                    Back to edit
                  </button>
                  <button
                    onClick={goToDashboard}
                    className="rounded-2xl bg-cyan-300 py-3 text-sm font-semibold text-[#04111f]"
                  >
                    View dashboard
                  </button>
                </div>
              </div>

              {/* Platform stats card (placeholder until real data) */}
              <div className="rounded-[2rem] border border-white/10 bg-white/6 p-4 backdrop-blur-xl">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Platform dashboard</span>
                  <span>All routes</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs text-zinc-400">Today</p>
                    <p className="mt-2 text-2xl font-semibold">128</p>
                    <p className="text-sm text-zinc-300">submissions</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs text-zinc-400">Avg confidence</p>
                    <p className="mt-2 text-2xl font-semibold">76%</p>
                    <p className="text-sm text-zinc-300">signal quality</p>
                  </div>
                </div>
              </div>

            </div>
          </section>
        )}

      </div>
    </main>
  )
}
