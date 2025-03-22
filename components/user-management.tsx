"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Trash2, UserPlus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "@/components/ui/use-toast"

interface User {
  id: string
  email: string
  full_name: string
  created_at: string
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    full_name: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Solo crear el cliente de Supabase después de que el componente se monte en el cliente
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    // Solo ejecutar este código en el cliente
    if (!isMounted) return

    const supabase = createClientComponentClient()

    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, email, full_name, created_at")
          .eq("role", "producer")
          .order("created_at", { ascending: false })

        if (error) throw error

        setUsers(data || [])
      } catch (error) {
        console.error("Error al cargar usuarios:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [isMounted])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewUser((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isMounted) return

    setSubmitting(true)

    try {
      const supabase = createClientComponentClient()

      // 1. Crear usuario en Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true,
      })

      if (authError) throw authError

      if (authData.user) {
        // 2. Crear perfil en la tabla profiles
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            full_name: newUser.full_name,
            role: "producer",
          })
          .eq("id", authData.user.id)

        if (profileError) throw profileError

        // 3. Actualizar la lista de usuarios
        setUsers((prev) => [
          {
            id: authData.user!.id,
            email: newUser.email,
            full_name: newUser.full_name,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ])

        setOpenDialog(false)
        setNewUser({ email: "", password: "", full_name: "" })
        toast({
          title: "Usuario creado",
          description: `Se ha creado el productor ${newUser.full_name} exitosamente.`,
        })
      }
    } catch (error: any) {
      console.error("Error al crear usuario:", error)
      toast({
        title: "Error al crear usuario",
        description: error.message || "Ha ocurrido un error al crear el usuario.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!isMounted) return
    if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) return

    try {
      const supabase = createClientComponentClient()

      // 1. Eliminar usuario de Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)

      if (authError) throw authError

      // 2. Actualizar la lista de usuarios
      setUsers((prev) => prev.filter((user) => user.id !== userId))

      toast({
        title: "Usuario eliminado",
        description: "El productor ha sido eliminado exitosamente.",
      })
    } catch (error: any) {
      console.error("Error al eliminar usuario:", error)
      toast({
        title: "Error al eliminar usuario",
        description: error.message || "Ha ocurrido un error al eliminar el usuario.",
        variant: "destructive",
      })
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
      <div className="flex justify-end mb-4">
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Nuevo Productor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Productor</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="full_name">Nombre Completo</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={newUser.full_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={newUser.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={submitting || !isMounted}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Crear Productor"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Fecha de Creación</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                No hay productores registrados
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.full_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{format(new Date(user.created_at), "dd/MM/yyyy", { locale: es })}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

