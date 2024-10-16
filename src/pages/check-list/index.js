import CheckList from '../../components/check-list/CheckList';
import Layout from '../../layouts';

const CheckListPage = () => <CheckList />;

CheckListPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default CheckListPage;