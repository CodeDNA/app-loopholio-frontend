import { error } from "console";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    /*
    I am using this 'clientIp' to be used in a custom header - "x-loopholio-client-ip".
    This was required because the UI is deployed on vercel and vercel was not propagating the IP properly to the backend(Google Cloud run).
    
    What's happening?
    The flow: ClientUI request -> Vercel -> Vercel Proxy Server(forwards its own IP) -> Google Cloud Run(Backend).
    I was using x-forwarded-for to get the user IP. Ui sends the IP in this header to Vercel. The vercel sends the request to it's proxy server which then calls the backend. The backend receives the header 'x-forwarded-for' from the Vercel proxy server.
    This resulted in Cloud run getting Vercel's proxy server's IP while Vercel sees the correct real client IP.
    Since I am using rate limiting based on IP address(i.e. the keys contain the IP address), getting correct IP address in the backend is important. We want to use the real user IP and not the Vercel's proxy-server IP.

    Solution:
    1. Create a custom header and send it in the request.
    2. Use the custom header to get the IP in the backend use it for all the IP based tasks.
    */
    const clientIp =
      request.headers.get("x-vercel-forwarded-for") ??
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "";
    const proxySecret = process.env.LOOPHOLIO_PROXY_SECRET;
    if (!proxySecret) {
      throw new Error("LOOPHOLIO_PROXY_SECRET is not configured");
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const text = formData.get("text") as string;
    const isURL = formData.get("isURL") as string;

    if (!file && !text) {
      return NextResponse.json(
        { error: "No file or text provided" },
        { status: 400 },
      );
    }

    // Extract text from input
    let tosText = text || "";

    // Create a streaming response using server-sent events format
    const encoder = new TextEncoder();

    // Generate title based on input
    const title = text ? `${text.substring(0, 100)}` : file?.name;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send title first
          if (title) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "title", content: title })}\n`,
              ),
            );
          }

          // Send document preview in case of text input
          if (text) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "documentPreview", content: text })}\n`,
              ),
            );
          }

          // Call AI backend to analyze the ToS
          let risks: any[] = [];
          let url = `${process.env.LOOPHOLIO_BACKEND_API_URL}/analyze-document`;
          const formData = new FormData();
          formData.append("isURL", isURL);
          if (tosText && tosText.trim() !== "") {
            formData.append("tosText", tosText);
          } else if (file) {
            formData.append("file", file);
          }

          try {
            const aiResponse = await fetch(url, {
              method: "POST",
              body: formData,
              headers: {
                "x-loopholio-client-ip": clientIp,
                "x-loopholio-proxy-secret": proxySecret,
              },
            });

            // console.log("aiResponse: ", aiResponse);
            if (!aiResponse.ok) {
              throw new Error(
                `Bad Response: aiResponse - Not ok ${aiResponse}`,
              );
            }

            // Parse the streaming SSE response from AI backend
            const reader = aiResponse.body?.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            if (reader) {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                  const trimmed = line.trim();
                  if (trimmed.startsWith("data: ")) {
                    try {
                      const jsonStr = trimmed.slice(6);
                      const data = JSON.parse(jsonStr);
                      // const data = JSON.parse(line.slice(6));

                      // Only extract risk items, ignore other message types
                      if (data.type === "status") {
                        controller.enqueue(
                          encoder.encode(
                            `data: ${JSON.stringify({ type: "status", content: data.message })}\n`,
                          ),
                        );
                      }
                      if (data.type === "risk_item") {
                        risks.push(data.content);
                        controller.enqueue(
                          encoder.encode(
                            `data: ${JSON.stringify({ type: "risk_item", content: data.content })}\n`,
                          ),
                        );
                      } else if (data.type === "error") {
                        console.error("Backend streamed an error:");
                        console.log(data.error);
                        controller.enqueue(
                          encoder.encode(
                            `data: ${JSON.stringify({ type: "error", content: data.error })}\n`,
                          ),
                        );
                      }
                    } catch (e) {
                      console.error("Failed to parse SSE message:", e);
                      controller.enqueue(
                        encoder.encode(
                          `data: ${JSON.stringify({ type: "error", content: "Failed to parse SSE message:" })}\n`,
                        ),
                      );
                    }
                  }
                }
              }
            }

            // If no risks found from AI, fall back to mock
            if (risks.length === 0) {
              console.warn("No risks found from AI, using mock data");
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "no_risk_found" })}\n`,
                ),
              );
            }
          } catch (aiError) {
            const errorMessage =
              aiError instanceof Error ? aiError.message : "Backend Error!";
            console.warn("Backend Response Error:", aiError);
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "error", content: `Backend Error: ${errorMessage}` })}\n`,
              ),
            );
          }

          // Send completion signal
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`),
          );
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", content: `Stream error: ${error}` })}\n`,
            ),
          );
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze document" },
      { status: 500 },
    );
  }
}
