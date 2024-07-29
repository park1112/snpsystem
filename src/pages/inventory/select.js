import { useRouter } from 'next/router';
import { useState } from 'react';
import InventoryFormStep1 from '../../components/inventory/InventoryFormStep1';
import Layout from '../../layouts';

const InventorySelectionPage = () => {
    const router = useRouter();
    const [initialData, setInitialData] = useState(null);

    const handleSelect = (data) => {
        setInitialData(data);
        router.push({
            pathname: '/inventory/addInventory',
            query: data
        });
    };

    return <InventoryFormStep1 onSelect={handleSelect} />;
};

InventorySelectionPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default InventorySelectionPage;
