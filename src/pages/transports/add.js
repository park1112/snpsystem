import { useRouter } from 'next/router';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import TransportForm from '../../components/transports/TransportForm';
import Layout from '../../layouts';

const AddTransportPage = () => {
    const router = useRouter();

    const handleAddTransport = async (transportData) => {
        await addDoc(collection(db, 'transports'), transportData);
        router.push('/transports');
    };

    return <TransportForm onSubmit={handleAddTransport} />;
};

AddTransportPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default AddTransportPage;
