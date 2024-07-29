import { db } from '../../utils/firebase';
import { collection, getDocs, addDoc, query, where, orderBy, limit, setDoc } from 'firebase/firestore';
import fetchGoogleNews from '../../utils/fetchGoogleNews';

const updateNews = async (req, res) => {
  const keyword = '양파';
  const newsCollection = collection(db, 'news');
  const newsQuery = query(newsCollection, where('keyword', '==', keyword), orderBy('updatedAt', 'desc'), limit(1));
  const newsSnapshot = await getDocs(newsQuery);

  // 2시간 동안의 타임스탬프 설정
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

  let latestDoc;
  if (!newsSnapshot.empty) {
    latestDoc = newsSnapshot.docs[0];
    const lastUpdated = latestDoc.data().updatedAt.toDate();
    if (lastUpdated > twoHoursAgo) {
      // 2시간 이내에 업데이트된 경우 기존 데이터를 반환
      return res.status(200).json(latestDoc.data().articles);
    }
  }

  // 새로운 뉴스 데이터를 가져와 Firestore에 저장
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

  return res.status(200).json(newNewsData.articles);
};

export default updateNews;
