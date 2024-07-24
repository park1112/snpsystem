import { Box, Typography } from '@mui/material';

const ProductDetail = ({ product }) => {
    return (
        <Box mt={5}>
            {product ? (
                <>
                    <Typography variant="h4">{product.name}</Typography>
                    <Typography variant="h6">Category: {product.category}</Typography>
                    {product.types && product.types.map((type, index) => (
                        <Box key={index}>
                            <Typography variant="subtitle1">{type.typeName}</Typography>
                            {type.variants && type.variants.map((variant, vIndex) => (
                                <Box key={vIndex}>
                                    <Typography variant="body1">Variant: {variant.variantName}</Typography>
                                    <Typography variant="body1">Price: {variant.price}</Typography>
                                    <Typography variant="body1">Stock: {variant.stock}</Typography>
                                </Box>
                            ))}
                        </Box>
                    ))}
                </>
            ) : (
                <Typography variant="h6">No product data available</Typography>
            )}
        </Box>
    );
};

export default ProductDetail;
