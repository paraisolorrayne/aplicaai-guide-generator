import { getGuideById, updateGuide, deleteGuide } from "@/data/guides";

export async function GET(request, { params }) {
  const { id } = await params;
  const guide = getGuideById(id);
  if (!guide) return Response.json({ error: "Guia não encontrado" }, { status: 404 });
  return Response.json(guide);
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const guide = updateGuide(id, data);
    if (!guide) return Response.json({ error: "Guia não encontrado" }, { status: 404 });
    return Response.json(guide);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const deleted = deleteGuide(id);
  if (!deleted) return Response.json({ error: "Guia não encontrado" }, { status: 404 });
  return Response.json({ success: true });
}
