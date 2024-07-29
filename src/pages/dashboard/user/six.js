import { Container, Typography, } from '@mui/material';
import Layout from '../../../layouts';
import Page from '../../../components/Page';
import ProductRegistration from '../../../components/ProductRegistration';
import PaymentListPage from './PaymentListPage';


const six = () => {

  return (
    <Page title="Payment Confirmation">
      <Container maxWidth="lg">


        <Typography variant="h5" gutterBottom>단가 및  정보 입력</Typography>

        <PaymentListPage />

      </Container>
    </Page>
  );
};

six.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default six;
