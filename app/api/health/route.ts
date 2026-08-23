import { NextResponse } from "next/server";

export async function GET() {
  let backendUrl = `${process.env.LOOPHOLIO_BACKEND_API_URL}`;

  if (!backendUrl) {
    return NextResponse.json(
      {
        configured: false,
        reachable: false,
        message: "Backend is not configured",
      },
      { status: 503 },
    );
  }

  try {
    const timeout = 5000;
    const response = await fetch(`${backendUrl}/health`, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(timeout),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          configured: true,
          reachable: false,
          message: "Backend is not reachable",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      configured: true,
      reachable: true,
      message: "Connected",
    });
  } catch {
    return NextResponse.json(
      {
        configured: true,
        reachable: false,
        message: "Not connected",
      },
      { status: 503 },
    );
  }
}
