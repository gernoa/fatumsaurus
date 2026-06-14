'use client'

import { Upload, FolderOpen, FileText, ImageIcon } from 'lucide-react'

const MOCK_DOCS = [
  { id: '1', nombre: 'Informe analítica feb 2026.pdf', tipo: 'PDF', fecha: '2026-02-10', categoria: 'Analítica', tamaño: '284 KB' },
  { id: '2', nombre: 'Radiografía rodilla derecha.jpg', tipo: 'Imagen', fecha: '2026-05-15', categoria: 'Diagnóstico', tamaño: '1,2 MB' },
  { id: '3', nombre: 'Informe dermatología La Paz.pdf', tipo: 'PDF', fecha: '2026-05-14', categoria: 'Consulta', tamaño: '156 KB' },
]

function formatFecha(fecha: string): string {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export function DocumentosView() {
  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <div className="glass rounded-[16px] border-2 border-dashed border-border/60 p-10 flex flex-col items-center gap-3 text-center hover:border-petroleo/40 transition-colors cursor-pointer">
        <div className="w-12 h-12 rounded-full bg-petroleo/10 flex items-center justify-center">
          <Upload className="w-6 h-6 text-petroleo" />
        </div>
        <div>
          <p className="font-medium text-foreground">Subir documento</p>
          <p className="text-sm text-muted-foreground mt-0.5">PDF, JPG, PNG · Máximo 20 MB</p>
        </div>
        <span className="text-xs text-petroleo hover:text-teal-brand">o haz clic para seleccionar</span>
      </div>

      {/* Lista de documentos */}
      {MOCK_DOCS.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
            {MOCK_DOCS.length} documento{MOCK_DOCS.length !== 1 ? 's' : ''}
          </h3>
          {MOCK_DOCS.map((doc) => (
            <div key={doc.id} className="card-tech p-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-[8px] bg-secondary flex items-center justify-center flex-shrink-0">
                {doc.tipo === 'PDF'
                  ? <FileText className="w-4 h-4 text-red-500" />
                  : <ImageIcon className="w-4 h-4 text-blue-500" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{doc.nombre}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {doc.categoria} · {formatFecha(doc.fecha)} · {doc.tamaño}
                </p>
              </div>
              <button className="flex-shrink-0 text-xs text-petroleo hover:text-teal-brand transition-colors font-medium">
                Ver
              </button>
            </div>
          ))}
        </section>
      )}

      {MOCK_DOCS.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay documentos adjuntos todavía.</p>
        </div>
      )}
    </div>
  )
}
