// newsService.js
const CACHE_KEY = 'news_cache';
const CACHE_TIME_MS = 15 * 60 * 1000; // 15 minutes

const API_KEY = import.meta.env.VITE_NEWS_API_KEY || '';

// Fallback mock data if API key is missing or fails
const mockNews = [
  {
    title: "NASA's Artemis Program Hits Major Milestone",
    source: { name: "Space.com" },
    author: "Jane Doe",
    publishedAt: new Date().toISOString(),
    urlToImage: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=1000&auto=format&fit=crop",
    description: "The Artemis II mission is progressing smoothly as NASA completes crucial tests on the Orion spacecraft.",
    url: "#"
  },
  {
    title: "SpaceX Starship Prepares for Next Orbital Flight",
    source: { name: "TechCrunch" },
    author: "John Smith",
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    urlToImage: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?q=80&w=1000&auto=format&fit=crop",
    description: "SpaceX is stacking the latest Starship prototype ahead of its highly anticipated orbital test flight.",
    url: "#"
  },
  {
    title: "James Webb Telescope Discovers Ancient Galaxy",
    source: { name: "Science Daily" },
    author: "Alice Johnson",
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    urlToImage: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1000&auto=format&fit=crop",
    description: "Astronomers using JWST have spotted what appears to be one of the oldest galaxies ever observed.",
    url: "#"
  },
  {
    title: "New Exoplanet Found in Habitable Zone",
    source: { name: "Nature" },
    author: "Bob Wilson",
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
    urlToImage: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1000&auto=format&fit=crop",
    description: "A rocky planet similar in size to Earth has been discovered orbiting a red dwarf star in the habitable zone.",
    url: "#"
  },
  {
    title: "Mars Rover Perseverance Collects Crucial Rock Sample",
    source: { name: "NASA" },
    author: "Mission Control",
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
    urlToImage: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?q=80&w=1000&auto=format&fit=crop",
    description: "The rover has successfully cored and stored another sample from the Jezero Crater delta.",
    url: "#"
  }
];

export async function fetchNews(category = 'technology', forceRefresh = false) {
  // Check cache first if not forcing refresh
  if (!forceRefresh) {
    const cached = localStorage.getItem(`${CACHE_KEY}_${category}`);
    if (cached) {
      try {
        const { timestamp, articles } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TIME_MS) {
          return articles;
        }
      } catch (e) {
        console.error('Failed to parse cached news', e);
      }
    }
  }

  // If no API key, return mock data to prevent app from breaking during development
  if (!API_KEY || API_KEY === 'your_newsapi_key_here') {
    console.warn("No News API key provided. Using mock data.");
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    const articles = mockNews;
    localStorage.setItem(`${CACHE_KEY}_${category}`, JSON.stringify({ timestamp: Date.now(), articles }));
    return articles;
  }

    // Switching to GNews.io as an alternative API
    const url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&max=10&apikey=${API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`News API returned status ${response.status}`);
    }
    
    const data = await response.json();
    if (data.articles && data.articles.length > 0) {
      // Map GNews format to expected format so we don't break existing components
      const articles = data.articles.map(article => ({
        ...article,
        urlToImage: article.image,
        author: article.source?.name || 'Unknown' 
      }));
      localStorage.setItem(`${CACHE_KEY}_${category}`, JSON.stringify({ timestamp: Date.now(), articles }));
      return articles;
    }
    
    return mockNews; // Fallback if no articles found
  } catch (error) {
    console.error("Error fetching news:", error);
    // If fetching fails (e.g., due to CORS or bad key), fallback to cache or mock
    const cached = localStorage.getItem(`${CACHE_KEY}_${category}`);
    if (cached) {
      return JSON.parse(cached).articles;
    }
    return mockNews;
  }
}
