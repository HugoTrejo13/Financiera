import { useEffect, useState } from 'react';
import { ExternalLink, ChevronLeft, ChevronRight, Newspaper } from 'lucide-react';
import api from '../lib/api';

interface Article {
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: string;
  category: string;
}

interface NewsResponse {
  articles: Article[];
  total: number;
  demo: boolean;
}

// Colores de categoría
const categoryColors: Record<string, string> = {
  'TIPO DE CAMBIO': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  'POLÍTICA MONETARIA': 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  'INFLACIÓN': 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  'REMESAS': 'bg-green-500/15 text-green-400 border-green-500/20',
  'MERCADOS': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  'FISCALIDAD': 'bg-red-500/15 text-red-400 border-red-500/20',
  'NOTICIAS': 'bg-primary/15 text-primary border-primary/20',
};

// Gradientes de fondo para cards sin imagen
const cardGradients = [
  'from-blue-900/60 to-slate-900/80',
  'from-purple-900/60 to-slate-900/80',
  'from-emerald-900/60 to-slate-900/80',
  'from-orange-900/60 to-slate-900/80',
  'from-cyan-900/60 to-slate-900/80',
  'from-rose-900/60 to-slate-900/80',
];

const PAGE_SIZE = 6;

export default function NewsSection() {
  const [data, setData] = useState<NewsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchNews = async (p: number, q: string) => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get('/api/news/', { params: { page: p, page_size: PAGE_SIZE, q: q || undefined } });
      setData(res.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNews(page, query); }, [page, query]);

  const categories = ['Todas', 'Bolsa', 'Economía', 'Inversiones', 'Empresas', 'Tecnología'];

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

  return (
    <section className="w-full max-w-6xl mx-auto px-4 pb-20">
      {/* Título de sección */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 bg-border/50" />
        <div className="flex items-center gap-2 text-muted-foreground">
          <Newspaper className="w-4 h-4" />
          <span className="text-sm font-semibold uppercase tracking-widest">
            Noticias Financieras · México
          </span>
        </div>
        <div className="h-px flex-1 bg-border/50" />
      </div>

      {/* Chips de Categorías */}
      <div className="flex items-center justify-center sm:justify-start gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
        {categories.map(cat => {
          const isActive = (cat === 'Todas' && query === '') || query === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                setQuery(cat === 'Todas' ? '' : cat);
                setPage(1);
              }}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Demo badge */}
      {data?.demo && (
        <div className="flex justify-center mb-6">
          <span className="text-xs text-muted-foreground/60 bg-muted/30 border border-border/40 rounded-full px-3 py-1">
            📌 Artículos de muestra — agrega tu API key de NewsAPI.org para noticias en tiempo real
          </span>
        </div>
      )}

      {/* Estado de carga */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border/40 bg-card/50 overflow-hidden animate-pulse">
              <div className="h-36 bg-muted/40" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-muted/60 rounded w-20" />
                <div className="h-4 bg-muted/60 rounded w-full" />
                <div className="h-4 bg-muted/60 rounded w-3/4" />
                <div className="h-3 bg-muted/40 rounded w-1/2 mt-3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-center text-muted-foreground py-12">
          <Newspaper className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No se pudieron cargar las noticias.</p>
        </div>
      )}

      {/* Grid de artículos */}
      {!loading && !error && data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.articles.map((article, i) => {
              const catClass = categoryColors[article.category] ?? categoryColors['NOTICIAS'];
              const gradient = cardGradients[i % cardGradients.length];

              return (
                <a
                  key={i}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 flex flex-col"
                >
                  {/* Imagen o degradado */}
                  <div className="relative h-36 overflow-hidden shrink-0">
                    {article.urlToImage ? (
                      <img
                        src={article.urlToImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`${article.urlToImage ? 'hidden' : ''} absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                      <Newspaper className="w-10 h-10 text-white/20" />
                    </div>
                    {/* Overlay hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    {/* ExternalLink icon */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-black/50 backdrop-blur-sm rounded-full p-1.5">
                        <ExternalLink className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    {/* Categoría */}
                    <span className={`self-start text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${catClass}`}>
                      {article.category}
                    </span>

                    {/* Título */}
                    <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">
                      {article.title}
                    </h3>

                    {/* Descripción */}
                    {article.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {article.description}
                      </p>
                    )}

                    {/* Footer: fuente + fecha */}
                    <div className="mt-auto pt-2 flex items-center justify-between text-[10px] text-muted-foreground/60 border-t border-border/30">
                      <span className="font-medium truncate max-w-[60%]">{article.source}</span>
                      <span>{article.publishedAt}</span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border/50 bg-card/60 text-sm font-medium hover:bg-muted/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>
              <span className="text-sm text-muted-foreground">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border/50 bg-card/60 text-sm font-medium hover:bg-muted/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                Siguiente <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
