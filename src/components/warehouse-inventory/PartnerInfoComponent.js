// PartnerInfoComponent.js
import React from 'react';
import { Paper, Typography, Button } from '@mui/material';
import SearchAndAddComponent from '../common/SearchAndAddComponent';
import PartnerForm from '../partners/PartnerForm';

const PartnerInfoComponent = ({ formState, handlePartnerSelect, handleFormChange }) => {
    return (
        <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>거래처 정보</Typography>
            {!formState.partnerUid ? (
                <>
                    <SearchAndAddComponent
                        collectionName="partners"
                        searchField="name"
                        FormComponent={PartnerForm}
                        onSelect={handlePartnerSelect}
                    />
                    <Typography mt={2} color="textSecondary">
                        거래처를 선택해 주세요.
                    </Typography>
                </>
            ) : (
                <Paper elevation={2} sx={{ p: 2, mt: 2, backgroundColor: '#f0f0f0' }}>
                    <Typography variant="h6" gutterBottom color="primary">
                        선택된 거래처
                    </Typography>
                    <Typography variant="subtitle1">
                        <strong>이름:</strong> {formState.partnerName}
                    </Typography>
                    <Typography variant="subtitle1">
                        <strong>카테고리:</strong> {formState.partnerCategory}
                    </Typography>
                    <Button
                        variant="contained"
                        color="secondary"
                        sx={{ mt: 2 }}
                        onClick={() => handleFormChange('partnerUid', '')}
                    >
                        거래처 변경
                    </Button>
                </Paper>
            )}
        </Paper>
    );
};

export default PartnerInfoComponent;