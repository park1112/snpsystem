import { useRouter } from 'next/router';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import InboundInventoryInput from '../../components/warehouse-inventory/InboundInventoryInput';
import Layout from '../../layouts';

const AddInboundPage = () => {
    const router = useRouter();
    const initialData = router.query;
    console.log('Query parameters:', router.query);


    return <InboundInventoryInput initialData={initialData} />;
};

AddInboundPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default AddInboundPage;
