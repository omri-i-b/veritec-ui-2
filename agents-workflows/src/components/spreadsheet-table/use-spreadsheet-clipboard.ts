import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import {
  applyPasteMatrix,
  buildSelectionMatrix,
  clearSelection,
} from "./clipboard-ops";
import { parseTsv, serializeTsv } from "./tsv";
import type { CellRange, SpreadsheetColumn } from "./types";
import { normalizeRange } from "./use-spreadsheet-selection";

interface UseSpreadsheetClipboardOptions<TRow> {
  selection: CellRange | null;
  setSelection: (range: CellRange | null) => void;
  data: TRow[];
  columns: SpreadsheetColumn<TRow>[];
  onRowsChange: (rows: TRow[]) => void;
  isRowEditable?: (row: TRow) => boolean;
}

async function writeClipboardText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fallback path below (e.g. non-secure context without clipboard perms).
    }
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.top = "-1000px";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(ta);
  }
}

export function useSpreadsheetClipboard<TRow>({
  selection,
  setSelection,
  data,
  columns,
  onRowsChange,
  isRowEditable,
}: UseSpreadsheetClipboardOptions<TRow>) {
  const copy = useCallback(async () => {
    if (!selection) return;
    const range = normalizeRange(selection);
    const matrix = buildSelectionMatrix(range, data, columns);
    const tsv = serializeTsv(matrix);
    await writeClipboardText(tsv);
  }, [selection, data, columns]);

  const cut = useCallback(async () => {
    if (!selection) return;
    await copy();
    const range = normalizeRange(selection);
    const { rows, changed } = clearSelection(
      range,
      data,
      columns,
      isRowEditable,
    );
    if (changed) onRowsChange(rows);
  }, [selection, data, columns, onRowsChange, isRowEditable, copy]);

  useEffect(() => {
    const isFormTarget = () => {
      const tag = document.activeElement?.tagName;
      return tag === "INPUT" || tag === "TEXTAREA";
    };

    const onCopy = (e: ClipboardEvent) => {
      if (isFormTarget()) return;
      if (!selection) return;
      const range = normalizeRange(selection);
      const tsv = serializeTsv(buildSelectionMatrix(range, data, columns));
      e.clipboardData?.setData("text/plain", tsv);
      e.preventDefault();
    };

    const onCut = (e: ClipboardEvent) => {
      if (isFormTarget()) return;
      if (!selection) return;
      const range = normalizeRange(selection);
      const tsv = serializeTsv(buildSelectionMatrix(range, data, columns));
      e.clipboardData?.setData("text/plain", tsv);
      e.preventDefault();
      const { rows, changed } = clearSelection(
        range,
        data,
        columns,
        isRowEditable,
      );
      if (changed) onRowsChange(rows);
    };

    window.addEventListener("copy", onCopy);
    window.addEventListener("cut", onCut);
    return () => {
      window.removeEventListener("copy", onCopy);
      window.removeEventListener("cut", onCut);
    };
  }, [selection, data, columns, onRowsChange, isRowEditable]);

  const pasteText = useCallback(
    (text: string) => {
      if (!selection) return;
      const matrix = parseTsv(text);
      if (matrix.length === 0) return;
      const range = normalizeRange(selection);
      const result = applyPasteMatrix(
        matrix,
        range,
        data,
        columns,
        isRowEditable,
      );
      if (result.applied > 0) {
        onRowsChange(result.rows);
      }
      const nextRange = {
        anchor: { row: range.rMin, col: range.cMin },
        focus: {
          row: Math.min(range.rMin + result.targetRows - 1, data.length - 1),
          col: Math.min(range.cMin + result.targetCols - 1, columns.length - 1),
        },
      };
      setSelection(nextRange);
      if (result.applied > 0 && result.skipped > 0) {
        toast.info(
          `Pasted ${result.applied} cells (${result.skipped} skipped)`,
        );
      } else if (result.applied === 0) {
        toast.error("Nothing pasted — selection may be locked or readonly");
      }
    },
    [selection, setSelection, data, columns, onRowsChange, isRowEditable],
  );

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const active = document.activeElement;
      if (active?.tagName === "INPUT" || active?.tagName === "TEXTAREA") return;
      if (!selection) return;
      const text = e.clipboardData?.getData("text/plain") ?? "";
      if (!text) return;
      e.preventDefault();
      pasteText(text);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [selection, pasteText]);

  return { copy, cut, pasteText };
}
