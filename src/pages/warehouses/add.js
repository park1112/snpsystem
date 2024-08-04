import { useRouter } from 'next/router';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import WarehouseForm from '../../components/warehouses/WarehouseForm';
import Layout from '../../layouts';
import Page from '../../components/Page';

const AddWarehousePage = () => {
    const router = useRouter();

    const handleAddWarehouse = async (warehouseData) => {
        await addDoc(collection(db, 'warehouses'), warehouseData);
        router.push('/warehouses');
    };

    return <WarehouseForm onSubmit={handleAddWarehouse} />;
};

AddWarehousePage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default AddWarehousePage;
