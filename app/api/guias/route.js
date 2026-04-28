import { getAllGuides, createGuide } from "@/data/guides";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filters = {
    category: searchParams.get("category") || undefined,
    difficulty: searchParams.get("difficulty") || undefined,
    tool: searchParams.get("tool") || undefined,
    search: searchParams.get("search") || undefined,
  };
  return Response.json(getAllGuides(filters));
}

export async function POST(request) {
  try {
    const data = await request.json();
    if (!data.title) {
      return Response.json({ error: "Título obrigatório" }, { status: 400 });
    }
    return Response.json(createGuide(data), { status: 201 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
