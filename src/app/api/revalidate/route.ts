import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(req: Request) {
  const secret = req.headers.get('x-revalidate-secret')

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  revalidatePath('/')
  revalidatePath('/store')
  revalidatePath('/products/[handle]', 'page')

  return NextResponse.json({ revalidated: true, now: Date.now() })
}
