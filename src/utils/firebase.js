// firebaseConfig.js
import { initializeApp, getApps, getApp, } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from "firebase/storage";
import { getDatabase } from 'firebase/database'; // Realtime Database import


const firebaseConfig = {
  apiKey: 'AIzaSyB7kYWLIGDzzzX2RY1oSf4nyqj5MwyY9pA',
  authDomain: 'agri-flow-398dd.firebaseapp.com',
  projectId: 'agri-flow-398dd',
  storageBucket: 'agri-flow-398dd.appspot.com',
  messagingSenderId: '389216775194',
  appId: '1:389216775194:web:c9eb6f0898a04772b275a3',
  measurementId: 'G-4GEF2C4SHH',
};


let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // 이미 초기화된 경우 기존 앱 가져오기
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app); // Realtime Database 초기화

//수정시작 

