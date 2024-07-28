// src/pages/api/news.js

import axios from 'axios';
import cheerio from 'cheerio';

const fetchGoogleNews = async (keyword) => {
  const url = `https://news.google.com/search?q=${encodeURIComponent(keyword)}&hl=ko&gl=KR&ceid=KR:ko`;
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const articles = [];

  const fetchImageUrl = async (url) => {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary').toString('base64');
      return `data:image/jpeg;base64,${buffer}`;
    } catch (error) {
      console.error('Error fetching image:', error);
      return url;
    }
  };

  const promises = $('article')
    .map(async (index, element) => {
      const title = $(element).find('a.JtKRv').text() || 'No Title';
      const link = 'https://news.google.com' + $(element).find('a.JtKRv').attr('href').substring(1);
      const date = $(element).find('time').attr('datetime') || 'No Date';
      const sourceName = $(element).find('.vr1PYe').text() || 'No Source';
      const sourceLogo = $(element).find('.qEdqNd').attr('src') || '';

      const srcset = $(element).find('img.Quavad').attr('srcset');
      let imageUrl = $(element).find('img.Quavad').attr('src');
      if (srcset) {
        const sources = srcset.split(',');
        const highestRes = sources[sources.length - 1].trim().split(' ')[0];
        imageUrl = highestRes.startsWith('http') ? highestRes : 'https://news.google.com' + highestRes;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 지연 추가

      const finalImageUrl = await fetchImageUrl(imageUrl);

      return { title, link, date, sourceName, sourceLogo, imageUrl: finalImageUrl };
    })
    .get();

  const results = await Promise.all(promises);
  return results;
};

export default fetchGoogleNews;
