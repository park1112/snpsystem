import { useCallback } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const useSubmitInventory = (onSubmit) => {
  const submitInventory = useCallback(
    async (formData) => {
      console.log('Submitting inventory:', formData);
      const docRef = await addDoc(collection(db, 'inventory'), formData);
      console.log('Document added with ID:', docRef.id);
      onSubmit(formData);
      return docRef;
    },
    [onSubmit]
  );

  return { submitInventory };
};

export default useSubmitInventory;
