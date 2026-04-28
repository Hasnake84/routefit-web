import { NextResponse } from 'next/server'
import { db, serverTimestamp } from '@/lib/firebaseAdmin'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const from       = typeof body.from       === 'string' ? body.from.trim()       : ''
    const to         = typeof body.to         === 'string' ? body.to.trim()         : ''
    const timeWindow = typeof body.timeWindow === 'string' ? body.timeWindow.trim() : ''
    const note       = typeof body.note       === 'string' ? body.note.trim()       : ''

    // Destination is required
    if (!to || to.length < 2) {
      return NextResponse.json({ error: 'Invalid destination' }, { status: 400 })
    }

    // Basic anti-spam guard
    if (note && note.length > 500) {
      return NextResponse.json({ error: 'Note too long' }, { status: 400 })
    }

    // Completeness score (0.0 – 1.0) — not a real match confidence, just field coverage
    const completeness = [from, to, timeWindow, note].filter(Boolean).length
    const confidenceDraft = completeness / 4

    await db.collection('submissions').add({
      from:           from       || null,
      to,
      timeWindow:     timeWindow || null,
      note:           note       || null,
      confidenceDraft,
      createdAt:      serverTimestamp(),
      status:         'new',
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
