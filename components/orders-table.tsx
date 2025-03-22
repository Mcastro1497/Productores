"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Order {
  id: string
  created_at: string
  producer_id: string
  producer_name: string
  description: string
  status: "Pendiente" | "Cargada" | "Operada"
  details: any
}

interface OrdersTableProps {
  isAdmin: boolean
}

export function OrdersTable({ isAdmin }: OrdersTableProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Solo crear el cliente de Supabase después de que el componente se monte en el cliente
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    // Solo ejecutar este código en el cliente
    if (!isMounted) return

    const supabase = createClientComponentClient()

    const fetchOrders = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        console.log("Usuario actual:", user.id, "Es admin:", isAdmin)

        let query = supabase
          .from("orders")
          .select(`
          id,
          created_at,
          producer_id,
          description,
          status,
          details,
          profiles(full_name)
        `)
          .order("created_at", { ascending: false })

        if (!isAdmin) {
          query = query.eq("producer_id", user.id)
        }

        const { data, error } = await query

        console.log("Datos de órdenes:", data, "Error:", error)

        if (error) throw error

        const formattedOrders = data.map((order) => ({
          id: order.id,
          created_at: order.created_at,
          producer_id: order.producer_id,
          producer_name: order.profiles?.full_name || "Desconocido",
          description: order.description,
          status: order.status,
          details: order.details,
        }))

        setOrders(formattedOrders)
      } catch (error) {
        console.error("Error al cargar órdenes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()

    // Suscribirse a cambios en tiempo real
    let channel: any = null
    const supabaseRealtime = createClientComponentClient()

    if (isMounted) {
      channel = supabaseRealtime
        .channel("orders-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "orders",
          },
          () => {
            fetchOrders()
          },
        )
        .subscribe()
    }

    return () => {
      if (channel && isMounted) {
        supabaseRealtime.removeChannel(channel)
      }
    }
  }, [isAdmin, isMounted])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!isMounted) return

    try {
      const supabase = createClientComponentClient()
      const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId)

      if (error) throw error
    } catch (error) {
      console.error("Error al actualizar estado:", error)
    }
  }

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order)
    setOpenDialog(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pendiente":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pendiente
          </Badge>
        )
      case "Cargada":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Cargada
          </Badge>
        )
      case "Operada":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Operada
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            {isAdmin && <TableHead>Productor</TableHead>}
            <TableHead>Descripción</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isAdmin ? 5 : 4} className="text-center py-8 text-muted-foreground">
                No hay órdenes disponibles
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{format(new Date(order.created_at), "dd/MM/yyyy HH:mm", { locale: es })}</TableCell>
                {isAdmin && <TableCell>{order.producer_name}</TableCell>}
                <TableCell className="max-w-xs truncate">{order.description}</TableCell>
                <TableCell>
                  {isAdmin ? (
                    <Select defaultValue={order.status} onValueChange={(value) => handleStatusChange(order.id, value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                        <SelectItem value="Cargada">Cargada</SelectItem>
                        <SelectItem value="Operada">Operada</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    getStatusBadge(order.status)
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => viewOrderDetails(order)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles de la Orden</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha de Creación</p>
                  <p>{format(new Date(selectedOrder.created_at), "dd/MM/yyyy HH:mm", { locale: es })}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estado</p>
                  <p>{getStatusBadge(selectedOrder.status)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Productor</p>
                  <p>{selectedOrder.producer_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID de Orden</p>
                  <p className="font-mono text-xs">{selectedOrder.id}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Descripción</p>
                <p>{selectedOrder.description}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Detalles</p>
                <pre className="mt-2 w-full rounded-md bg-slate-950 p-4 overflow-x-auto">
                  <code className="text-white text-xs">{JSON.stringify(selectedOrder.details, null, 2)}</code>
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

