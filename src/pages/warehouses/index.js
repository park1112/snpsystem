import WarehouseList from '../../components/warehouses/WarehouseList';
import Layout from '../../layouts';


const WarehouseListPage = () => {
    return <WarehouseList />;
};

WarehouseListPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default WarehouseListPage;
