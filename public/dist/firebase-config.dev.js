"use strict";

var _firebaseApp = require("https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js");

var _firebaseAnalytics = require("https://www.gstatic.com/firebasejs/12.15.0/firebase-analytics.js");

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
  apiKey: "AIzaSyDTqPEj3EXTlAvHW6H2-O1u78dSIEHHggo",
  authDomain: "receipts-eccf0.firebaseapp.com",
  projectId: "receipts-eccf0",
  storageBucket: "receipts-eccf0.firebasestorage.app",
  messagingSenderId: "1012779995675",
  appId: "1:1012779995675:web:6dc991f5123f322d7b9ebe",
  measurementId: "G-E5LZ9XYVJH"
}; // Initialize Firebase

var app = (0, _firebaseApp.initializeApp)(firebaseConfig);
var analytics = (0, _firebaseAnalytics.getAnalytics)(app);