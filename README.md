<<<<<<< HEAD
# app-taller-multidiagnosticos

Aplicación web **interna** para la gestión de servicios del taller **Multidiagnósticos AS**.  
Incluye autenticación básica a nivel de middleware y utilidades para Supabase.

---

## 🚀 Arranque local

```bash
# Instalar dependencias
npm install

# Iniciar en desarrollo
npm run dev
# Abre http://localhost:3000
```

---

## 🔐 Autenticación básica

El acceso está protegido por **Basic Auth** en `middleware.ts`.

Crea un archivo **`.env.local`** en la raíz con las credenciales:

```
BASIC_USER=admin
BASIC_PASS=Multias
```

> Puedes cambiarlas cuando quieras. El middleware excluye `robots.txt` y `sitemap.xml` para que los bots puedan leerlos si lo necesitas.

---

## 🗄️ Supabase (opcional)

Si vas a usar Supabase, añade también en `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key
```

El cliente se inicializa en `src/lib/supabase.ts`.

---

## 📂 Estructura breve

- `src/app/page.tsx` – página principal.
- `middleware.ts` – protección con Basic Auth.
- `src/lib/supabase.ts` – helper para el cliente de Supabase.
- `public/` – activos estáticos.

---

## 🛫 Despliegue (Netlify)

- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Node:** v18+ (o la LTS vigente)

Netlify detecta proyectos Next.js automáticamente. Si lo prefieres, puedes añadir el plugin oficial de Next.js para Netlify.

---

## 📜 Licencia

Uso interno para Multidiagnósticos AS.
=======
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.




Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
>>>>>>> 301d3ab (Initial commit from Create Next App)
