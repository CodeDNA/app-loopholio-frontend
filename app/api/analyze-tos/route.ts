import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const text = formData.get("text") as string;

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
    const title = text ? text : file?.name;

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

          // Call AI backend to analyze the ToS
          let risks: any[] = [];
          let url = `${process.env.LOOPHOLIO_BACKEND_API_URL}/analyze-document`;
          const formData = new FormData();
          if (tosText && tosText.trim() !== "") {
            formData.append("tosText", tosText);
          } else if (file) {
            formData.append("file", file);
          }

          try {
            // console.log("Calling backend FAST APAPI...");
            const aiResponse = await fetch(url, {
              method: "POST",
              body: formData,
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
            console.warn("Backend Response Error:", aiError);
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "ai_error" })}\n`),
            );
          }

          // Send completion signal
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`),
          );
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
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
