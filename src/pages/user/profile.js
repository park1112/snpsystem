import Profile from '../../components/user/Profile';
import Layout from '../../layouts';


const UserProfilePage = () => {
    return <Profile />;
};

UserProfilePage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default UserProfilePage;
