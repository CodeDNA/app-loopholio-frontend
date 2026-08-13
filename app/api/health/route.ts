import { NextResponse } from "next/server";

export async function GET() {
  let url = `${process.env.LOOPHOLIO_BACKEND_API_URL}/health`;

  try {
    const response = await fetch(url, {
      method: "GET",
    });
    if (response.ok) {
      return Response.json({
        configured: true,
        reachable: true,
        message: "Connected",
      });
    }
    return NextResponse.json({ status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Not connected" }, { status: 500 });
  }
}
