import OpenAI from "openai";

const allowedMimeTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/webm", "audio/ogg"];
const maxFileSizeBytes = 25 * 1024 * 1024; // 25MB

export async function POST(request: Request) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    console.log("No file uploaded");
    return new Response("No file uploaded", { status: 400 });
  }

  // Validate file type
  if (!allowedMimeTypes.includes(file.type)) {
    console.log("Unsupported file type");
    return new Response("Unsupported file type", { status: 400 });
  }

  // Validate file size
  if (file.size > maxFileSizeBytes) {
    console.log("File size exceeds the limit");
    return new Response("File size exceeds the limit", { status: 400 });
  }

  console.log("Received file for transcription");

  try {
    console.log("Starting transcription");
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
    });
    console.log("Transcription successful:", transcription.text);
    return new Response(JSON.stringify({ text: transcription.text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error transcribing audio:", error);
    return new Response("Error transcribing audio", { status: 500 });
  }
}