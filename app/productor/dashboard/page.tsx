"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { ProductorLayout } from "@/components/productor-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OrdersTable } from "@/components/orders-table"
import { CreateOrderForm } from "@/components/create-order-form"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function ProductorDashboard() {
  const [loading, setLoading] = useState(true)
  const [isProducer, setIsProducer] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  // Solo crear el cliente de Supabase después de que el componente se monte en el cliente
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    // Solo ejecutar este código en el cliente
    if (!isMounted) return

    const checkProducer = async () => {
      try {
        const supabase = createClientComponentClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

        if (profile?.role === "admin") {
          router.push("/admin/dashboard")
          return
        }

        setIsProducer(true)
      } catch (error) {
        console.error("Error verificando rol de productor:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkProducer()
  }, [router, isMounted])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!isProducer) {
    return null // No renderizar nada mientras redirige
  }

  return (
    <ProductorLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Panel de Productor</h2>
          <Button
            onClick={() => {
              if (isMounted) {
                const supabase = createClientComponentClient()
                supabase.auth.signOut().then(() => router.push("/login"))
              }
            }}
          >
            Cerrar Sesión
          </Button>
        </div>

        <div className="flex justify-end">
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nueva Orden
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Crear Nueva Orden</DialogTitle>
              </DialogHeader>
              <CreateOrderForm onSuccess={() => setOpenDialog(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mis Órdenes</CardTitle>
            <CardDescription>Historial de órdenes enviadas y su estado actual</CardDescription>
          </CardHeader>
          <CardContent>
            <OrdersTable isAdmin={false} />
          </CardContent>
        </Card>
      </div>
    </ProductorLayout>
  )
}

