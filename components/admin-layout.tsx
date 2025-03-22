"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LayoutDashboard, Users, ClipboardList, BarChart, Menu } from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const routes = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: pathname === "/admin/dashboard",
    },
    {
      href: "/admin/orders",
      label: "Órdenes",
      icon: ClipboardList,
      active: pathname === "/admin/orders",
    },
    {
      href: "/admin/users",
      label: "Usuarios",
      icon: Users,
      active: pathname === "/admin/users",
    },
    {
      href: "/admin/reports",
      label: "Reportes",
      icon: BarChart,
      active: pathname === "/admin/reports",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2 md:gap-4">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0">
                <div className="px-7">
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-2 font-bold"
                    onClick={() => setOpen(false)}
                  >
                    <span className="font-bold">Sistema de Productores</span>
                  </Link>
                </div>
                <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                  <div className="flex flex-col gap-2 pl-1 pr-7">
                    {routes.map((route) => (
                      <Link
                        key={route.href}
                        href={route.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                          route.active ? "bg-accent text-accent-foreground" : "transparent",
                        )}
                      >
                        <route.icon className="h-5 w-5" />
                        {route.label}
                      </Link>
                    ))}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
            <Link href="/admin/dashboard" className="hidden items-center gap-2 md:flex">
              <span className="text-xl font-bold">Sistema de Productores</span>
            </Link>
          </div>
          <nav className="hidden gap-6 md:flex">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                  route.active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}

