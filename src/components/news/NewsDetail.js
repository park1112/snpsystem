import { Card, CardContent, Typography, Link } from '@mui/material';
import { useRouter } from 'next/router';

const NewsDetail = ({ article }) => (
    <Card>
      <CardContent>
        <Typography variant="h4">{article.title}</Typography>
        <Link href={article.url} target="_blank" rel="noopener noreferrer">
          {article.url}
        </Link>
        {article.urlToImage && (
          <img src={article.urlToImage} alt={article.title} style={{ width: '100%', marginTop: '16px' }} />
        )}
        <Typography variant="body1" style={{ marginTop: '16px' }}>
          {article.description}
        </Typography>

        <Typography variant="caption">{new Date(article.publishedAt).toLocaleDateString()}</Typography>
      </CardContent>
    </Card>
  );

export async function getServerSideProps(context) {
  const { id } = context.params;
  const apiKey = '9c899f3de43047b3871b22aef10a393a'; // NewsAPI에서 발급받은 API 키
  const query = '양파'; // 검색 키워드
  const url = `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&apiKey=${apiKey}`;

  const res = await fetch(url);
  const data = await res.json();
  const article = data.articles[id];

  return {
    props: {
      article,
    },
  };
}

export default NewsDetail;
