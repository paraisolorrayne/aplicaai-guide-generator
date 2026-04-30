import { getGuideById } from "@/data/guides";
import { createReadStream, existsSync, statSync } from "fs";
import { join, resolve } from "path";

export async function GET(request, { params }) {
  const { id } = await params;
  const guide = getGuideById(id);

  if (!guide) {
    return Response.json({ error: "Guia não encontrado" }, { status: 404 });
  }

  if (!guide.recording?.videoUrl) {
    return Response.json({ error: "Nenhuma gravação disponível" }, { status: 404 });
  }

  const publicDir = resolve(process.cwd(), "public");
  const videoPath = resolve(join(process.cwd(), "public", guide.recording.videoUrl));

  if (!videoPath.startsWith(publicDir + "/")) {
    return Response.json({ error: "Caminho inválido" }, { status: 403 });
  }

  if (!existsSync(videoPath)) {
    return Response.json({ error: "Arquivo de vídeo não encontrado" }, { status: 404 });
  }

  const stat = statSync(videoPath);
  const slug = guide.slug || "guia";
  const fileName = `${slug}-gravacao.webm`;

  const nodeStream = createReadStream(videoPath);
  const stream = new ReadableStream({
    start(controller) {
      nodeStream.on("data", (chunk) => {
        try { controller.enqueue(chunk); } catch { nodeStream.destroy(); }
      });
      nodeStream.on("end", () => controller.close());
      nodeStream.on("error", (err) => controller.error(err));
    },
    cancel() {
      nodeStream.destroy();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "video/webm",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": stat.size.toString(),
    },
  });
}
