import { Card, CardContent, Typography } from '@mui/material';
import { useRouter } from 'next/router';

const NewsList = ({ articles }) => {
  const router = useRouter();

  const handleClick = (index) => {
    router.push(`/news/${index}`);
  };

  return (
    <div>
      {articles.map((article, index) => (
        <Card key={index} onClick={() => handleClick(index)} style={{ cursor: 'pointer', marginBottom: '16px' }}>
          <CardContent>
            <Typography variant="h6">{article.title}</Typography>
            <Typography variant="body2">
              {article.description.length > 70 ? `${article.description.substring(0, 50)}...` : article.description}
            </Typography>
            <Typography variant="caption">{new Date(article.publishedAt).toLocaleDateString()}</Typography>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NewsList;
