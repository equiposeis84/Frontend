# RematesPaisa

RematesPaisa es un sistema integral de comercio electrónico y gestión de inventario, diseñado con una arquitectura cliente-servidor (Frontend en React + Vite, Backend en Node.js + Express + Prisma ORM).

## 🛠️ Requisitos Previos

Antes de instalar el proyecto, asegúrate de tener instalado:
- **Node.js** (v18 o superior)
- **MySQL** (v8 o superior)
- **Git**

---

## ⚙️ 1. Configuración de la Base de Datos

1. Abre tu gestor de base de datos MySQL (por ejemplo, phpMyAdmin, MySQL Workbench o DBeaver).
2. Crea una base de datos vacía. Por defecto el proyecto usa el nombre `remates_db`.
3. Importa la estructura de las tablas ejecutando el archivo:
   ```bash
   db/schema.sql
   ```
4. Importa los datos iniciales y usuarios por defecto ejecutando el archivo:
   ```bash
   db/seed.sql
   ```

*(Nota: Los usuarios en `seed.sql` ya vienen con sus contraseñas encriptadas mediante Bcrypt para garantizar la seguridad del login).*

---

## 🚀 2. Instalación y Ejecución del Backend

El backend gestiona la API, la conexión a la base de datos y la seguridad mediante JWT y Cookies.

1. Abre una terminal y navega a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Instala las dependencias. **Importante:** Utiliza la bandera `--legacy-peer-deps` para evitar conflictos de versiones con librerías como `multer-storage-cloudinary`:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Configura las variables de entorno. Duplica el archivo `.env.example` y renómbralo a `.env`. Asegúrate de actualizar los valores correspondientes a tu entorno (especialmente `DATABASE_URL`, `JWT_SECRET` y las credenciales de Cloudinary).
4. Sincroniza Prisma con la base de datos (Opcional si ya corriste los .sql, pero recomendado):
   ```bash
   npx prisma generate
   ```
5. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   *El backend correrá por defecto en `http://localhost:3000`.*

---

## 🎨 3. Instalación y Ejecución del Frontend

El frontend es una aplicación React construida con Vite.

1. Abre una **nueva** terminal y navega a la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias (aquí sí puedes usar `npm install` normal):
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo de Vite:
   ```bash
   npm run dev
   ```
   *El frontend correrá por defecto en `http://localhost:5173`.*

---

## 🔐 4. Credenciales de Acceso (Por Defecto)

Si corriste el archivo `db/seed.sql` correctamente, puedes iniciar sesión en la aplicación con los siguientes usuarios de prueba. La contraseña para **todos** es:
**`admin123`**

- **Administrador:** `admin@remate.com`
- **Cliente:** `cliente@ejemplo.com`
- **Repartidor 1:** `repartidor1@ejemplo.com`
- **Repartidor 2:** `repartidor2@ejemplo.com`

## 5. cambiar datos de cuenta de git

Cambiar nombre y correo globalmente (afecta todos los repos):
```bash
git config --global user.name "TuNombre"
git config --global user.email "tucorreo@email.com"
```