# 03 — Фундамент frontend Tasks

Overall status: ✅ done

---

## Subtasks

### TASK-03.1 — Создание Vite React TypeScript приложения

Status: [x] done  
File:

```txt
subtasks/001-✅-create-vite-react-typescript-app.md
```

Goal:

Инициализировать Vite + React 18 + TypeScript в `frontend/` с npm scripts и strict TS config.

---

### TASK-03.2 — Подключение Tailwind CSS

Status: [x] done  
File:

```txt
subtasks/002-✅-add-tailwind-css.md
```

Goal:

Настроить Tailwind CSS 3+ с postcss, базовыми цветами бренда и `@tailwind` directives в global CSS.

---

### TASK-03.3 — Подключение React Router

Status: [x] done  
File:

```txt
subtasks/003-✅-add-react-router.md
```

Goal:

Настроить React Router v6 с `BrowserRouter`, route config и placeholder pages для `/`, `/login`, `/dashboard`.

---

### TASK-03.4 — Настройка Redux Toolkit store

Status: [x] done  
File:

```txt
subtasks/004-✅-add-redux-toolkit-store.md
```

Goal:

Создать Redux store с `configureStore`, typed hooks `useAppDispatch`/`useAppSelector` и Provider в root.

---

### TASK-03.5 — Базовая настройка RTK Query

Status: [x] done  
File:

```txt
subtasks/005-✅-add-rtk-query-base-setup.md
```

Goal:

Создать `baseApi` slice с `createApi`, reducer middleware и inject endpoints pattern для features.

---

### TASK-03.6 — GraphQL baseQuery для RTK Query

Status: [x] done  
File:

```txt
subtasks/006-✅-add-graphql-basequery-for-rtk-query.md
```

Goal:

Реализовать `graphqlBaseQuery` — POST JSON `{ query, variables }` на `VITE_GRAPHQL_URL` с обработкой GraphQL errors.

---

### TASK-03.7 — FSD-like структура папок

Status: [x] done  
File:

```txt
subtasks/007-✅-add-fsd-like-folder-structure.md
```

Goal:

Организовать `src/` по слоям FSD-like с path aliases в tsconfig и vite.

---

### TASK-03.8 — Базовые layouts

Status: [x] done  
File:

```txt
subtasks/008-✅-add-base-layouts.md
```

Goal:

Создать `AuthLayout`, `DashboardLayout`, `PublicLayout` с outlet и общей навигацией-заглушкой.

---

### TASK-03.9 — Конфигурация frontend env

Status: [x] done  
File:

```txt
subtasks/009-✅-add-frontend-env-config.md
```

Goal:

Добавить typed env module и `.env.example` с `VITE_GRAPHQL_URL`, `VITE_API_URL`, `VITE_APP_NAME`.

---

### TASK-03.10 — Базовые UI primitives

Status: [x] done  
File:

```txt
subtasks/010-✅-add-basic-ui-primitives.md
```

Goal:

Создать переиспользуемые компоненты Button, Input, Card, Spinner, Alert в `shared/ui` с Tailwind и variant props.

---

## Completion rule

Блок `03-✅-frontend-foundation` считается completed только когда все subtasks `03.1`–`03.10` имеют status `[x] done`; папка переименована в `03-✅-frontend-foundation`.
