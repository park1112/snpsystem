import Profile from '../../components/user/Profile';
import Layout from '../../layouts';


const UserProfilePage = () => <Profile />;

UserProfilePage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default UserProfilePage;
