"use client"

import { usePathname } from "next/navigation"
import {
  ChatCircleText,
  Tray,
  Sparkle,
  ClipboardText,
  FlowArrow,
  ChartBar,
  Brain,
  PencilSimpleLine,
  PhoneCall,
  DotsThree,
  SuitcaseSimple,
  FileText,
  Users,
  CaretDown,
  DiamondsFour,
  Books,
  Stack,
  BookOpen,
  Compass,
} from "@phosphor-icons/react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"

const mainNavItems = [
  { title: "Tour", icon: Compass, href: "/tour" },
  { title: "Chat", icon: ChatCircleText, href: "/chat" },
  {
    title: "FileFlow Inbox",
    icon: Tray,
    href: "/fileflow-inbox",
    subItems: [
      { title: "Needs first response", badge: 8 },
      { title: "Needs response", badge: 3 },
      { title: "Urgent", badge: 2 },
    ],
  },
  { title: "Agents", icon: Sparkle, href: "/agents" },
  { title: "Intake", icon: ClipboardText, href: "/intake" },
  { title: "Playbooks", icon: BookOpen, href: "/playbooks" },
  { title: "Workflows", icon: FlowArrow, href: "/workflows" },
  { title: "Knowledge Base", icon: Books, href: "/knowledge" },
  { title: "Templates", icon: Stack, href: "/templates" },
  { title: "Reporting", icon: ChartBar, href: "/reporting" },
  { title: "DocIntel", icon: Brain, href: "/docintel" },
  { title: "Drafting", icon: PencilSimpleLine, href: "/drafting" },
  { title: "Voice", icon: PhoneCall, href: "/voice" },
  { title: "More", icon: DotsThree, href: "/more" },
]

const recordItems = [
  { title: "Cases", icon: SuitcaseSimple, href: "/cases" },
  { title: "Documents", icon: FileText, href: "/documents" },
  { title: "Contacts", icon: Users, href: "/contacts" },
]

export function AppSidebar() {
  const pathname = usePathname() ?? "/"
  const isActive = (href: string) => {
    // FileFlow Inbox is mounted at root, so "/" and "/fileflow-inbox/*" both count
    if (href === "/fileflow-inbox") {
      return pathname === "/" || pathname.startsWith("/fileflow-inbox")
    }
    if (href === "/") return pathname === "/"
    return pathname === href || pathname.startsWith(href + "/")
  }
  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="h-12 border-b border-gray-200 flex items-center justify-center px-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-800 text-white text-[10px] font-bold">
                V
              </div>
              <span className="font-semibold text-sm text-zinc-700">
                John Lawyer
              </span>
              <CaretDown className="ml-auto h-4 w-4 text-zinc-500" weight="bold" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {mainNavItems.map((item) => {
              const active = isActive(item.href)
              if (item.subItems) {
                return (
                  <Collapsible key={item.title} defaultOpen={active}>
                    <SidebarMenuItem>
                      <CollapsibleTrigger
                        render={
                          <SidebarMenuButton
                            className={
                              active
                                ? "bg-blue-50 text-blue-800 font-semibold hover:bg-blue-100"
                                : ""
                            }
                          />
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        <CaretDown className="ml-auto h-3 w-3" weight="bold" />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.subItems.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton href="#">
                                <span>{subItem.title}</span>
                              </SidebarMenuSubButton>
                              <SidebarMenuBadge className="text-xs text-gray-500 font-semibold">
                                {subItem.badge}
                              </SidebarMenuBadge>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )
              }
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<a href={item.href} />}
                    className={
                      active
                        ? "bg-blue-50 text-blue-800 font-semibold hover:bg-blue-100"
                        : ""
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-zinc-500 font-medium">
            Records
          </SidebarGroupLabel>
          <SidebarMenu>
            {recordItems.map((item) => {
              const active = isActive(item.href)
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<a href={item.href} />}
                    className={
                      active
                        ? "bg-blue-50 text-blue-800 font-semibold hover:bg-blue-100"
                        : ""
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="rounded-lg border border-slate-100 bg-white p-3 backdrop-blur-sm">
          <p className="text-sm font-medium text-zinc-900">Upgrade</p>
          <p className="text-xs text-zinc-500 leading-tight">
            Get access to premium features in seconds.
          </p>
          <Button variant="outline" size="sm" className="mt-3 w-full text-sm">
            <DiamondsFour className="mr-2 h-4 w-4" />
            Upgrade
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
