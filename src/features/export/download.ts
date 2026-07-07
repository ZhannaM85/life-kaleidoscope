// Browser-only delivery helpers for the export feature. Deliberately outside
// domain/ — they touch the DOM (anchor clicks, window.open).

/** Trigger a "save file" download of in-memory text content. */
export function downloadTextFile(filename: string, content: string, mimeType: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

/**
 * Open a printable document in a new window and bring up the browser's print
 * dialog, where "Save as PDF" lives. Returns false when a popup blocker got
 * in the way, so the caller can explain instead of failing silently.
 */
export function openPrintDialog(html: string): boolean {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return false
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
  return true
}
