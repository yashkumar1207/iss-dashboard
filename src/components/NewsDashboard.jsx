import React, { useState, useEffect, useMemo } from 'react';
import { fetchNews } from '../services/newsService';
import { RefreshCw, Search, ExternalLink, Calendar, User, Newspaper } from 'lucide-react';

export function NewsDashboard({ onNewsUpdate }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('science'); // default category suitable for ISS
  const [sortBy, setSortBy] = useState('date'); // 'date' | 'source'

  const categories = ['science', 'technology', 'general', 'health'];

  const loadNews = async (cat, force = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNews(cat, force);
      setArticles(data);
      if (onNewsUpdate) onNewsUpdate(data);
    } catch (err) {
      setError('Failed to load news');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews(category);
  }, [category]);

  const handleRefresh = () => {
    loadNews(category, true);
  };

  const filteredAndSortedArticles = useMemo(() => {
    let result = [...articles];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        a => 
          (a.title && a.title.toLowerCase().includes(query)) || 
          (a.description && a.description.toLowerCase().includes(query)) ||
          (a.source?.name && a.source.name.toLowerCase().includes(query))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      } else if (sortBy === 'source') {
        const sourceA = a.source?.name || '';
        const sourceB = b.source?.name || '';
        return sourceA.localeCompare(sourceB);
      }
      return 0;
    });

    return result.slice(0, 5); // Show only top 5 as requested
  }, [articles, searchQuery, sortBy]);

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                category === cat 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-1.5 rounded-full hover:bg-muted transition-colors flex-shrink-0 ml-auto sm:ml-0"
          title="Refresh Category"
        >
          <RefreshCw className={`h-4 w-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="date">Sort by Date</option>
          <option value="source">Sort by Source</option>
        </select>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
        {loading && articles.length === 0 ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex gap-4 p-3 border rounded-lg">
              <div className="w-20 h-20 bg-muted rounded-md flex-shrink-0"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </div>
            </div>
          ))
        ) : error ? (
          <div className="text-center p-4 text-destructive border border-destructive/20 rounded-lg bg-destructive/10">
            {error}
          </div>
        ) : filteredAndSortedArticles.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            No articles found.
          </div>
        ) : (
          filteredAndSortedArticles.map((article, idx) => (
            <article key={idx} className="group flex flex-col sm:flex-row gap-4 p-3 border rounded-lg hover:border-primary/50 transition-colors bg-card">
              {article.urlToImage && (
                <div className="sm:w-24 h-40 sm:h-24 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                  <img 
                    src={article.urlToImage} 
                    alt={article.title} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
              <div className="flex flex-col flex-1 min-w-0">
                <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2 flex-1">
                  {article.description}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground mt-auto">
                  <span className="flex items-center gap-1">
                    <Newspaper className="h-3 w-3" />
                    {article.source?.name || 'Unknown'}
                  </span>
                  {article.author && (
                    <span className="flex items-center gap-1 line-clamp-1 max-w-[100px]">
                      <User className="h-3 w-3" />
                      {article.author}
                    </span>
                  )}
                  <span className="flex items-center gap-1 ml-auto">
                    <Calendar className="h-3 w-3" />
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-2 sm:mt-0 sm:self-center flex items-center justify-center gap-1 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 px-3 py-2 rounded-md transition-colors whitespace-nowrap"
              >
                Read <ExternalLink className="h-3 w-3" />
              </a>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
