# User Flow (Flujo de Usuario)

## 1. Ingreso y Registro
1. El usuario llega a la Landing Page (Lobby) en la raíz `/`.
2. Hace clic en "Comenzar ahora" o "Iniciar Sesión".
3. Aparece el `LoginModal` flotante sobre fondo desenfocado.
4. **Camino A (Registro):** Ingresa correo y contraseña (x2). Si es válido, la API crea la cuenta, luego automáticamente hace login devolviendo el JWT y redirige a `/gastos`.
5. **Camino B (Login):** Ingresa credenciales. El servidor valida y devuelve JWT. El cliente lo almacena en Zustand y redirige a `/gastos`.

## 2. Gestión de Gastos
1. Estando en `/gastos`, el usuario visualiza la lista de deudas/compras previamente creadas.
2. Clic en "Nuevo Gasto".
3. Abre un formulario. Si elige "Meses sin intereses", el formulario pide el plazo e intereses. Si elige "Contado", omite estos campos.
4. Al guardar, se actualiza la interfaz local optimísticamente a través de React Query.

## 3. Presupuestos y Alertas
1. El usuario navega a la sección de Presupuestos.
2. Establece un límite para la categoría "Comida" (Ej. $3000 MXN).
3. Cada vez que agrega un gasto categorizado como "Comida", el backend recalcula el gasto.
4. Si el gasto supera el 80% (o umbral configurado), la app muestra una advertencia visual al entrar al Dashboard.

## 4. Cierre de Sesión
1. El usuario hace clic en "Cerrar sesión" en el header.
2. Zustand elimina el token del `localStorage`.
3. El usuario es redirigido forzosamente a `/`.
