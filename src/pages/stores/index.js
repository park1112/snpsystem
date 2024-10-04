// pages/stores/index.js

import Store from '../../components/stores/Store';

import Layout from '../../layouts';

const StoresPage = () => <Store />;

StoresPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default StoresPage;
