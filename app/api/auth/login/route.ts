import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Use /api/auth/signin or the login page to sign in' },
    { status: 410 }
  )
}
