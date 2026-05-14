import Papa from "papaparse"

export function serializeTsv(matrix: string[][]): string {
  return Papa.unparse(matrix, { delimiter: "\t", newline: "\n" })
}

export function parseTsv(text: string): string[][] {
  const clean = text.replace(/\r\n?/g, "\n").replace(/\n$/, "")
  if (clean === "") return []
  const result = Papa.parse<string[]>(clean, {
    delimiter: "\t",
    newline: "\n",
    skipEmptyLines: false,
  })
  return result.data.map((row) => (Array.isArray(row) ? row : []))
}
