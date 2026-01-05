import NewsDetail from '../../components/news/NewsDetail';
import Layout from '../../layouts';

const NewsPage = (props) => (
    <Layout>
      <NewsDetail {...props} />
    </Layout>
  );

export { getServerSideProps } from '../../components/news/NewsDetail';

export default NewsPage;
