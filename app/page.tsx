import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-[5rem]">
          Sistema de <span className="text-blue-600">Productores</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Plataforma para la gestión de órdenes entre productores y administrador. Accede a tu cuenta para comenzar.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/login">Iniciar Sesión</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8">
            <Link href="/about">Acerca de</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

