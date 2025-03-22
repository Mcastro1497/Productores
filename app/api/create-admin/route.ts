import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Obtener datos del cuerpo de la solicitud
    const { email, password, fullName, secretKey } = await request.json()

    // Verificar la clave secreta
    const expectedSecretKey = process.env.ADMIN_SECRET_KEY
    if (!expectedSecretKey || secretKey !== expectedSecretKey) {
      return NextResponse.json({ error: "Clave secreta inválida" }, { status: 403 })
    }

    // Crear cliente de Supabase con credenciales de servicio
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Faltan variables de entorno de Supabase" }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // 1. Crear usuario en Auth
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (userError) {
      console.error("Error al crear usuario:", userError)
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    if (!userData.user) {
      return NextResponse.json({ error: "No se pudo crear el usuario" }, { status: 500 })
    }

    // 2. Actualizar el perfil como administrador
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        full_name: fullName,
        role: "admin",
      })
      .eq("id", userData.user.id)

    if (profileError) {
      console.error("Error al actualizar perfil:", profileError)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Administrador creado exitosamente",
      userId: userData.user.id,
    })
  } catch (error: any) {
    console.error("Error al crear administrador:", error)
    return NextResponse.json({ error: error.message || "Error al crear administrador" }, { status: 500 })
  }
}

