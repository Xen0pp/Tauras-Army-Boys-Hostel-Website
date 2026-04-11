"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

import { Separator } from "../../ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../ui/breadcrumb";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarInset,
} from "../../ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../ui/tooltip";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { DropdownMenu, DropdownMenuGroup } from "@radix-ui/react-dropdown-menu";
import { useTheme } from "next-themes";
import {
  ChevronsUpDown,
  SunMoon,
  GraduationCap,
  Users,
  Target,
  MessageSquare,
  Home,
  User,
  Briefcase,
  Calendar,
  BookOpen,
  Info,
  Phone,
  Settings,
  Bell,
  LogOut,
  FileText,
  CircleUserRound,
  BadgeCheck,
  Building2,
  Camera,
  Shield,
} from "lucide-react";
import TaurasLogo from "/public/assets/Picture.png";
import { useAuth } from "@/contexts/AuthContext";

// ─── AppSidebarInset ────────────────────────────────────────────────────────

export function AppSidebarInset({ children }) {
  const { theme, setTheme } = useTheme();

  console.log(theme);

  return (
    <SidebarInset className="overflow-x-hidden ">
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 justify-between border-b dark:bg-[--sidebar-bg]  ">
        <div className="flex items-center gap-2 px-4 ">
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarTrigger id="trigger" className="-ml-1" />
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start">
              Toggle Sidebar <kbd className="ml-2">⌘+b</kbd>
            </TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="hidden md:block">
                  Alumni Portal
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Branding in the middle */}
        <div className="flex items-center gap-1 sm:gap-2 absolute left-1/2 -translate-x-1/2 pointer-events-none">
          <Image src={TaurasLogo} alt="TABH Logo" width={35} height={35} className="rounded-sm w-[25px] h-[25px] sm:w-[35px] sm:h-[35px]" />
          <h2 className="font-bold text-[10px] sm:text-sm md:text-lg text-[#2A2470] whitespace-nowrap">
            Tauras Army Boys Hostel
          </h2>
        </div>

        <div className="mr-2 sm:mr-4">
          {/* Theme switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                id="variant"
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground "
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground border-none outline-none">
                  <SunMoon className="size-4" />
                </div>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="end"
              side="top"
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Themes
              </DropdownMenuLabel>
              {[
                { name: "Light", key: "light" },
                { name: "Dark", key: "dark" },
                { name: "System", key: "system" },
              ].map((theme, index) => (
                <DropdownMenuItem
                  id={theme.name}
                  key={theme.name}
                  onClick={() => setTheme(theme.key)}
                  className="gap-2 p-2"
                >
                  {theme.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="h-[calc(100vh-4rem)] overflow-hidden bg-[--base-bg] dark:bg-[--light-bg-dark]">
        {children}
      </div>
    </SidebarInset>
  );
}

// ─── Navigation Structure ────────────────────────────────────────────────────

const navigationGroups = [
  {
    title: "Main",
    items: [
      { title: "Dashboard", url: "/portal", icon: Home },
      { title: "Eligibility", url: "/portal/eligibility", icon: FileText },
      { title: "Rooms & Facilities", url: "/portal/rooms-facilities", icon: Building2 },
      { title: "Gallery", url: "/portal/gallery", icon: Camera },
      { title: "TABH Administration", url: "/portal/administration", icon: Shield },
      { title: "Events", url: "/portal/events", icon: Calendar },
    ],
  },
  {
    title: "Resources",
    items: [
      { title: "About TABH", url: "/portal/about-alumni", icon: Info },
      { title: "Contact", url: "/portal/contact", icon: Phone },
    ],
  },
];

// ─── DemoSidebar ─────────────────────────────────────────────────────────────

export function DemoSidebar() {
  const { user, userInfo, signOut } = useAuth();

  const getNavigationGroups = () => {
    const groups = [...navigationGroups];
    return groups;
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/portal">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden">
                  <Image src={TaurasLogo} alt="TABH Logo" width={32} height={32} />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-[#2A2470]">Tauras Army Boys Hostel</span>
                  <span className="truncate text-xs text-[#2A2470]/70">Hostel Portal</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {getNavigationGroups().map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <CircleUserRound className="h-8 w-8" />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {userInfo?.firstName || "User"} {userInfo?.lastName || ""}
                    </span>
                    <span className="truncate text-xs">
                      {user?.email || "user@example.com"}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <CircleUserRound className="h-8 w-8" />
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {userInfo?.firstName || "User"} {userInfo?.lastName || ""}
                      </span>
                      <span className="truncate text-xs">
                        {user?.email || "user@example.com"}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/portal/profile">
                      <BadgeCheck className="w-4 h-4" />
                      Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/portal/settings">
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/portal/notifications">
                      <Bell className="w-4 h-4" />
                      Notifications
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => signOut()}
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}