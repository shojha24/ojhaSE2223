  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  import {getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
  import {getDatabase, ref, set, update, child, get} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyANL48ofNoQ6jDsjDr4S-hDudgrz6EyscI",
    authDomain: "ojha-research-project.firebaseapp.com",
    projectId: "ojha-research-project",
    storageBucket: "ojha-research-project.appspot.com",
    messagingSenderId: "392012655566",
    appId: "1:392012655566:web:ead8cb80e5a147b26c199f",
    measurementId: "G-KMCT932ZGZ"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);

  // Initialize Auth
  const auth = getAuth();

  // Initialize Database
  const db = getDatabase(app);

// ALL OF THE REGISTER CODE GOES HERE

// ---------------- Register New Uswer --------------------------------//

document.getElementById('submitData').addEventListener("click", (e) => {
    e.preventDefault();
    // Get user input
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('userEmail').value;
  
    // Firebase will require a password of at least 6 characters
    const password = document.getElementById('userPass').value;
    console.log(firstName, lastName, email, password);
    if(!validation(firstName, lastName, email, password)) {
      return;
    }
  
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      // ...
  
      // Add user to database
      // 'Set' will overwrite any existing data at this location or create a new one
      // each new user will be placed in the 'users' collection
      set(ref(db, 'users/' + user.uid + '/accountInfo'), {
        uid: user.uid,
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: encryptPass(password)
      }).then(() => {
      alert("User created successfully");
      window.location.href = "index.html";
      }).catch((error) => {
        alert("Error creating user: " + error);
      });
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorMessage);
      // ..
    });
  
  });
  
  // --------------- Check for null, empty ("") or all spaces only ------------//
  function isEmptyorSpaces(str){
    return str === null || str.match(/^ *$/) !== null
  }
  
  // ---------------------- Validate Registration Data -----------------------//
  
  function validation(firstName, lastName, email, password) {
    let fNameRegex = /^[a-zA-Z]+$/;
    let lNameRegex = /^[a-zA-Z]+$/;
    let emailRegex = /^([a-zA-Z0-9]+)@ctemc\.org$/;
    let passRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
  
    if (isEmptyorSpaces(firstName) || isEmptyorSpaces(lastName) || isEmptyorSpaces(email) || isEmptyorSpaces(password)) {
      alert("Please complete all fields.");
      return false;
    } else if (!firstName.match(fNameRegex) || !lastName.match(lNameRegex) || !email.match(emailRegex) || !password.match(passRegex)) {
      alert("Check your data and try again. First name is only capital and lowercase letters. Last name is only capital and lowercase letters. Email must be a valid CTEMC email address. Password must be at least 6 characters and contain at least one uppercase letter, one lowercase letter, and one number.");
      return false;
    }
  
    return true;
  }
  
  // --------------- Password Encryption -------------------------------------//
  
  function encryptPass(password) {
    let encrypted = CryptoJS.AES.encrypt(password, password);
    return encrypted.toString();
  }
  
  function decryptPass(password) {
    let decrypted = CryptoJS.AES.decrypt(password, password);
    return decrypted.toString();
  }


// ----------------- Login Existing User -----------------------------------//

// ---------------------- Sign-In User ---------------------------------------//

document.getElementById('signIn').addEventListener("click", (e) => {
    e.preventDefault();
    // Get user input
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    console.log(email, password)
    // Use Firebase to sign in user
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
  
      // Log sign-in date
      let logDate = new Date();
      update(ref(db, 'users/' + user.uid + "/accountInfo"), {
        lastLogin: logDate, 
      })
      .then(() => {
        alert("Logged in successfully!");
        //window.location.href = "index.html";
  
        // Get snapshot of user data
        get(child(ref(db), 'users/' + user.uid))
        .then((snapshot) => {
          if (snapshot.exists()) {
            login(snapshot.val())
          } else {
            console.log("No data available");
          }
        })
        .catch((error) => {
          console.error(error);
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert("Update Error " + errorMessage + ". Please try again.")
      });
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert("Sign In Error: " + errorMessage + ". Please try again.")
    });
  });
  
  // ---------------- Keep User Logged In ----------------------------------//
  
  function login(user) {
    let keepLoggedIn = document.getElementById('keepLoggedInSwitch').ariaChecked;
  
    // Session storage temporary (only active while browser is open)
    // Saved as a string
    // Session storage cleared with a signout function
  
    if (!keepLoggedIn) {
      sessionStorage.setItem("user", JSON.stringify(user));
      window.location = "index.html";
    } 
    
    else {
      localStorage.setItem("keepLoggedInSwitch", "yes");
      localStorage.setItem("user", JSON.stringify(user));
      window.location = "index.html";
    }
  }