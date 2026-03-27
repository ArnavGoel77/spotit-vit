const firebaseConfig = {
  apiKey: "AIzaSyCb9kR1lQH3DXDdcAKc8Lh_73M4pU41NJ0",
  authDomain: "spotit-vit.firebaseapp.com",
  projectId: "spotit-vit",
  storageBucket: "spotit-vit.firebasestorage.app",
  messagingSenderId: "957236405033",
  appId: "1:957236405033:web:da40db1670cfdb976d8d38"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();