-- Verificar políticas para la tabla profiles
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Verificar políticas para la tabla orders
SELECT * FROM pg_policies WHERE tablename = 'orders';

-- Asegurarse de que las políticas para administradores estén correctas
-- Esta política debe existir para que los administradores puedan ver todas las órdenes
SELECT * FROM pg_policies 
WHERE tablename = 'orders' 
AND policyname = 'Los administradores pueden ver todas las órdenes';

