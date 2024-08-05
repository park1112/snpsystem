// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyB7kYWLIGDzzzX2RY1oSf4nyqj5MwyY9pA',
  authDomain: 'agri-flow-398dd.firebaseapp.com',
  projectId: 'agri-flow-398dd',
  storageBucket: 'agri-flow-398dd.appspot.com',
  messagingSenderId: '389216775194',
  appId: '1:389216775194:web:c9eb6f0898a04772b275a3',
  measurementId: 'G-4GEF2C4SHH',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db };
