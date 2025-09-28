export async function POST(req: Request) {
  try {
    const { message, conversation_id } = await req.json()

    const response = await fetch("http://127.0.0.1:8000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        conversation_id,
      }),
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }

    const data = await response.json()

    return Response.json(data)
  } catch (error) {
    console.error("Error in chat API:", error)
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
