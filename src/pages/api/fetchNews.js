// pages/api/fetchNews.js

import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import axios from 'axios';
import { db } from '../../utils/firebase';

const SERPAPI_KEY = process.env.NEXT_PUBLIC_SERPAPI_KEY;

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const url = `https://serpapi.com/search?engine=google_news&q=onion&api_key=${SERPAPI_KEY}`;
            const response = await axios.get(url);
            const data = response.data;

            // console.log(data);

            // Firestore에 데이터를 저장합니다.
            const newsCollection = collection(db, 'news');
            const promises = data.news_results.map((newsItem) =>
                addDoc(newsCollection, {
                    title: newsItem.title || '제목 없음', // 제목이 없는 경우 기본값 제공
                    description: newsItem.snippet || '', // description이 없는 경우 빈 문자열 제공
                    link: newsItem.link || '#', // 링크가 없는 경우 기본값 제공
                    image: newsItem.thumbnail || '', // 이미지가 없는 경우 빈 문자열 제공
                    postedAt: new Date(newsItem.date),
                    createdAt: serverTimestamp(), // 문서가 Firestore에 저장된 시간
                })
            );

            await Promise.all(promises);

            res.status(200).json({ message: '뉴스 데이터를 성공적으로 가져와 저장했습니다.' });
        } catch (error) {
            console.error('뉴스 데이터를 가져오는데 실패했습니다:', error);
            res.status(500).json({ error: '뉴스 데이터를 가져오는데 실패했습니다.' });
        }
    } else {
        res.status(405).json({ error: '허용되지 않는 요청 방식입니다.' });
    }
}