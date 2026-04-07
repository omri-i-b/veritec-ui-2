"use client"

import { useState, useMemo } from "react"
import {
  Tray,
  UploadSimple,
  SortAscending,
  Funnel,
  SquaresFour,
  MagnifyingGlass,
  DotsThreeVertical,
  User,
  ListBullets,
  CalendarBlank,
  FileText,
  Tag,
  FolderOpen,
  CheckCircle,
  CaretRight,
  CaretUp,
  CaretDown,
  SuitcaseSimple,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
// Grouped sections use plain React state for collapse/expand

type FileRecord = {
  fileName: string
  email: string
  due: string
  filingDate: string
  projectName: string
  documentType: string
  status: "Filing Completed" | "Filing Error" | "Classifier Error"
  leadLawyer: string
  caseNumber: string
  reviewedBy: string
}

const reviewers = ["John", "James", "Bob", "Dylan", "John J.", "Sam"]

const sampleData: FileRecord[] = [
  {
    fileName: "2025-07-29 Mo...",
    email: "no-reply@filin...",
    due: "3/10/2026",
    filingDate: "7/29/2025",
    projectName: "Company 1 - 0...",
    documentType: "Affidavit",
    status: "Filing Completed",
    leadLawyer: "N/A",
    caseNumber: "2025CI03480",
    reviewedBy: "John",
  },
  {
    fileName: "983546EF.pdf",
    email: "no-reply@filin...",
    due: "No Date",
    filingDate: "7/29/2025",
    projectName: "Company 1 - 0...",
    documentType: "N/A",
    status: "Filing Error",
    leadLawyer: "N/A",
    caseNumber: "DC-24-09558",
    reviewedBy: "James",
  },
  {
    fileName: "25-07-28 Hill K...",
    email: "no-reply@filin...",
    due: "No Date",
    filingDate: "7/29/2025",
    projectName: "N/A",
    documentType: "Motion",
    status: "Classifier Error",
    leadLawyer: "N/A",
    caseNumber: "2025CI03480",
    reviewedBy: "Bob",
  },
  {
    fileName: "2025-07-29 Mo...",
    email: "no-reply@filin...",
    due: "3/10/2026",
    filingDate: "7/29/2025",
    projectName: "Company 1 - 0...",
    documentType: "Affidavit",
    status: "Filing Completed",
    leadLawyer: "N/A",
    caseNumber: "2025CI03480",
    reviewedBy: "John",
  },
  {
    fileName: "983546EF.pdf",
    email: "no-reply@filin...",
    due: "No Date",
    filingDate: "7/29/2025",
    projectName: "Company 1 - 0...",
    documentType: "N/A",
    status: "Filing Error",
    leadLawyer: "N/A",
    caseNumber: "DC-24-09558",
    reviewedBy: "Dylan",
  },
  {
    fileName: "25-07-28 Hill K...",
    email: "no-reply@filin...",
    due: "No Date",
    filingDate: "7/29/2025",
    projectName: "N/A",
    documentType: "Motion",
    status: "Classifier Error",
    leadLawyer: "N/A",
    caseNumber: "2025CI03480",
    reviewedBy: "John J.",
  },
  {
    fileName: "2025-07-29 Mo...",
    email: "no-reply@filin...",
    due: "3/10/2026",
    filingDate: "7/29/2025",
    projectName: "Company 1 - 0...",
    documentType: "Affidavit",
    status: "Filing Completed",
    leadLawyer: "N/A",
    caseNumber: "2025CI03480",
    reviewedBy: "Sam",
  },
  {
    fileName: "983546EF.pdf",
    email: "no-reply@filin...",
    due: "No Date",
    filingDate: "7/29/2025",
    projectName: "Company 1 - 0...",
    documentType: "N/A",
    status: "Filing Error",
    leadLawyer: "N/A",
    caseNumber: "DC-24-09558",
    reviewedBy: "John",
  },
  {
    fileName: "25-07-28 Hill K...",
    email: "no-reply@filin...",
    due: "No Date",
    filingDate: "7/29/2025",
    projectName: "N/A",
    documentType: "Motion",
    status: "Classifier Error",
    leadLawyer: "N/A",
    caseNumber: "2025CI03480",
    reviewedBy: "James",
  },
  {
    fileName: "2025-07-29 Mo...",
    email: "no-reply@filin...",
    due: "3/10/2026",
    filingDate: "7/29/2025",
    projectName: "Company 1 - 0...",
    documentType: "Affidavit",
    status: "Filing Completed",
    leadLawyer: "N/A",
    caseNumber: "2025CI03480",
    reviewedBy: "Bob",
  },
  {
    fileName: "983546EF.pdf",
    email: "no-reply@filin...",
    due: "No Date",
    filingDate: "7/29/2025",
    projectName: "Company 1 - 0...",
    documentType: "N/A",
    status: "Filing Error",
    leadLawyer: "N/A",
    caseNumber: "DC-24-09558",
    reviewedBy: "John",
  },
  {
    fileName: "25-07-28 Hill K...",
    email: "no-reply@filin...",
    due: "No Date",
    filingDate: "7/29/2025",
    projectName: "N/A",
    documentType: "Motion",
    status: "Classifier Error",
    leadLawyer: "N/A",
    caseNumber: "2025CI03480",
    reviewedBy: "Dylan",
  },
  {
    fileName: "2025-07-29 Mo...",
    email: "no-reply@filin...",
    due: "3/10/2026",
    filingDate: "7/29/2025",
    projectName: "Company 1 - 0...",
    documentType: "Affidavit",
    status: "Filing Completed",
    leadLawyer: "N/A",
    caseNumber: "2025CI03480",
    reviewedBy: "John",
  },
  {
    fileName: "983546EF.pdf",
    email: "no-reply@filin...",
    due: "No Date",
    filingDate: "7/29/2025",
    projectName: "Company 1 - 0...",
    documentType: "N/A",
    status: "Filing Error",
    leadLawyer: "N/A",
    caseNumber: "DC-24-09558",
    reviewedBy: "Sam",
  },
  {
    fileName: "25-07-28 Hill K...",
    email: "no-reply@filin...",
    due: "No Date",
    filingDate: "7/29/2025",
    projectName: "N/A",
    documentType: "Motion",
    status: "Classifier Error",
    leadLawyer: "N/A",
    caseNumber: "2025CI03480",
    reviewedBy: "John J.",
  },
]

// ── Filter category definitions ──────────────────────────────────────

type FilterCategory = {
  id: string
  label: string
  icon: React.ReactNode
  options: string[]
  filterKey: keyof FileRecord
}

const filterCategories: FilterCategory[] = [
  {
    id: "dateRange",
    label: "Date Range",
    icon: <CalendarBlank className="h-4 w-4" />,
    options: ["3/10/2026", "No Date"],
    filterKey: "due",
  },
  {
    id: "document",
    label: "Document",
    icon: <FileText className="h-4 w-4" />,
    options: ["Affidavit", "Motion", "N/A"],
    filterKey: "documentType",
  },
  {
    id: "leadLawyer",
    label: "Lead Lawyer",
    icon: <User className="h-4 w-4" />,
    options: ["N/A"],
    filterKey: "leadLawyer",
  },
  {
    id: "classification",
    label: "Classification",
    icon: <Tag className="h-4 w-4" />,
    options: ["Filing Completed", "Filing Error", "Classifier Error"],
    filterKey: "status",
  },
  {
    id: "filing",
    label: "Filing",
    icon: <FolderOpen className="h-4 w-4" />,
    options: ["Company 1 - 0...", "N/A"],
    filterKey: "projectName",
  },
  {
    id: "reviewed",
    label: "Reviewed",
    icon: <CheckCircle className="h-4 w-4" />,
    options: ["John Smith", "James Smith", "Bob Smith", "Dylan Smith", "John Johnson", "Sam Miller"],
    filterKey: "reviewedBy",
  },
]

// ── Filter Popover Component ─────────────────────────────────────────

type ActiveFilters = Record<string, string[]>

function FilterPopover({
  activeFilters,
  onFiltersChange,
}: {
  activeFilters: ActiveFilters
  onFiltersChange: (filters: ActiveFilters) => void
}) {
  const [open, setOpen] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const activeFilterCount = Object.values(activeFilters).reduce(
    (sum, arr) => sum + arr.length,
    0
  )

  const handleCheckboxChange = (categoryId: string, option: string, checked: boolean) => {
    const current = activeFilters[categoryId] || []
    const updated = checked
      ? [...current, option]
      : current.filter((v) => v !== option)

    const newFilters = { ...activeFilters }
    if (updated.length > 0) {
      newFilters[categoryId] = updated
    } else {
      delete newFilters[categoryId]
    }
    onFiltersChange(newFilters)
  }

  const expandedCategoryData = filterCategories.find((c) => c.id === expandedCategory)
  const filteredOptions = expandedCategoryData?.options.filter((opt) =>
    opt.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) {
          setExpandedCategory(null)
          setSearchQuery("")
        }
      }}
    >
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={
              activeFilterCount > 0
                ? "border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100"
                : open
                  ? "border-blue-300 bg-blue-50 text-blue-800"
                  : ""
            }
          />
        }
      >
        <Funnel className="mr-1.5 h-4 w-4" />
        Filter
        {activeFilterCount > 0 && (
          <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-medium text-white">
            {activeFilterCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto p-0 gap-0"
      >
        <div className="flex">
          {/* Category list */}
          <div className="w-[200px] py-1">
            {filterCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setExpandedCategory(
                    expandedCategory === category.id ? null : category.id
                  )
                  setSearchQuery("")
                }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  expandedCategory === category.id ? "bg-gray-50" : ""
                }`}
              >
                <span className="text-zinc-500">{category.icon}</span>
                <span className="flex-1 text-left text-zinc-700">{category.label}</span>
                <CaretRight className="h-3.5 w-3.5 text-zinc-400" />
              </button>
            ))}
          </div>

          {/* Submenu panel */}
          {expandedCategoryData && (
            <div className="w-[200px] border-l border-gray-200 py-1">
              {/* Search input */}
              <div className="px-2 pb-1.5 pt-1">
                <div className="relative">
                  <MagnifyingGlass className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                  <Input
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-7 text-sm"
                  />
                </div>
              </div>

              {/* Checkbox options */}
              <div className="max-h-[240px] overflow-y-auto">
                {filteredOptions?.map((option) => {
                  const isChecked = (
                    activeFilters[expandedCategoryData.id] || []
                  ).includes(option)

                  return (
                    <label
                      key={option}
                      className="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 hover:bg-gray-50 transition-colors"
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(
                            expandedCategoryData.id,
                            option,
                            checked as boolean
                          )
                        }
                      />
                      <span className="text-sm text-zinc-700">{option}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ── Status and Document Type Badges ──────────────────────────────────

function StatusBadge({ status }: { status: FileRecord["status"] }) {
  const variants: Record<FileRecord["status"], { className: string }> = {
    "Filing Completed": {
      className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-50",
    },
    "Filing Error": {
      className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50",
    },
    "Classifier Error": {
      className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50",
    },
  }

  return (
    <Badge variant="outline" className={variants[status].className}>
      {status}
    </Badge>
  )
}

function DocumentTypeBadge({ type }: { type: string }) {
  if (type === "N/A") {
    return <span className="text-red-500 font-medium text-sm">N/A</span>
  }

  const colors: Record<string, string> = {
    Affidavit: "text-blue-700",
    Motion: "text-green-700",
  }

  return (
    <span className={`font-medium text-sm ${colors[type] || "text-zinc-700"}`}>
      {type}
    </span>
  )
}

// ── Data Row (shared between flat and grouped views) ─────────────────

function DataRow({ row, index }: { row: FileRecord; index: number }) {
  return (
    <TableRow
      className="hover:bg-gray-50 group/row cursor-pointer"
      onClick={() =>
        (window.location.href = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/fileflow-inbox/${index}`)
      }
    >
      <TableCell className="text-sm text-zinc-700 truncate max-w-[140px]">
        {row.fileName}
      </TableCell>
      <TableCell className="text-sm text-zinc-500 truncate max-w-[140px]">
        {row.email}
      </TableCell>
      <TableCell className="text-sm text-zinc-700 font-medium">
        {row.due === "No Date" ? (
          <span className="text-zinc-400">{row.due}</span>
        ) : (
          row.due
        )}
      </TableCell>
      <TableCell className="text-sm text-zinc-500">
        {row.filingDate}
      </TableCell>
      <TableCell className="text-sm text-zinc-500 truncate max-w-[140px]">
        {row.projectName === "N/A" ? (
          <span className="text-zinc-400">{row.projectName}</span>
        ) : (
          row.projectName
        )}
      </TableCell>
      <TableCell>
        <DocumentTypeBadge type={row.documentType} />
      </TableCell>
      <TableCell>
        <StatusBadge status={row.status} />
      </TableCell>
      <TableCell className="text-sm text-zinc-500">
        {row.leadLawyer}
      </TableCell>
      <TableCell className="text-sm text-zinc-500">
        {row.caseNumber}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100">
            <User className="h-3 w-3 text-zinc-500" />
          </div>
          <span className="text-sm text-zinc-700">
            {row.reviewedBy}
          </span>
        </div>
      </TableCell>
      <TableCell className="sticky right-0 bg-white group-hover/row:bg-gray-50">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
        >
          <DotsThreeVertical className="h-4 w-4 text-zinc-400" weight="bold" />
        </Button>
      </TableCell>
    </TableRow>
  )
}

