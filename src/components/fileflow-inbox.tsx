"use client"

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
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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
    reviewedBy: "John",
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
    reviewedBy: "John",
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
    reviewedBy: "John",
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
    reviewedBy: "John",
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
    reviewedBy: "John",
  },
]

function StatusBadge({ status }: { status: FileRecord["status"] }) {
  const variants: Record<
    FileRecord["status"],
    { className: string }
  > = {
    "Filing Completed": {
      className:
        "bg-green-50 text-green-700 border-green-200 hover:bg-green-50",
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

export function FileFlowInbox() {
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
            <Button variant="outline" size="sm">
              <ListBullets className="mr-1.5 h-4 w-4" />
              Group
            </Button>
            <Button variant="outline" size="sm">
              <SortAscending className="mr-1.5 h-4 w-4" />
              Sort
            </Button>
            <Button variant="outline" size="sm">
              <Funnel className="mr-1.5 h-4 w-4" />
              Filter
            </Button>
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

        {/* Data table */}
        <div className="rounded-md border border-gray-200 overflow-auto flex-1">
          <Table>
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
                <TableHead className="w-[40px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleData.map((row, i) => (
                <TableRow key={i} className="hover:bg-gray-50">
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
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                    >
                      <DotsThreeVertical className="h-4 w-4 text-zinc-400" weight="bold" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
