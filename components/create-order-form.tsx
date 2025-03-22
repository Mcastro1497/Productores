"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface CreateOrderFormProps {
  onSuccess?: () => void
}

export function CreateOrderForm({ onSuccess }: CreateOrderFormProps) {
  const [formData, setFormData] = useState({
    description: "",
    details: {
      quantity: "",
      price: "",
      notes: "",
    },
  })
  const [submitting, setSubmitting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Solo crear el cliente de Supabase después de que el componente se monte en el cliente
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isMounted) return

    setSubmitting(true)

    try {
      const supabase = createClientComponentClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      console.log("Usuario al crear orden:", user)

      if (!user) throw new Error("Usuario no autenticado")

      const orderData = {
        producer_id: user.id,
        description: formData.description,
        status: "Pendiente",
        details: {
          quantity: formData.details.quantity,
          price: formData.details.price,
          notes: formData.details.notes,
          created_by: user.email,
        },
      }

      console.log("Datos de la orden a insertar:", orderData)

      const { data, error } = await supabase.from("orders").insert(orderData).select()

      console.log("Respuesta de inserción:", data, "Error:", error)

      if (error) throw error

      toast({
        title: "Orden creada",
        description: "Tu orden ha sido enviada exitosamente.",
      })

      setFormData({
        description: "",
        details: {
          quantity: "",
          price: "",
          notes: "",
        },
      })

      if (onSuccess) onSuccess()
    } catch (error: any) {
      console.error("Error al crear orden:", error)
      toast({
        title: "Error al crear orden",
        description: error.message || "Ha ocurrido un error al crear la orden.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Describe brevemente tu orden"
          value={formData.description}
          onChange={handleInputChange}
          required
          className="min-h-[100px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="details.quantity">Cantidad</Label>
          <Input
            id="details.quantity"
            name="details.quantity"
            type="number"
            placeholder="Ej: 100"
            value={formData.details.quantity}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="details.price">Precio</Label>
          <Input
            id="details.price"
            name="details.price"
            type="number"
            step="0.01"
            placeholder="Ej: 99.99"
            value={formData.details.price}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="details.notes">Notas adicionales</Label>
        <Textarea
          id="details.notes"
          name="details.notes"
          placeholder="Información adicional relevante"
          value={formData.details.notes}
          onChange={handleInputChange}
        />
      </div>

      <Button type="submit" className="w-full" disabled={submitting || !isMounted}>
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          "Enviar Orden"
        )}
      </Button>
    </form>
  )
}

