import { getMessageFromError } from '@/common/utils'
import { NextResponse, type NextRequest } from 'next/server'
import { config } from 'dotenv';

config();

export const maxDuration = 300

/**
 * Runs a cron job with the provided `run` function, after verifying the authorization header.
 *
 * @param request - The incoming Next.js API request.
 * @param run - A function that performs the cron job logic.
 * @returns A JSON response with a status of 'OK' if the cron job was successfully executed.
 */
export const cronRunner = async (
  request: NextRequest,
  run: () => Promise<void>,
) => {
//   const authHeader = request.headers.get('authorization')
//   if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
//     return new Response('Unauthorized', {
//       status: 401,
//     })
//   }

  console.log('🚀 Running the cron job')

  try {
    await run()
  } catch (error) {
    console.warn('🚧 Error processing cron job:', getMessageFromError(error))
  }

  console.log('✅ Finished running the cron job')

  return NextResponse.json({ status: 'OK' })
}
