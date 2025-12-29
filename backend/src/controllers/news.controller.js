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
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'vaccine OR vắc xin OR tiêm chủng',
        language: 'vi',
        sortBy: 'publishedAt',
        pageSize: 10,
        apiKey: NEWS_API_KEY
      }
    });

    // Filter out removed articles
    const validArticles = response.data.articles.filter(article => 
      article.title && article.title !== '[Removed]'
    );

    // Format articles
    const finalArticles = validArticles.map(article => ({
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