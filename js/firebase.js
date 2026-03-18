const firebaseConfig = {

  apiKey: "AIzaSyDLnAWA0kXg6LwbxICLdaFBEn_TmH4_6_o",
  authDomain: "kopirates-cafe.firebaseapp.com",
  databaseURL: "https://kopirates-cafe-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kopirates-cafe",
  storageBucket: "kopirates-cafe.appspot.com",
  messagingSenderId: "16386624365",
  appId: "1:16386624365:web:9f9327e4adf73d2a2ca864"

};

firebase.initializeApp(firebaseConfig);

const db = firebase.database();