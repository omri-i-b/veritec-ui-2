export const PAGE_DATA_ATTRIBUTES = {
  PAGE_NUMBER: "data-page-number",
  DOCUMENT_PAGE_ID: "data-document-page-id",
  PDF_WIDTH: "data-pdf-width",
  PDF_HEIGHT: "data-pdf-height",
  PLACEHOLDER: "data-placeholder",
} as const

export const PAGE_ELEMENT_SELECTOR = `[${PAGE_DATA_ATTRIBUTES.PAGE_NUMBER}]`
export const RENDERED_PAGE_SELECTOR = `[${PAGE_DATA_ATTRIBUTES.PAGE_NUMBER}][${PAGE_DATA_ATTRIBUTES.DOCUMENT_PAGE_ID}]`

export interface IPageElementData {
  pageNumber: number
  documentPageId: number
  pdfWidth: number
  pdfHeight: number
}

const DEFAULT_PDF_WIDTH = 595
const DEFAULT_PDF_HEIGHT = 842

export function getPageElementData(element: HTMLElement): IPageElementData | null {
  const documentPageIdStr = element.getAttribute(PAGE_DATA_ATTRIBUTES.DOCUMENT_PAGE_ID)
  const pageNumberStr = element.getAttribute(PAGE_DATA_ATTRIBUTES.PAGE_NUMBER)
  if (!documentPageIdStr || !pageNumberStr) return null
  const documentPageId = parseInt(documentPageIdStr, 10)
  const pageNumber = parseInt(pageNumberStr, 10)
  if (Number.isNaN(documentPageId) || Number.isNaN(pageNumber)) return null
  const pdfWidthStr = element.getAttribute(PAGE_DATA_ATTRIBUTES.PDF_WIDTH)
  const pdfHeightStr = element.getAttribute(PAGE_DATA_ATTRIBUTES.PDF_HEIGHT)
  const pdfWidth = pdfWidthStr ? parseFloat(pdfWidthStr) : DEFAULT_PDF_WIDTH
  const pdfHeight = pdfHeightStr ? parseFloat(pdfHeightStr) : DEFAULT_PDF_HEIGHT
  return {
    pageNumber,
    documentPageId,
    pdfWidth: Number.isNaN(pdfWidth) ? DEFAULT_PDF_WIDTH : pdfWidth,
    pdfHeight: Number.isNaN(pdfHeight) ? DEFAULT_PDF_HEIGHT : pdfHeight,
  }
}

export function findPageElement(container: HTMLElement, documentPageId: number, pageNumber: number): HTMLElement | null {
  return container.querySelector<HTMLElement>(
    `[${PAGE_DATA_ATTRIBUTES.DOCUMENT_PAGE_ID}="${documentPageId}"][${PAGE_DATA_ATTRIBUTES.PAGE_NUMBER}="${pageNumber}"]`,
  )
}

export function getAllPageElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(PAGE_ELEMENT_SELECTOR))
}
