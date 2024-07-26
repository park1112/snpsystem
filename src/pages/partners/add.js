import { useRouter } from 'next/router';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import PartnerForm from '../../components/partners/PartnerForm';
import Layout from '../../layouts';

const AddPartnerPage = () => {
    const router = useRouter();

    const handleAddPartner = async (partnerData) => {
        await addDoc(collection(db, 'partners'), partnerData);
        router.push('/partners');
    };

    return <PartnerForm onSubmit={handleAddPartner} />;
};

AddPartnerPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default AddPartnerPage;
