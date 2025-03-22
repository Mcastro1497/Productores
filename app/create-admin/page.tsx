"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"

export default function CreateAdminPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    secretKey: "",
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    message?: string
    error?: string
  }>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult({})

    try {
      const response = await fetch("/api/create-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al crear administrador")
      }

      setResult({
        success: true,
        message: data.message || "Administrador creado exitosamente",
      })

      // Limpiar el formulario en caso de éxito
      setFormData({
        email: "",
        password: "",
        fullName: "",
        secretKey: "",
      })
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || "Error al crear administrador",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Crear Administrador</CardTitle>
          <CardDescription>Crea una cuenta de administrador para el sistema</CardDescription>
        </CardHeader>

        {result.success && (
          <div className="px-6 pb-2">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Éxito</AlertTitle>
              <AlertDescription className="text-green-700">{result.message}</AlertDescription>
            </Alert>
          </div>
        )}

        {result.error && (
          <div className="px-6 pb-2">
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Error</AlertTitle>
              <AlertDescription className="text-red-700">{result.error}</AlertDescription>
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre Completo</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Administrador Principal"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@ejemplo.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secretKey">Clave Secreta</Label>
              <Input
                id="secretKey"
                name="secretKey"
                type="password"
                placeholder="Clave secreta para crear administradores"
                value={formData.secretKey}
                onChange={handleInputChange}
                required
              />
              <p className="text-xs text-muted-foreground">
                Esta clave debe coincidir con la variable de entorno ADMIN_SECRET_KEY
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Administrador"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

