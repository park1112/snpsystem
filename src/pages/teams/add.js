import { useRouter } from 'next/router';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import TeamForm from '../../components/teams/TeamForm';
import Layout from '../../layouts';
import Page from '../../components/Page';

const AddTeamPage = () => {
    const router = useRouter();

    const handleAddTeam = async (teamData) => {
        await addDoc(collection(db, 'teams'), teamData);
        router.push('/teams');
    };

    return <TeamForm onSubmit={handleAddTeam} />;
};

AddTeamPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default AddTeamPage;
