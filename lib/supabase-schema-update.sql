-- Actualizar la política para permitir que los usuarios actualicen su propio perfil
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.profiles;

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Permitir que los usuarios recién registrados actualicen su perfil
CREATE POLICY "Los usuarios pueden actualizar su perfil al registrarse"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

