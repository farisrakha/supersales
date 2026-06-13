const DEMO_NOW_ISO = '2026-05-26T08:00:00+07:00'

export function getDemoNow(): Date {
  return new Date(DEMO_NOW_ISO)
}

export function getDemoNowIso(): string {
  return DEMO_NOW_ISO
}

export function tick(ms: number): Date {
  return new Date(getDemoNow().getTime() + ms)
}

export function isoOffset(minutesFromNow: number): string {
  return new Date(getDemoNow().getTime() + minutesFromNow * 60_000).toISOString()
}
