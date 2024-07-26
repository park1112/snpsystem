import { useRouter } from 'next/router';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import InventoryFormStep2 from '../../components/inventory/InventoryFormStep2';
import Layout from '../../layouts';

const AddInventoryPage = () => {
    const router = useRouter();
    const initialData = router.query;

    const handleAddInventory = async (inventoryData) => {
        await addDoc(collection(db, 'inventory'), inventoryData);
        router.push({
            pathname: '/inventory/addInventory',
            query: initialData
        }); // 데이터를 추가한 후에도 같은 페이지로 이동하여 초기 상태 유지
    };

    return <InventoryFormStep2 initialData={initialData} onSubmit={handleAddInventory} />;
};

AddInventoryPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default AddInventoryPage;
