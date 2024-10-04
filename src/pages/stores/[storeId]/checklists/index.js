// pages/stores/[storeId]/checklists/index.js
import React from 'react';
import { useRouter } from 'next/router';
import ChecklistList from '../../../../components/stores/ChecklistList';
import Layout from '../../../../layouts';

const ChecklistsPage = () => {
  const router = useRouter();
  const { storeId } = router.query;

  if (!storeId) {
    return <p>Loading...</p>;
  }

  return <ChecklistList storeId={storeId} />;
};

ChecklistsPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default ChecklistsPage;
