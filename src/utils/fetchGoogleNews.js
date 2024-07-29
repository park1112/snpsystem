// src/utils/fetchGoogleNews.js
import axios from 'axios';
import cheerio from 'cheerio';
import { db } from '../utils/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

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

    const promises = $('article').map(async (index, element) => {
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
    }).get();

    const results = await Promise.all(promises);
    return results;
};

const updateNews = async (keyword) => {
    const newsCollection = collection(db, 'news');
    const newsQuery = query(newsCollection, where('keyword', '==', keyword), orderBy('updatedAt', 'desc'), limit(1));
    const newsSnapshot = await getDocs(newsQuery);

    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    let latestDoc;
    if (!newsSnapshot.empty) {
        latestDoc = newsSnapshot.docs[0];
        const lastUpdated = latestDoc.data().updatedAt.toDate();
        if (lastUpdated > twoHoursAgo) {
            return latestDoc.data().articles;
        }
    }

    const newsData = await fetchGoogleNews(keyword);
    const newNewsData = {
        keyword,
        articles: newsData,
        updatedAt: new Date()
    };

    if (latestDoc) {
        await setDoc(latestDoc.ref, newNewsData);
    } else {
        await addDoc(newsCollection, newNewsData);
    }

    return newNewsData.articles;
};

export { fetchGoogleNews, updateNews };
