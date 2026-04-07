"use client"

import {
  MessageCircle,
  Inbox,
  Sparkles,
  ClipboardList,
  Workflow,
  BarChart3,
  Brain,
  PenTool,
  Phone,
  MoreHorizontal,
  Briefcase,
  FileText,
  Users,
  ChevronDown,
  Sparkle,
} from "lucide-react"
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
  { title: "Chat", icon: MessageCircle, href: "/chat" },
  {
    title: "FileFlow Inbox",
    icon: Inbox,
    href: "/fileflow-inbox",
    active: true,
    subItems: [
      { title: "Needs first response", badge: 8 },
      { title: "Needs response", badge: 3 },
      { title: "Urgent", badge: 2 },
    ],
  },
  { title: "Agents", icon: Sparkles, href: "/agents" },
  { title: "Intake", icon: ClipboardList, href: "/intake" },
  { title: "Workflows", icon: Workflow, href: "/workflows" },
  { title: "Reporting", icon: BarChart3, href: "/reporting" },
  { title: "DocIntel", icon: Brain, href: "/docintel" },
  { title: "Drafting", icon: PenTool, href: "/drafting" },
  { title: "Voice", icon: Phone, href: "/voice" },
  { title: "More", icon: MoreHorizontal, href: "/more" },
]

const recordItems = [
  { title: "Cases", icon: Briefcase, href: "/cases" },
  { title: "Documents", icon: FileText, href: "/documents" },
  { title: "Contacts", icon: Users, href: "/contacts" },
]

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-800 text-white text-[10px] font-bold">
                V
              </div>
              <span className="font-semibold text-sm text-zinc-700">
                John Lawyer
              </span>
              <ChevronDown className="ml-auto h-4 w-4 text-zinc-500" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {mainNavItems.map((item) =>
              item.subItems ? (
                <Collapsible key={item.title} defaultOpen={item.active}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger
                      render={
                        <SidebarMenuButton
                          className={
                            item.active
                              ? "bg-blue-50 text-blue-800 font-semibold hover:bg-blue-100"
                              : ""
                          }
                        />
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      <ChevronDown className="ml-auto h-3 w-3" />
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
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton render={<a href={item.href} />}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            )}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-zinc-500 font-medium">
            Records
          </SidebarGroupLabel>
          <SidebarMenu>
            {recordItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton render={<a href={item.href} />}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
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
            <Sparkle className="mr-2 h-4 w-4" />
            Upgrade
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
