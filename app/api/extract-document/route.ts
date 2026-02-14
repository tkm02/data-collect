import { NextRequest, NextResponse } from "next/server";

async function extractTextFromPDF(buffer: ArrayBuffer): Promise<{
  text: string;
  numpages: number;
}> {
  // Import pdfjs-dist (Node.js build for the server)
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  const textParts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .filter((item: Record<string, unknown>) => "str" in item)
      .map((item: Record<string, unknown>) => item.str as string)
      .join(" ");
    textParts.push(pageText);
  }

  return {
    text: textParts.join("\n\n"),
    numpages: pdf.numPages,
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Aucun fichier fourni. Envoyez un champ 'file' dans le FormData.",
        },
        { status: 400 }
      );
    }

    // Vérifier le type
    if (
      !file.type.includes("pdf") &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Type de fichier non supporté: ${file.type}. Seuls les PDF sont acceptés.`,
        },
        { status: 400 }
      );
    }

    // Lire le contenu du fichier
    const arrayBuffer = await file.arrayBuffer();

    // Extraire le texte
    const result = await extractTextFromPDF(arrayBuffer);

    return NextResponse.json({
      success: true,
      data: {
        text: result.text,
        pages: result.numpages,
        fileName: file.name,
        fileSize: file.size,
      },
    });
  } catch (error: unknown) {
    console.error("Erreur extraction PDF:", error);
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: `Erreur lors de l'extraction: ${message}` },
      { status: 500 }
    );
  }
}
