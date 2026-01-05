import { useRouter } from 'next/router';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import LogisticsForm from '../../components/logistics/LogisticsForm';
import Layout from '../../layouts';

const AddLogisticsPage = () => {
    const router = useRouter();

    const handleAddLogistics = async (logisticsData) => {
        await addDoc(collection(db, 'logistics'), logisticsData);
        router.push('/logistics');
    };

    return <LogisticsForm onSubmit={handleAddLogistics} />;
};

AddLogisticsPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default AddLogisticsPage;
