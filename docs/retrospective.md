# Retrospectiva — TurnStay

## El proyecto

TurnStay es una aplicación fullstack para gestionar copropiedades vacacionales. Nació de un problema real: mi familia comparte una casa de playa con otras siete familias y toda la organización se hacía por WhatsApp, llamadas y hojas de Excel. El objetivo era digitalizar ese proceso — turnos, ocupaciones, gastos, incidencias y cesiones — en una sola herramienta accesible para todos los copropietarios.

---

## Qué ha salido bien

**La arquitectura multi-copropiedad.** Empecé con una arquitectura pensada para una sola copropiedad y a mitad del proyecto la migré para soportar múltiples copropiedades con datos completamente separados en Firestore. Fue un cambio grande pero necesario, y el resultado es una app que cualquier grupo puede usar, no solo mi familia.

**Firebase como decisión técnica.** Elegir Firebase en lugar de Node.js + Express fue la decisión correcta. La autenticación, la base de datos y el tiempo real en un solo servicio simplificaron enormemente el desarrollo. Sin servidor que mantener, sin endpoints que diseñar, sin tokens JWT que gestionar manualmente.

**Los hooks custom.** El patrón que seguí para todos los hooks — estado inicial, fetch, gestión de errores, retorno — es consistente en toda la app. Cualquiera que lea `useOcupaciones`, `useGastos` o `useIncidencias` entiende inmediatamente cómo funciona el resto.

**El sistema de turnos genérico.** El algoritmo de rotación original estaba hardcodeado para 8 familias y los períodos concretos de Casa Playa. Lo refactoricé para que cualquier copropiedad pueda definir sus propios períodos y el algoritmo los reparte automáticamente. Casa Playa sigue funcionando igual gracias al fallback.

**La protección de rutas por rol.** Implementar `ProtectedAdminRoute` fue sencillo pero importante — que un copropietario no pueda acceder a la configuración es básico para cualquier app multiusuario.

---

## Qué ha sido difícil

**La race condition del ConfigContext.** El bug más difícil del proyecto. El `ConfigContext` leía `copropiedadId` del perfil antes de que `CopropiedadContext` hubiera terminado de cargarlo, y mostraba el config por defecto en lugar del real. La solución fue simple — añadir `loadingPerfil` como dependencia del `useEffect` — pero encontrar exactamente dónde estaba el problema llevó tiempo.

**La migración a multi-copropiedad.** Cambiar la estructura de Firestore de colecciones en la raíz a subcolecciones dentro de cada copropiedad fue un proceso delicado. Hubo documentos huérfanos que quedaron en la raíz antigua y causaron confusión hasta que los identifiqué y eliminé.

**El onboarding.** Diseñar un flujo de entrada que funcionara bien tanto para usuarios nuevos como para usuarios con sesión ya iniciada requirió varias iteraciones. Al final la solución más limpia fue fusionar LoginPage y OnboardingPage en una sola página que detecta el estado del usuario y muestra la vista correcta.

**Los roles en Firestore.** Descubrí durante el testing que los roles de los usuarios de prueba estaban intercambiados en Firestore — el administrador tenía rol copropietario y viceversa. Es un recordatorio de que los datos en producción hay que verificarlos, no solo el código.

---

## Qué haría diferente

**Empezaría con la arquitectura multi-copropiedad desde el principio.** La migración a mitad del proyecto fue costosa en tiempo. Si hubiera diseñado las colecciones de Firestore con subcolecciones desde el día uno, me habría ahorrado mucho trabajo.

**Usaría TypeScript más estrictamente.** En algunos componentes usé `as any` para salir del paso rápido. Con más tiempo habría tipado todo correctamente desde el principio.

**Añadiría tests automáticos.** Con Vitest y Testing Library habría podido detectar la race condition del ConfigContext mucho antes. El testing manual es útil pero no escala.

**Planificaría mejor los estados de carga.** Los spinners de carga se fueron añadiendo reactivamente según aparecían los problemas. Con un diseño previo del flujo de carga de datos, la experiencia de usuario habría sido más consistente desde el principio.

---

## Lo que he aprendido

**React Context tiene limitaciones de rendimiento.** Cuando un context cambia, todos los componentes que lo consumen se re-renderizan. Para TurnStay con su volumen de datos no es un problema, pero en una app más grande consideraría Zustand o React Query.

**Firebase Firestore requiere planificación de la estructura de datos.** Las decisiones sobre cómo organizar las colecciones y subcolecciones son difíciles de cambiar después. La regla que aprendí: los datos que se consultan juntos deben vivir juntos.

**Los bugs de timing son los más difíciles de reproducir.** La race condition del ConfigContext no fallaba siempre — dependía de la velocidad de carga de Firestore. Aprendí a pensar en los estados intermedios de carga, no solo en el estado final.

**El producto importa tanto como el código.** Las decisiones de UX — fusionar login y onboarding, mostrar el calendario correcto según el sistema de turnos, ocultar configuración a copropietarios — tienen tanto impacto en la experiencia final como la calidad del código.

---

## Stack utilizado

- **Frontend:** React 18 + TypeScript + Vite
- **Estilos:** Tailwind CSS
- **Routing:** React Router v6
- **Backend:** Firebase (Firestore + Authentication)
- **Despliegue:** Vercel (CD automático desde GitHub)
- **Control de versiones:** Git + GitHub
- **Gestión de tareas:** Kanban con Trello

---

## Estado final del proyecto

| Funcionalidad | Estado |
|---|---|
| Autenticación con Firebase | ✅ Completo |
| Multi-copropiedad | ✅ Completo |
| Onboarding — crear y unirse | ✅ Completo |
| Dashboard con resumen | ✅ Completo |
| Calendario de turnos (rotación) | ✅ Completo |
| Calendario libre (grid mensual) | ✅ Completo |
| Registro de ocupaciones | ✅ Completo |
| Check de estado al llegar | ✅ Completo |
| Gestión de gastos comunes | ✅ Completo |
| Incidencias y resolución | ✅ Completo |
| Cesiones entre familias | ✅ Completo |
| Histórico anual | ✅ Completo |
| Configuración por copropiedad | ✅ Completo |
| Roles admin / copropietario | ✅ Completo |
| Reglas de seguridad Firestore | ✅ Completo |
| Sistema de rotación genérico | ✅ Completo |
| Sistema mixto de turnos | 🔜 Pendiente fase siguiente |
| Notificaciones | 🔜 Pendiente fase siguiente |
| App móvil nativa | 🔜 Pendiente fase siguiente |
