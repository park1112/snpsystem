import TeamList from '../../components/teams/TeamList';
import Layout from '../../layouts';

const TeamListPage = () => {
    return <TeamList />;
};

TeamListPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default TeamListPage;
