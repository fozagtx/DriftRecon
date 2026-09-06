import { emptySnapshot, importUploads, snapshot } from "@/lib/app/actions";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    await importUploads({
      stripe: await readUpload(form, "stripe"),
      gumroad: await readUpload(form, "gumroad"),
      bank: await readUpload(form, "bank"),
      dodo: await readUpload(form, "dodo"),
    });
    return Response.json(await snapshot());
  } catch (error) {
    return Response.json(
      emptySnapshot(error instanceof Error ? error.message : "Import failed"),
      { status: 400 },
    );
  }
}

async function readUpload(form: FormData, key: string): Promise<string | undefined> {
  const value = form.get(key);
  if (!(value instanceof File) || value.size === 0) return undefined;
  return value.text();
}
