import { useRouter } from 'next/router';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import InventoryForm from '../../components/inventory/InventoryForm';
import Layout from '../../layouts';

const AddInventoryPage = () => {
    const router = useRouter();

    const handleAddInventory = async (inventoryData) => {
        await addDoc(collection(db, 'inventory'), inventoryData);
        router.push('/inventory');
    };

    return <InventoryForm onSubmit={handleAddInventory} />;
};

AddInventoryPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default AddInventoryPage;
