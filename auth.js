// Firebase Initialization
var firebaseConfig = {
  apiKey: "AIzaSyAKqdODWQz3sl7H27FDQN85tOd_qNnRYdk",
  authDomain: "smart-parking-13e29.firebaseapp.com",
  projectId: "smart-parking-13e29",
  storageBucket: "smart-parking-13e29.firebasestorage.app",
  messagingSenderId: "832422095286",
  appId: "1:832422095286:web:141acda9b641cf7b487917",
};
firebase.initializeApp(firebaseConfig);
var auth = firebase.auth();

function showLoadingSpinner() {
  const spinner = document.getElementById("loading-spinner");
  spinner.classList.remove("hidden");
  spinner.setAttribute("aria-hidden", "false");
}

function hideLoadingSpinner() {
  const spinner = document.getElementById("loading-spinner");
  spinner.classList.add("hidden");
  spinner.setAttribute("aria-hidden", "true");
}

function displayErrorMessage(message) {
  const errorElement = document.getElementById("error-message");
  errorElement.innerText = message;
  errorElement.style.display = "block";
}

function clearErrorMessage() {
  const errorElement = document.getElementById("error-message");
  errorElement.innerText = "";
  errorElement.style.display = "none";
}

function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

function isValidPassword(password) {
  return password.length >= 8;
}

function validateForm(email, password) {
  if (!isValidEmail(email)) {
    displayErrorMessage("Invalid email address.");
    return false;
  }
  if (!isValidPassword(password)) {
    displayErrorMessage("Password must be at least 8 characters long.");
    return false;
  }
  return true;
}

// Sign Up Function
function signUp() {
  clearErrorMessage();
  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;

  if (!validateForm(email, password)) return;

  showLoadingSpinner();
  auth
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log("User signed up: ", userCredential.user);
      window.location.href = "booking.html"; // Redirect after signup
    })
    .catch((error) => {
      console.error("Error: ", error.message);
      displayErrorMessage(error.message);
    })
    .finally(() => {
      hideLoadingSpinner();
    });
}

// Login Function
function login() {
  clearErrorMessage();
  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;

  if (!validateForm(email, password)) return;

  showLoadingSpinner();
  auth
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log("User logged in: ", userCredential.user);
      window.location.href = "booking.html"; // Redirect after login
    })
    .catch((error) => {
      console.error("Error: ", error.message);
      displayErrorMessage(error.message);
    })
    .finally(() => {
      hideLoadingSpinner();
    });
}

// Google Sign-In Function
function googleSignIn() {
  clearErrorMessage();
  showLoadingSpinner();
  var provider = new firebase.auth.GoogleAuthProvider();

  auth
    .signInWithPopup(provider)
    .then((result) => {
      console.log("User signed in with Google: ", result.user);
      window.location.href = "booking.html"; // Redirect after Google login
    })
    .catch((error) => {
      if (error.code === "auth/popup-blocked") {
        firebase.auth().signInWithRedirect(provider);
      } else {
        console.error("Error: ", error.message);
        displayErrorMessage(error.message);
      }
    })
    .finally(() => {
      hideLoadingSpinner();
    });
}

// Password Reset Function
function handlePasswordReset(email) {
  clearErrorMessage();
  showLoadingSpinner();
  firebase
    .auth()
    .sendPasswordResetEmail(email)
    .then(() => {
      displayErrorMessage("Password reset email sent.");
    })
    .catch((error) => {
      console.error("Error: ", error.message);
      displayErrorMessage(error.message);
    })
    .finally(() => {
      hideLoadingSpinner();
    });
}

// Secure Firebase Configuration Best Practices
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log("User is signed in");
  } else {
    console.log("No user is signed in");
  }
});

// Initialize Firebase App Check
const appCheck = firebase.appCheck();
appCheck.activate("6LfK-dkqAAAAAJyqs_57hudKr2Hr_4qB44L5NgWj", true);
