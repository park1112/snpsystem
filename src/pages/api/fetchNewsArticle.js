// pages/api/fetchNewsArticle.js
import axios from 'axios';
import cheerio from 'cheerio';

const fetchNewsArticle = async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'No URL provided' });
  }

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const title = $('meta[property="og:title"]').attr('content') || $('title').text();
    const description = $('meta[property="og:description"]').attr('content') || '';
    const imageUrl = $('meta[property="og:image"]').attr('content') || '';
    const articleContent = $('article').text() || '';

    const article = {
      title,
      description,
      imageUrl,
      content: articleContent,
    };

    return res.status(200).json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    return res.status(500).json({ error: 'Failed to fetch article' });
  }
};

export default fetchNewsArticle;
