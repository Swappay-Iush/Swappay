# Guía completa: Chat en tiempo real y Aceptación de Intercambios

Esta guía explica de forma práctica todo lo que se ha construido y ajustado recientemente en el módulo de chat entre usuarios: arquitectura, componentes, endpoints, eventos de Socket.IO, estado global, flujo de creación de salas, persistencia de mensajes, avatares con iniciales y el sistema bilateral de aceptación de intercambios.

Actualizado: 2025-10-31

## 1) Arquitectura general

- Frontend: React + Vite
- Comunicación en tiempo real: Socket.IO Client v4.x
- HTTP API: Axios a un backend Node/Express
- Estado local y persistencia de lista de chats: Zustand (con localStorage)
- Backend: Node + Express + Socket.IO Server + Sequelize + MySQL

Diagrama lógico (simplificado):
- Usuarios navegan a la pantalla de intercambios y/o mensajes
- Al solicitar un intercambio se crea/recupera una sala (chatRoom)
- Cada cliente se une a la sala con `joinRoom`
- Mensajes se envían por Socket.IO y se guardan en DB (persistencia)
- Lista de chats y mensajes se muestran en el frontend; al recargar siguen disponibles
- Aceptación de intercambio es bilateral; cuando ambos aceptan, cambia a estado "en proceso"

## 2) Estructura del frontend (archivos clave)

- `src/modules/Messages/LiveChat/LiveChat.jsx`
  - Pantalla principal del chat 1 a 1 (con Socket.IO, historial, input de mensaje)
  - Incluye el botón de "Aceptar intercambio" y su estado
- `src/modules/Messages/LiveChat/LiveChat.css`
  - Estilos del chat y clases para los botones de intercambio (`trade_btn`, `trade_btn--primary`, `trade_btn--success`)
- `src/modules/Messages/Messages.jsx`
  - Orquestador que muestra el listado de chats y/o el chat activo
- `src/modules/Messages/UsersChat/UsersChat.jsx`
  - Listado de conversaciones; avatar con iniciales si no hay imagen
- `src/modules/Exchanges/Exchanges.jsx`
  - Flujo para crear/abrir una sala al "Solicitar intercambio"
- `src/App/stores/Store.js`
  - Zustand store para manejar sesión/usuario y chats, con persistencia en localStorage
- `src/service/axiosConfig.js`
  - Cliente Axios (baseURL del backend)

## 3) Endpoints del backend (REST)

- POST `/chat/create-room`
  - Crea o recupera una sala entre user1, user2 y un `productId`
- GET `/chat/user/:userId`
  - Retorna todas las salas del usuario con información del otro usuario
- GET `/chat/messages/:chatRoomId`
  - Historial de mensajes (persistentes)
- POST `/chat/trade/accept`
  - Body: `{ chatRoomId, userId }`
  - Alterna la aceptación para ese usuario en esa sala; si ambos aceptaron, pone `tradeCompleted = 'en_proceso'`
- GET `/chat/trade/status/:chatRoomId`
  - Retorna el estado del acuerdo de intercambio
- POST `/chat/trade/reset`
  - Reinicia el estado del intercambio (opcional para pruebas)

## 4) Eventos de Socket.IO

- Cliente emite `joinRoom` con `{ chatRoomId }`
  - El servidor suscribe a esa sala de Socket.IO
- Cliente emite `sendMessage` con `{ chatRoomId, senderId, content }`
  - El servidor guarda en DB y emite `newMessage` a la sala
- Servidor emite `newMessage` a la sala
  - Ambos clientes agregan el mensaje a la UI
- Servidor emite `tradeStatusUpdated` a la sala (recomendado)
  - Ambos clientes actualizan el estado del acuerdo (aceptaciones y `tradeCompleted`)

Nota: Si el backend aún no emite `tradeStatusUpdated`, añadimos un fallback en el frontend que hace polling cada 5s hasta que `tradeCompleted` sea `'en_proceso'`.

## 5) Flujo de creación de sala y mensajes

- Desde `Exchanges.jsx` al presionar "Solicitar intercambio":
  1) POST `/chat/create-room`
  2) Se guarda/actualiza la conversación en el store (Zustand + localStorage)
  3) La UI navega al chat y se conecta a la sala con `joinRoom`
- En `LiveChat.jsx`:
  - Al montar o cambiar de sala: `GET /chat/messages/:salaID` para historial
  - Enviar: `socket.emit('sendMessage', { chatRoomId, senderId, content })`
  - Escuchar: `socket.on('newMessage', ...)` para mensajes entrantes

## 6) Avatares con iniciales de respaldo

- Si no hay `userImage`, se calculan iniciales con `getInitials(name)` (por ejemplo, "Sindy Ospina" → "SO") y se muestran en el componente `Avatar` de MUI.

## 7) Correcciones clave y robustez

- Identificación del "otro usuario" en una sala: conversión de IDs a `Number()` y salvaguardas para no mostrar tu propio nombre
- Eliminación de conversaciones duplicadas en el listado
- Documentación en español línea por línea en los componentes principales

