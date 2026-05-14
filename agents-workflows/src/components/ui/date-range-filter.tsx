import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { FilterButton } from "@/components/ui/filter-button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowRight, CalendarBlank } from "@phosphor-icons/react";
import {
  format,
  isBefore,
  isSameDay,
  isValid,
  parse,
  parseISO,
} from "date-fns";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DateRange } from "react-day-picker";

const DEFAULT_PRESETS = [
  { label: "Today", days: 0 },
  { label: "Last 7 days", days: 7 },
  { label: "Last 4 weeks", days: 28 },
  { label: "Last 3 months", days: 90 },
];

const INPUT_FORMAT = "MM/dd/yyyy";

interface DateRangeFilterProps {
  from: string | null;
  to: string | null;
  onChange: (from: string | null, to: string | null) => void;
  label?: string;
  presets?: Array<{ label: string; days: number }>;
}

const formatInput = (date: Date) => format(date, INPUT_FORMAT);

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

const parseInputDate = (text: string): Date | null => {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const parsed = parse(trimmed, INPUT_FORMAT, new Date());
  if (!isValid(parsed)) return null;
  const year = parsed.getFullYear();
  if (year < MIN_YEAR || year > MAX_YEAR) return null;
  return parsed;
};

const maskDateInput = (raw: string) => {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

export function DateRangeFilter({
  from,
  to,
  onChange,
  label = "Date",
  presets = DEFAULT_PRESETS,
}: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const [pendingRange, setPendingRange] = useState<DateRange | undefined>();
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [startText, setStartText] = useState("");
  const [endText, setEndText] = useState("");
  const [startError, setStartError] = useState(false);
  const [endError, setEndError] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());
  const clickCount = useRef(0);
  const endInputRef = useRef<HTMLInputElement | null>(null);
  const skipNextStartBlur = useRef(false);
  const hasValue = Boolean(from && to);

  useEffect(() => {
    if (open) {
      clickCount.current = 0;
      const initial =
        from && to ? { from: parseISO(from), to: parseISO(to) } : undefined;
      setPendingRange(initial);
      setStartText(initial?.from ? formatInput(initial.from) : "");
      setEndText(initial?.to ? formatInput(initial.to) : "");
      setStartError(false);
      setEndError(false);
      setCalendarMonth(initial?.from ?? new Date());
    } else {
      setHoveredDate(null);
    }
  }, [open, from, to]);

  const commitRange = useCallback(
    (range: DateRange | undefined) => {
      if (range?.from && range.to) {
        onChange(
          format(range.from, "yyyy-MM-dd"),
          format(range.to, "yyyy-MM-dd"),
        );
        setOpen(false);
        setHoveredDate(null);
        clickCount.current = 0;
      }
    },
    [onChange],
  );

  const handleSelect = useCallback(
    (range: DateRange | undefined, triggerDate: Date) => {
      clickCount.current++;
      if (clickCount.current === 1) {
        const next = { from: triggerDate, to: undefined };
        setPendingRange(next);
        setStartText(formatInput(triggerDate));
        setEndText("");
        setStartError(false);
        setEndError(false);
        return;
      }
      setPendingRange(range);
      if (range?.from) setStartText(formatInput(range.from));
      if (range?.to) setEndText(formatInput(range.to));
      commitRange(range);
    },
    [commitRange],
  );

  const handlePreset = useCallback(
    (days: number) => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - days);
      onChange(format(start, "yyyy-MM-dd"), format(end, "yyyy-MM-dd"));
      setOpen(false);
    },
    [onChange],
  );

  const commitStart = useCallback(() => {
    if (!startText.trim()) {
      setStartError(false);
      setPendingRange((prev) =>
        prev ? { from: undefined, to: prev.to } : undefined,
      );
      return;
    }
    const parsed = parseInputDate(startText);
    if (!parsed) {
      setStartError(true);
      return;
    }
    setStartError(false);
    setStartText(formatInput(parsed));
    const sameAsCommitted = from === format(parsed, "yyyy-MM-dd");
    if (sameAsCommitted) return;
    setCalendarMonth(parsed);
    clickCount.current = 1;
    const prev = pendingRange;
    const next: DateRange = {
      from: parsed,
      to: prev?.to && !isBefore(prev.to, parsed) ? prev.to : undefined,
    };
    setPendingRange(next);
    if (next.from && next.to) commitRange(next);
  }, [startText, pendingRange, commitRange, from]);

  const commitEnd = useCallback(() => {
    if (!endText.trim()) {
      setEndError(false);
      setPendingRange((prev) =>
        prev ? { from: prev.from, to: undefined } : undefined,
      );
      return;
    }
    const parsed = parseInputDate(endText);
    if (!parsed) {
      setEndError(true);
      return;
    }
    setEndError(false);
    setEndText(formatInput(parsed));
    const sameAsCommitted = to === format(parsed, "yyyy-MM-dd");
    if (sameAsCommitted) return;
    setCalendarMonth(parsed);
    const prev = pendingRange;
    if (!prev?.from) {
      setPendingRange({ from: undefined, to: parsed });
      return;
    }
    if (isBefore(parsed, prev.from)) {
      const next: DateRange = { from: parsed, to: prev.from };
      setStartText(formatInput(parsed));
      setEndText(formatInput(prev.from));
      setPendingRange(next);
      commitRange(next);
      return;
    }
    const next: DateRange = { from: prev.from, to: parsed };
    setPendingRange(next);
    commitRange(next);
  }, [endText, pendingRange, commitRange, to]);

  const calendarSelected = useMemo(
    () =>
      pendingRange ??
      (from && to ? { from: parseISO(from), to: parseISO(to) } : undefined),
    [pendingRange, from, to],
  );

  const previewRange = useMemo(() => {
    if (!pendingRange?.from || pendingRange.to || !hoveredDate) return null;
    if (isSameDay(hoveredDate, pendingRange.from)) return null;
    const hoverBefore = isBefore(hoveredDate, pendingRange.from);
    const [start, end] = hoverBefore
      ? [hoveredDate, pendingRange.from]
      : [pendingRange.from, hoveredDate];
    return { start, end, hoverBefore };
  }, [pendingRange, hoveredDate]);

  const modifiers = useMemo(() => {
    if (!previewRange) return undefined;
    const { start, end, hoverBefore } = previewRange;
    return {
      preview_middle: (date: Date) =>
        !isSameDay(date, start) &&
        !isSameDay(date, end) &&
        isBefore(start, date) &&
        isBefore(date, end),
      preview_start: (date: Date) => hoverBefore && isSameDay(date, start),
      preview_end: (date: Date) => !hoverBefore && isSameDay(date, end),
    };
  }, [previewRange]);

  const modifiersClassNames = useMemo(
    () => ({
      preview_middle: "bg-muted rounded-none text-foreground",
      preview_start:
        "bg-muted rounded-l-(--cell-radius) rounded-r-none text-foreground",
      preview_end:
        "bg-muted rounded-r-(--cell-radius) rounded-l-none text-foreground",
    }),
    [],
  );

  const triggerContent = useMemo(() => {
    if (open && pendingRange?.from && !pendingRange.to) {
      return `${formatInput(pendingRange.from)} – …`;
    }
    if (hasValue && from && to) {
      return `${formatInput(parseISO(from))} – ${formatInput(parseISO(to))}`;
    }
    return label;
  }, [open, pendingRange, hasValue, from, to, label]);

  const tryAutoCommit = useCallback(
    (s: string, e: string) => {
      if (s.length !== 10 || e.length !== 10) return false;
      const ps = parseInputDate(s);
      const pe = parseInputDate(e);
      if (!ps || !pe) return false;
      const [a, b] = isBefore(pe, ps) ? [pe, ps] : [ps, pe];
      const aIso = format(a, "yyyy-MM-dd");
      const bIso = format(b, "yyyy-MM-dd");
      if (from === aIso && to === bIso) return false;
      onChange(aIso, bIso);
      setOpen(false);
      setHoveredDate(null);
      clickCount.current = 0;
      return true;
    },
    [from, to, onChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FilterButton active={hasValue} onClear={() => onChange(null, null)}>
          <CalendarBlank className="size-3.5" />
          {triggerContent}
        </FilterButton>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 border-b p-3">
            <InputGroup className="w-40">
              <InputGroupAddon>
                <CalendarBlank />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Start date"
                value={startText}
                onChange={(e) => {
                  const masked = maskDateInput(e.target.value);
                  setStartText(masked);
                  if (startError) setStartError(false);
                  if (masked.length === 10) {
                    const parsed = parseInputDate(masked);
                    if (parsed) setCalendarMonth(parsed);
                    if (!tryAutoCommit(masked, endText) && parsed) {
                      skipNextStartBlur.current = true;
                      endInputRef.current?.focus();
                    }
                  }
                }}
                onBlur={() => {
                  if (skipNextStartBlur.current) {
                    skipNextStartBlur.current = false;
                    return;
                  }
                  commitStart();
                }}
                onKeyDown={handleKeyDown}
                placeholder="MM/DD/YYYY"
                inputMode="numeric"
                maxLength={10}
                aria-invalid={startError}
                className="tabular-nums"
              />
            </InputGroup>
            <ArrowRight
              aria-hidden
              className="size-4 shrink-0 text-muted-foreground"
            />
            <InputGroup className="w-40">
              <InputGroupAddon>
                <CalendarBlank />
              </InputGroupAddon>
              <InputGroupInput
                ref={endInputRef}
                aria-label="End date"
                value={endText}
                onChange={(e) => {
                  const masked = maskDateInput(e.target.value);
                  setEndText(masked);
                  if (endError) setEndError(false);
                  if (masked.length === 10) {
                    const parsed = parseInputDate(masked);
                    if (parsed) setCalendarMonth(parsed);
                    tryAutoCommit(startText, masked);
                  }
                }}
                onBlur={commitEnd}
                onKeyDown={handleKeyDown}
                placeholder="MM/DD/YYYY"
                inputMode="numeric"
                maxLength={10}
                aria-invalid={endError}
                className="tabular-nums"
              />
            </InputGroup>
          </div>
          <div className="flex">
            <div className="flex flex-col gap-1 border-r p-3">
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={() => handlePreset(preset.days)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="p-3" onMouseLeave={() => setHoveredDate(null)}>
              <Calendar
                mode="range"
                numberOfMonths={2}
                selected={calendarSelected}
                onSelect={handleSelect}
                month={calendarMonth}
                onMonthChange={setCalendarMonth}
                modifiers={modifiers}
                modifiersClassNames={modifiersClassNames}
                classNames={{
                  week: "flex w-full",
                  day: "[&_button]:transition-none",
                }}
                onDayMouseEnter={(date) => {
                  setHoveredDate((prev) =>
                    prev && isSameDay(prev, date) ? prev : date,
                  );
                }}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
