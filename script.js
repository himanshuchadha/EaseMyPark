// Firebase Initialization
var firebaseConfig = {
  apiKey: window.env.FIREBASE_API_KEY,
  authDomain: window.env.FIREBASE_AUTH_DOMAIN,
  projectId: window.env.FIREBASE_PROJECT_ID,
  storageBucket: window.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: window.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: window.env.FIREBASE_APP_ID,
};
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
console.log("Firebase initialized successfully!");

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

  // Hide the error message after 3.5 seconds
  setTimeout(() => {
    clearErrorMessage();
  }, 3500); // 3500 milliseconds = 3.5 seconds
}

function clearErrorMessage() {
  const errorElement = document.getElementById("error-message");
  errorElement.innerText = "";
  errorElement.style.display = "none";
}

function displaySuccessMessage(message) {
  const successElement = document.getElementById("success-message");
  successElement.innerText = message;
  successElement.style.display = "block";

  // Hide the success message after 3.5 seconds
  setTimeout(() => {
    clearSuccessMessage();
  }, 3500); // 3500 milliseconds = 3.5 seconds
}

function clearSuccessMessage() {
  const successElement = document.getElementById("success-message");
  successElement.innerText = "";
  successElement.style.display = "none";
}

// Real-time listener for slots
db.collection("slots").onSnapshot(
  (querySnapshot) => {
    console.log("Real-time update received!");
    querySnapshot.forEach((doc) => {
      console.log(doc.id, " => ", doc.data());
      let slotId = doc.id;
      let slotData = doc.data();
      let slotElement = document.querySelector(`#${slotId}`);
      if (slotElement) {
        console.log(`Updating slot ${slotId} with status ${slotData.status}`);
        slotElement.querySelector("span").innerText = slotData.status;
        slotElement.setAttribute("data-text", slotData.status);
        slotElement.style.backgroundColor =
          slotData.status === "Reserved" ? "#FFADB0" : "#59e659";
        slotElement.style.border =
          slotData.status === "Reserved" ? "4px solid red" : "4px solid green";
        slotElement.setAttribute("data-user", slotData.userId || "");
      }
    });
    updateCounts();
  },
  (error) => {
    console.error("Real-time listener error: ", error);
    displayErrorMessage("Real-time listener error: " + error.message);
  }
);

// Add click event listeners to slots
let slots = document.querySelectorAll(".slot");
slots.forEach((slot) => {
  slot.addEventListener("click", (event) => {
    let span = slot.querySelector("span");
    let slotId = slot.getAttribute("id");

    if (span.innerText === "Available" || span.innerText === "") {
      reserveSlot(slotId);
    } else if (
      span.innerText === "Reserved" &&
      slot.getAttribute("data-user") === firebase.auth().currentUser.uid
    ) {
      makeSlotAvailable(slotId);
    } else {
      displayErrorMessage("This slot is already reserved by another user.");
    }
  });
});

// Function to reserve a slot
function reserveSlot(slotId) {
  const user = firebase.auth().currentUser;

  if (!user) {
    displayErrorMessage("Please log in to reserve a slot.");
    return;
  }

  const userRef = db.collection("users").doc(user.uid);

  showLoadingSpinner();
  userRef.get().then((doc) => {
    if (doc.exists && doc.data().reservedSlot) {
      displayErrorMessage(
        "You already have a reserved slot. Please make it available before reserving a new one."
      );
      hideLoadingSpinner();
    } else {
      // Reserve the slot
      db.collection("slots")
        .doc(slotId)
        .set({ status: "Reserved", userId: user.uid })
        .then(() => {
          userRef.set({ reservedSlot: slotId }, { merge: true });
          displaySuccessMessage("Slot reserved successfully.");
        })
        .finally(() => {
          hideLoadingSpinner();
        });
    }
  });
}

// Function to make a slot available
function makeSlotAvailable(slotId) {
  const user = firebase.auth().currentUser;

  if (!user) {
    displayErrorMessage("Please log in to change slot status.");
    return;
  }

  const userRef = db.collection("users").doc(user.uid);

  showLoadingSpinner();
  db.collection("slots")
    .doc(slotId)
    .set({ status: "Available", userId: null })
    .then(() => {
      userRef.set({ reservedSlot: null }, { merge: true });
      displaySuccessMessage("Slot is now available.");
    })
    .finally(() => {
      hideLoadingSpinner();
    });
}

// Add this function to your script.js
function logout() {
  firebase
    .auth()
    .signOut()
    .then(() => {
      console.log("User logged out");
      window.location.href = "https://himanshuchadha.github.io/EaseMyPark/"; // Redirect to login page after logout
    })
    .catch((error) => {
      console.error("Error logging out: ", error);
      displayErrorMessage("Error logging out: " + error.message);
    });
}

// Update counts of available and reserved slots
function updateCounts() {
  let reservedCount = 0;
  let availableCount = 0;

  slots.forEach((slot) => {
    let span = slot.querySelector("span");
    if (span.innerText === "Reserved") {
      reservedCount++;
    } else if (span.innerText === "Available") {
      availableCount++;
    }
  });

  document.getElementById(
    "Reserved-count"
  ).innerText = `Reserved Slots: ${reservedCount}`;
  document.getElementById(
    "available-count"
  ).innerText = `Available Slots: ${availableCount}`;
  document.getElementById("Total-count").innerText = `Total slots: ${
    reservedCount + availableCount
  }`;
}

// Initial count update
updateCounts();
