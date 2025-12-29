import axios from "axios";

export const getVaccineNews = async (req, res) => {
  try {
    const NEWS_API_KEY = process.env.NEWS_API_KEY;
    
    if (!NEWS_API_KEY) {
      return res.status(500).json({ 
        message: "News API key is not configured" 
      });
    }

    // Fetch vaccine-related news from NewsAPI
    // Use more specific search terms and English language for better results
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        // More specific vaccine-related search query
        q: '(vaccine OR vaccination OR immunization) AND (COVID OR flu OR health OR disease OR outbreak OR pandemic)',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 15,
        apiKey: NEWS_API_KEY
      }
    });

    // Filter out removed articles and ensure vaccine relevance
    const vaccineKeywords = [
      'vaccine', 'vaccination', 'immunization', 'immunize', 'jab', 'shot',
      'booster', 'dose', 'pfizer', 'moderna', 'covid', 'flu', 'measles',
      'polio', 'hepatitis', 'hpv', 'tetanus', 'diphtheria', 'whooping',
      'mmr', 'cdc', 'who', 'health', 'pandemic', 'outbreak', 'infectious'
    ];

    const validArticles = response.data.articles.filter(article => {
      // Must have valid title
      if (!article.title || article.title === '[Removed]') return false;
      
      // Check if article is actually about vaccines
      const titleLower = (article.title || '').toLowerCase();
      const descLower = (article.description || '').toLowerCase();
      const combined = titleLower + ' ' + descLower;
      
      // Must contain at least one vaccine-related keyword
      return vaccineKeywords.some(keyword => combined.includes(keyword));
    });

    // Format articles
    const finalArticles = validArticles.slice(0, 10).map(article => ({
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
      source: article.source.name
    }));

    res.status(200).json({ 
      success: true,
      articles: finalArticles,
      totalResults: finalArticles.length
    });

  } catch (error) {
    console.error("Error fetching vaccine news:", error.response?.data || error.message);
    
    // Handle specific NewsAPI errors
    if (error.response?.status === 426) {
      return res.status(503).json({ 
        message: "News service requires upgrade. Please contact administrator." 
      });
    }
    
    if (error.response?.status === 401) {
      return res.status(500).json({ 
        message: "Invalid News API key configuration" 
      });
    }

    if (error.response?.status === 429) {
      return res.status(503).json({ 
        message: "Too many requests. Please try again later." 
      });
    }

    res.status(500).json({ 
      message: "Failed to fetch vaccine news",
      error: error.message 
    });
  }
};