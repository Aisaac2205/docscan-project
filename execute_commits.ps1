# Script para automatizar los commits atómicos en Windows

# 1. Extracción de Lógica
git add frontend/src/features/documents frontend/src/features/dashboard frontend/src/features/scanner
$status1 = git diff --cached --quiet 2>&1
if (-Not $?) {
    git commit -m "refactor(documents,dashboard): extraer lógica e interfaces a hooks" -m "Deshace el anti-patrón de 'fat components' en las páginas de features."
}

# 2. Extractores de Views
git add frontend/src/views
$status2 = git diff --cached --quiet 2>&1
if (-Not $?) {
    git commit -m "refactor(views): extraer componentes orquestadores a la capa views" -m "Mueve DashboardPage, DocumentsPage y ScannerPage desde features/ hacia la capa views/ global."
}

# 3. Next.js Routing
git add frontend/src/app frontend/src/middleware.ts
$status3 = git diff --cached --quiet 2>&1
if (-Not $?) {
    git commit -m "refactor(app): conectar enrutamiento con la capa views" -m "Actualiza los archivos app/*/page.tsx para referenciar orquestadores."
}

# 4. Auth y Componentes Compartidos (Incluye borrados con --all)
git add --all frontend/src/shared frontend/src/features/auth frontend/src/hooks frontend/src/types
$status4 = git diff --cached --quiet 2>&1
if (-Not $?) {
    git commit -m "refactor(auth): mover componente ClientAuthWrapper a feature de auth" -m "Reubica wrapper de sesión a features/auth/components/AuthWrapper.tsx."
}

# 5. Documentación
git add ARCHITECTURE.md README.md backend/README.md backend/docs
$status5 = git diff --cached --quiet 2>&1
if (-Not $?) {
    git commit -m "docs(arquitectura): actualizar documentación a Feature-Sliced Design" -m "Refleja la adición de views/ y limpieza de features/."
}

# 6. Cambios Pendientes del Backend
git add backend
$status6 = git diff --cached --quiet 2>&1
if (-Not $?) {
    git commit -m "feat(backend): reestructurar lógica de módulos y servicios" -m "Asegura la integración de ocr.service, guardias JWT y configuraciones Prisma."
}

# 7. Resto del entorno (.env, configurations, package.json globales)
git add .
$status7 = git diff --cached --quiet 2>&1
if (-Not $?) {
    git commit -m "chore(config): actualización general de entorno y dependencias" -m "Sincroniza archivos ignorados, env.examples, tailwind.config y tsconfig."
}

Write-Host "✅ Todos los commits ejecutados exitosamente."
