import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const ProductDetail = ({ product }) => {
  if (!product) {
    return (
      <Box mt={5}>
        <Typography variant="h6">No product data available</Typography>
      </Box>
    );
  }

  return (
    <Box mt={5}>
      <Typography variant="h4">{product.name}</Typography>
      <Typography variant="h6">Category: {product.category}</Typography>
      {product.types && product.types.length > 0 ? (
        product.types.map((type, index) => (
          <Box key={index}>
            <Typography variant="subtitle1">{type.typeName}</Typography>
            {type.variants && type.variants.length > 0 ? (
              type.variants.map((variant, vIndex) => (
                <Box key={vIndex}>
                  <Typography variant="body1">Variant: {variant.variantName}</Typography>
                  <Typography variant="body1">Price: {variant.price}</Typography>
                  <Typography variant="body1">Stock: {variant.stock}</Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2">No variants available</Typography>
            )}
          </Box>
        ))
      ) : (
        <Typography variant="body2">No types available1</Typography>
      )}
    </Box>
  );
};

ProductDetail.propTypes = {
  product: PropTypes.shape({
    name: PropTypes.string,
    category: PropTypes.string,
    types: PropTypes.arrayOf(
      PropTypes.shape({
        typeName: PropTypes.string,
        variants: PropTypes.arrayOf(
          PropTypes.shape({
            variantName: PropTypes.string,
            price: PropTypes.number,
            stock: PropTypes.number,
          })
        ),
      })
    ),
  }),
};

export default ProductDetail;
