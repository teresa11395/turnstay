export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Página no encontrada</h2>
        <p className="text-gray-500 mb-6">La página que buscas no existe.</p>
        <a href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Volver al inicio
        </a>
      </div>
    </div>
  )
}