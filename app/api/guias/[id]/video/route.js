import { getGuideById } from "@/data/guides";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

export async function GET(request, { params }) {
  const { id } = await params;
  const guide = getGuideById(id);

  if (!guide) {
    return Response.json({ error: "Guia não encontrado" }, { status: 404 });
  }

  if (!guide.recording?.videoUrl) {
    return Response.json({ error: "Nenhuma gravação disponível" }, { status: 404 });
  }

  const videoPath = join(process.cwd(), "public", guide.recording.videoUrl);

  if (!existsSync(videoPath)) {
    return Response.json({ error: "Arquivo de vídeo não encontrado" }, { status: 404 });
  }

  const videoBuffer = readFileSync(videoPath);
  const slug = guide.slug || "guia";
  const fileName = `${slug}-gravacao.webm`;

  return new Response(videoBuffer, {
    headers: {
      "Content-Type": "video/webm",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": videoBuffer.length.toString(),
    },
  });
}
