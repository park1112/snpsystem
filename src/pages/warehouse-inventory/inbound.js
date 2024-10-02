import InboundInventory from '../../components/warehouse-inventory/InboundInventory';
import { useRouter } from 'next/router';
import { useState } from 'react';

import Layout from '../../layouts';

const InboundSelectionPage = () => {
    const router = useRouter();
    const [initialData, setInitialData] = useState(null);

    const handleSelect = (data) => {
        setInitialData(data);
        router.push({
            pathname: '/warehouse-inventory/add-inbound',
            query: data
        });
    };

    return <InboundInventory onSelect={handleSelect} />;
};

InboundSelectionPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default InboundSelectionPage;