## 8) Sistema bilateral de aceptación de intercambio

### Modelo y DB (backend)

- Tabla `trade_agreements` con campos:
  - `chatRoomId` (UNIQUE FK)
  - `user1Accepted` BOOLEAN default false
  - `user2Accepted` BOOLEAN default false
  - `tradeCompleted` ENUM('pendiente', 'en_proceso') default 'pendiente'
  - `completedAt` DATE (nullable)
- Hook `beforeSave`: cuando ambos aceptan, poner `tradeCompleted = 'en_proceso'` y (opcional) setear `completedAt`.

Importante: Asegurarse que `tradeCompleted` sea `ENUM` en MySQL. Si fuera `INTEGER`, causará errores (ej: "Incorrect integer value: 'pendiente'").

### Frontend: estado y UI (LiveChat.jsx)

- Estado local:
  - `tradeStatus`: contiene `currentUserAccepted`, `otherUserAccepted` y `tradeCompleted`
  - `loadingTrade`: loading del botón
- Al cambiar de sala: `GET /chat/trade/status/:salaID` → `setTradeStatus(...)`
- Al pulsar botón "Aceptar intercambio":
  - POST `/chat/trade/accept` con `{ chatRoomId: infoUser.salaID, userId: currentUserId }`
  - Si ambos aceptan, el backend responde con `tradeCompleted = 'en_proceso'`
  - Se muestra toast de éxito y se actualiza la UI
- Tiempo real (si el backend emite):
  - `socket.on('tradeStatusUpdated', ...)` → `setTradeStatus(...)`
- Fallback de sondeo:
  - Mientras el estado sea `'pendiente'`, se consulta cada 5s. Se detiene al pasar a `'en_proceso'`.

### UI del botón

- Clases en `LiveChat.css`:
  - `trade_btn trade_btn--primary` → botón azul (Aceptar intercambio)
  - `trade_btn trade_btn--success` → botón verde (Has Aceptado / Intercambio en proceso)
- Comportamientos:
  - Si yo acepté pero el otro no: botón verde "✓ Has Aceptado" y un texto "✓ {username} aceptó" solo si el otro ya aceptó
  - Si ambos aceptaron: ambos ven botón verde deshabilitado "✓ Intercambio en proceso"

## 9) Contratos (mini-spec)

- Entrada `sendMessage`: `{ chatRoomId: number, senderId: number, content: string }`
- Salida `newMessage`: `{ chatRoomId: number, senderId: number, content: string, createdAt?: string }`
- Entrada `POST /chat/trade/accept`: `{ chatRoomId: number, userId: number }`
- Salida `trade status` (ejemplo):
```json
{
  "chatRoomId": 123,
  "currentUserAccepted": true,
  "otherUserAccepted": true,
  "tradeCompleted": "en_proceso",
  "message": "Ambos usuarios han aceptado."
}
```

## 10) Errores frecuentes y solución

- 500: `Incorrect integer value: 'pendiente' for column 'tradeCompleted'`
  - Causa: columna `tradeCompleted` definida como `INTEGER` en vez de `ENUM`
  - Solución: cambiar a `ENUM('pendiente','en_proceso')` (modelo y/o migración). SQL rápido:
```sql
ALTER TABLE trade_agreements 
MODIFY COLUMN tradeCompleted ENUM('pendiente', 'en_proceso') NOT NULL DEFAULT 'pendiente';
```
- `currentUserId` indefinido en frontend
  - Revisa `useUserStore()` y que el usuario esté autenticado; añadimos validación y toasts de error preventivos
- El otro usuario no ve el cambio de estado de inmediato
  - Asegurar emisión `tradeStatusUpdated` desde el backend; en su defecto, el polling de 5s cubre el desfase

## 11) Cómo probar rápidamente

- Abrir dos navegadores (o una ventana normal y otra incógnito) con usuarios distintos
- Iniciar un chat entre ambos (crear la sala con "Solicitar intercambio")
- Enviar un mensaje desde un lado y verificar que llega al otro
- Pulsar "Aceptar intercambio" desde un lado; verificar el estado en el otro:
  - Inmediato si el backend emite `tradeStatusUpdated`
  - O en máximo 5s por el fallback
- Cuando ambos aceptan: ambos ven el botón verde deshabilitado "✓ Intercambio en proceso"

## 12) Próximos pasos (ideas)

- Emitir confirmaciones de lectura (read receipts)
- Mostrar time-stamps formateados y agrupación por fecha
- Botón para "Reiniciar intercambio" (útil en pruebas)
- Notificaciones push (browser) cuando llegan mensajes nuevos
- Integración con una vista de detalle de intercambio

---

Si necesitas que transformemos esta guía en una página dentro de la app (con capturas o diagramas), la podemos convertir a una ruta de documentación o Storybook. También puedo generar ejemplos de respuestas reales del backend para tus pruebas automatizadas.
