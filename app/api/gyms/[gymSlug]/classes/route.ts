import { NextResponse } from 'next/server'
import { getGymContextApi } from '@/lib/gym-context'
import { getClasses } from '@/lib/queries'
import { prisma } from '@/lib/prisma'

// GET /api/gyms/[gymSlug]/classes?search=&active=&page=
export async function GET(
  request: Request,
  { params }: { params: Promise<{ gymSlug: string }> }
) {
  const { gymSlug } = await params
  const ctxResult = await getGymContextApi(gymSlug)
  if (!ctxResult.ok) {
    return NextResponse.json({ error: ctxResult.error }, { status: ctxResult.status })
  }
  const { gym } = ctxResult.ctx

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || undefined
  const active =
    searchParams.get('active') === 'true'
      ? true
      : searchParams.get('active') === 'false'
        ? false
        : undefined
  const page = parseInt(searchParams.get('page') || '1')

  const result = await getClasses(gym.id, { search, active, page })
  return NextResponse.json(result)
}

// POST /api/gyms/[gymSlug]/classes
export async function POST(
  request: Request,
  { params }: { params: Promise<{ gymSlug: string }> }
) {
  const { gymSlug } = await params
  const ctxResult = await getGymContextApi(gymSlug)
  if (!ctxResult.ok) {
    return NextResponse.json({ error: ctxResult.error }, { status: ctxResult.status })
  }
  const { gym } = ctxResult.ctx

  const body = await request.json()
  const {
    name,
    description,
    capacity,
    price,
    dayOfWeek,
    startTime,
    duration,
    branchId,
    trainerId,
  } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'اسم الكلاس مطلوب' }, { status: 400 })
  }

  const classRoom = await prisma.classRoom.create({
    data: {
      gymId: gym.id,
      name: name.trim(),
      description: description || null,
      capacity: parseInt(capacity) || 20,
      price: parseFloat(price) || 0,
      dayOfWeek: dayOfWeek || [],
      startTime: startTime ? new Date(startTime) : null,
      duration: duration ? parseInt(duration) : null,
      branchId: branchId || null,
      trainerId: trainerId || null,
    },
  })

  return NextResponse.json({ success: true, class: classRoom }, { status: 201 })
}
