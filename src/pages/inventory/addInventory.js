import { useRouter } from 'next/router';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import InventoryFormStep2 from '../../components/inventory/InventoryFormStep2';
import Layout from '../../layouts';

const AddInventoryPage = () => {
  const router = useRouter();
  const initialData = router.query;
  console.log('Query parameters:', router.query);


  return <InventoryFormStep2 initialData={initialData} />;
};

AddInventoryPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default AddInventoryPage;
