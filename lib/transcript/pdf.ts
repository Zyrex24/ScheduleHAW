import type { TextItem } from "@/lib/domain/types";
export async function extractPDF(
  file: File,
  signal: AbortSignal,
): Promise<TextItem[]> {
  if (file.size > 10 * 1024 * 1024 || !file.name.toLowerCase().endsWith(".pdf"))
    throw new Error("PDF_LIMIT");
  const pdf = await import("pdfjs-dist");
  pdf.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  if (signal.aborted) throw new Error("CANCELLED");
  const task = pdf.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    useSystemFonts: true,
  });
  const cancel = () => void task.destroy();
  signal.addEventListener("abort", cancel, { once: true });
  try {
    const document = await task.promise;
    if (document.numPages > 80) throw new Error("PDF_LIMIT");
    const items: TextItem[] = [];
    for (let n = 1; n <= document.numPages; n++) {
      if (signal.aborted) throw new Error("CANCELLED");
      const page = await document.getPage(n),
        content = await page.getTextContent();
      for (const item of content.items) {
        if ("str" in item)
          items.push({
            page: n,
            x: item.transform[4],
            y: item.transform[5],
            width: item.width,
            text: item.str,
          });
      }
      if (items.length > 50000) throw new Error("PDF_LIMIT");
      page.cleanup();
    }
    return items;
  } finally {
    signal.removeEventListener("abort", cancel);
    await task.destroy();
  }
}
