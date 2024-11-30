import { NextResponse } from 'next/server'

const BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba'

export async function GET(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    // Get team data and schedule
    const teamResponse = await fetch(
      `${BASE_URL}/teams/${params.teamId}`
    )

    if (!teamResponse.ok) {
      throw new Error(`Failed to fetch team: ${teamResponse.status}`)
    }

    const teamData = await teamResponse.json()

    // Get team schedule/results
    const scheduleResponse = await fetch(
      `${BASE_URL}/teams/${params.teamId}/schedule`
    )

    if (!scheduleResponse.ok) {
      throw new Error(`Failed to fetch schedule: ${scheduleResponse.status}`)
    }

    const scheduleData = await scheduleResponse.json()

    // Get team stats
    const statsResponse = await fetch(
      `${BASE_URL}/teams/${params.teamId}/statistics`
    )

    if (!statsResponse.ok) {
      throw new Error(`Failed to fetch stats: ${statsResponse.status}`)
    }

    const statsData = await statsResponse.json()

    // Process and return the data
    return NextResponse.json({
      team: teamData.team,
      schedule: scheduleData.events,
      stats: statsData.stats
    })
  } catch (error) {
    console.error('Error fetching team data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team data' },
      { status: 500 }
    )
  }
}