// ── Grouped Table View ───────────────────────────────────────────────

function GroupedTableView({ data }: { data: FileRecord[] }) {
  const groups = useMemo(() => {
    const map = new Map<string, FileRecord[]>()
    data.forEach((row) => {
      const key = row.projectName
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(row)
    })
    return Array.from(map.entries())
  }, [data])

  // Track which groups are collapsed
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const toggleGroup = (name: string) => {
    setCollapsed((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  return (
    <div className="rounded-md border border-gray-200 overflow-auto flex-1">
      <Table className="min-w-[1200px]">
        <TableBody>
          {groups.map(([groupName, rows]) => {
            const isCollapsed = collapsed[groupName] ?? false
            return (
              <GroupRows
                key={groupName}
                groupName={groupName}
                rows={rows}
                isCollapsed={isCollapsed}
                onToggle={() => toggleGroup(groupName)}
              />
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

function GroupRows({
  groupName,
  rows,
  isCollapsed,
  onToggle,
}: {
  groupName: string
  rows: FileRecord[]
  isCollapsed: boolean
  onToggle: () => void
}) {
  return (
    <>
      {/* Group header as a regular table row */}
      <TableRow
        className="bg-gray-50 hover:bg-gray-100 cursor-pointer"
        onClick={onToggle}
      >
        <TableCell colSpan={11} className="py-2.5">
          <div className="flex items-center gap-2.5">
            <SuitcaseSimple className="h-4 w-4 text-zinc-500 shrink-0" />
            <span className="text-sm font-semibold text-zinc-900 flex-1">
              {groupName}
            </span>
            {isCollapsed ? (
              <CaretDown className="h-4 w-4 text-zinc-400 shrink-0" />
            ) : (
              <CaretUp className="h-4 w-4 text-zinc-400 shrink-0" />
            )}
          </div>
        </TableCell>
      </TableRow>

      {/* Data rows when expanded */}
      {!isCollapsed &&
        rows.map((row, i) => <DataRow key={i} row={row} index={i} />)}
    </>
  )
}

// ── Flat Table View ──────────────────────────────────────────────────

function FlatTableView({ data }: { data: FileRecord[] }) {
  return (
    <div className="rounded-md border border-gray-200 overflow-auto flex-1">
      <Table className="min-w-[1200px]">
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableHead className="text-xs font-medium text-zinc-500 w-[140px]">
              File name
            </TableHead>
            <TableHead className="text-xs font-medium text-zinc-500 w-[140px]">
              Email
            </TableHead>
            <TableHead className="text-xs font-medium text-zinc-500 w-[100px]">
              Due
            </TableHead>
            <TableHead className="text-xs font-medium text-zinc-500 w-[100px]">
              Filing Date
            </TableHead>
            <TableHead className="text-xs font-medium text-zinc-500 w-[140px]">
              Project Name
            </TableHead>
            <TableHead className="text-xs font-medium text-zinc-500 w-[120px]">
              Document Type
            </TableHead>
            <TableHead className="text-xs font-medium text-zinc-500 w-[140px]">
              Status
            </TableHead>
            <TableHead className="text-xs font-medium text-zinc-500 w-[100px]">
              Lead Lawyer
            </TableHead>
            <TableHead className="text-xs font-medium text-zinc-500 w-[120px]">
              Case Number
            </TableHead>
            <TableHead className="text-xs font-medium text-zinc-500 w-[100px]">
              Reviewed by
            </TableHead>
            <TableHead className="w-[40px] sticky right-0 bg-gray-50" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <DataRow key={i} row={row} index={i} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// ── Main Inbox Component ─────────────────────────────────────────────

export function FileFlowInbox() {
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({})
  const [isGrouped, setIsGrouped] = useState(false)

  const filteredData = useMemo(() => {
    if (Object.keys(activeFilters).length === 0) return sampleData

    return sampleData.filter((row) => {
      return Object.entries(activeFilters).every(([categoryId, selectedValues]) => {
        const category = filterCategories.find((c) => c.id === categoryId)
        if (!category || selectedValues.length === 0) return true

        const rowValue = row[category.filterKey]
        if (categoryId === "reviewed") {
          return selectedValues.some((v) =>
            v.toLowerCase().startsWith(rowValue.toLowerCase())
          )
        }
        return selectedValues.includes(rowValue)
      })
    })
  }, [activeFilters])

  return (
    <div className="flex flex-1 flex-col">
      {/* Top header bar */}
      <div className="flex h-12 items-center border-b border-gray-200 px-4">
        <Tray className="mr-2 h-4 w-4 text-zinc-500" weight="bold" />
        <h1 className="text-sm font-semibold text-zinc-900">FileFlow Inbox</h1>
      </div>

      {/* Content area */}
      <div className="flex flex-1 flex-col p-6">
        {/* Title row */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-900">All Inboxes</h2>
          <Button variant="outline" size="sm">
            <UploadSimple className="mr-2 h-4 w-4" />
            Upload File
          </Button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 mb-4">
          <Button variant="outline" size="sm" className="text-sm">
            <div className="mr-1.5 h-2 w-2 rounded-full bg-zinc-400" />
            Default View
          </Button>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsGrouped(!isGrouped)}
              className={
                isGrouped
                  ? "border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100"
                  : ""
              }
            >
              <ListBullets className="mr-1.5 h-4 w-4" />
              Group
              {isGrouped && (
                <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-medium text-white">
                  1
                </span>
              )}
            </Button>
            <Button variant="outline" size="sm">
              <SortAscending className="mr-1.5 h-4 w-4" />
              Sort
            </Button>
            <FilterPopover
              activeFilters={activeFilters}
              onFiltersChange={setActiveFilters}
            />
            <Button variant="outline" size="icon" className="h-8 w-8">
              <SquaresFour className="h-4 w-4" />
            </Button>
            <div className="relative">
              <MagnifyingGlass className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Search Files"
                className="h-8 w-48 pl-8 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Data table — flat or grouped */}
        {isGrouped ? (
          <GroupedTableView data={filteredData} />
        ) : (
          <FlatTableView data={filteredData} />
        )}
      </div>
    </div>
  )
}
