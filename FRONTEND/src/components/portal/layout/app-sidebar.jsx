"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users,
  Target,
  MessageSquare,
  Home,
  Calendar,
  Info,
  Phone,
  Settings,
  Bell,
  LogOut,
  FileText,
  CircleUserRound,
  ChevronsUpDown,
  BadgeCheck,
  Building2,
  Camera,
  UserCog
} from "lucide-react";

import TaurasLogo from "/public/assets/TaurasLogo.jpg";
import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../../components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

// Navigation structure
const publicItems = [
  "Dashboard",
  "Eligibility",
  "About TABH",
  "Contact",
  "Rooms & Facilities",
  "Gallery",
];

const navigationGroups = [
  {
    title: "Main",
    items: [
      {
        title: "Dashboard",
        url: "/portal",
        icon: Home,
      },
      {
        title: "Eligibility",
        url: "/portal/eligibility",
        icon: FileText,
      },
      {
        title: "Rooms & Facilities",
        url: "/portal/rooms-facilities",
        icon: Building2,
      },
      {
        title: "Gallery",
        url: "/portal/gallery",
        icon: Camera,
      },
    ],
  },
  {
    title: "Brotherhood Network",
    items: [
      {
        title: "Alumni",
        url: "/portal/alumni-list",
        icon: Users,
      },
      {
        title: "Events",
        url: "/portal/events",
        icon: Calendar,
      },
    ],
  },
  {
    title: "Guidance & Mentorship",
    items: [
      {
        title: "Mentorship Hub",
        url: "/portal/mentorship",
        icon: Target,
      },
      {
        title: "Find Mentors",
        url: "/portal/mentorship/mentors",
        icon: Users,
      },
      {
        title: "Become a Mentor",
        url: "/portal/mentorship/apply-mentor",
        icon: MessageSquare,
      },
      {
        title: "My Connections",
        url: "/portal/mentorship/my-connections",
        icon: Users,
      },
    ],
  },
  {
    title: "Resources",
    items: [
      {
        title: "About TABH",
        url: "/portal/about-alumni",
        icon: Info,
      },
      {
        title: "Contact",
        url: "/portal/contact",
        icon: Phone,
      },
    ],
  },
];

export function AppSidebar() {
  const { user, userInfo, signOut } = useAuth();

  // Add admin items for superusers
  const getNavigationGroups = () => {
    const groups = navigationGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          user ? true : publicItems.includes(item.title)
        ),
      }))
      .filter((group) => group.items.length > 0);

    // Add Admin Panel for admin users
    if (userInfo?.role?.id == 3 || userInfo?.role?.id === "3" || (user && user.email === 'mohitkumarbiswas9@gmail.com')) {
      groups.push({
        title: "Administration",
        items: [
          {
            title: "Admin Panel",
            url: "/portal/admin",
            icon: UserCog,
          },
        ],
      });
    }

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
            {user ? (
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
            ) : (
              <SidebarMenuButton asChild size="lg">
                <Link href="/login">
                  <LogOut className="h-8 w-8 rotate-180" />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-vips-maroon">Sign In</span>
                    <span className="truncate text-xs">to access more features</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}