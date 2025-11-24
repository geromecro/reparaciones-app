import Link from 'next/link'

export default function Home() {
  const menuItems = [
    {
      href: '/reparaciones/nueva',
      title: 'Nueva Reparación',
      description: 'Registrar equipos para reparación',
    },
    {
      href: '/dashboard',
      title: 'Listado',
      description: 'Ver todas las reparaciones',
    },
    {
      href: '/cotizaciones',
      title: 'Cotizaciones',
      description: 'Ajustar presupuestos y cotizaciones',
    },
    {
      href: '/entregas',
      title: 'Entregas',
      description: 'Entregar equipos a clientes',
    },
  ]

  return (
    <main className="min-h-screen bg-primary-50">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-3xl font-bold text-primary-900 mb-2">
            Sistema de Reparaciones
          </h1>
          <p className="text-lg text-primary-600">
            Seguimiento de reparaciones de alternadores y arranques
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative overflow-hidden bg-white border border-primary-200 rounded-lg p-8 hover:shadow-md transition-all duration-200"
            >
              {/* Subtle accent line on hover */}
              <div className="absolute top-0 left-0 h-1 w-0 bg-primary-700 group-hover:w-full transition-all duration-300" />

              <div className="relative z-10">
                <h2 className="text-lg font-semibold text-primary-900 mb-2 group-hover:text-primary-700 transition-colors">
                  {item.title}
                </h2>
                <p className="text-sm text-primary-600 group-hover:text-primary-700 transition-colors">
                  {item.description}
                </p>
              </div>

              {/* Arrow icon on hover */}
              <div className="absolute right-0 bottom-0 p-4 text-primary-200 group-hover:text-primary-300 transition-colors">
                <svg className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
