// ----------------- Page Loaded After User Sign-in -------------------------//

// ----------------- Firebase Setup & Initialization ------------------------//

  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  import {getAuth, signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
  import {getDatabase, ref, set, update, child, get, remove} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

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

// ---------------------// Get reference values -----------------------------

let userLink = document.getElementById("userLink");
let signOut = document.getElementById("signOut");
let welcome = document.getElementById("welcome");
let signedIn = document.getElementById("signedIn");
let empty = document.getElementById("empty");
let currentUser = null;

// ----------------------- Get User's Name'Name ------------------------------

function getUsername() {
  // Get the user's name from storage
  let keepLoggedIn = localStorage.getItem("keepLoggedInSwitch");
  // If the user's name is not in storage, get it from session storage
  if (keepLoggedIn == "yes") {
    currentUser = JSON.parse(localStorage.getItem('user'))
  } else {
    currentUser = JSON.parse(sessionStorage.getItem('user'))
  }

  if (currentUser != null) currentUser = currentUser.accountInfo;
}

// Sign-out function that will remove user info from local/session storage and
// sign-out from FRD

function signOutUser() {
  // Remove user info from local/session storage
  localStorage.removeItem("user");
  sessionStorage.removeItem("user");
  // Sign-out from FRD
  signOut(auth).then(() => {
    // Sign-out successful.
    window.location.href = "index.html";
  }).catch((error) => {
    // An error happened.
    console.log(error);
  });
}



// ------------------------Set (insert) data into FRD ------------------------

function setData(userID, trialNum, algorithm, accuracy) {
  set(ref(db, 'users/' + userID + '/dataCollection/' + trialNum + '/' + algorithm), {
    [algorithm]: accuracy
  })
  .then(() => {
    alert("Data set successfully");
  })
  .catch((error) => {
    console.error("Error writing to database: ", error);
  });
}

// -------------------------Update data in database --------------------------

function updateData(userID, trialNum, algorithm, accuracy) {
  update(ref(db, 'users/' + userID + '/dataCollection/' + trialNum + '/' + algorithm), {
    [algorithm]: accuracy
  })
  .then(() => {
    alert("Data set successfully");
  })
  .catch((error) => {
    console.error("Error writing to database: ", error);
  });
}

// ----------------------Get a datum from FRD (single data point)---------------


function getData(userID, trialNum) {
  let trialVal = document.getElementById("trialVal");
  let imgVal = document.getElementById("imgVal");
  let audioVal = document.getElementById("audioVal");

  const dbref = ref(db)
  get(child(dbref, 'users/' + userID + '/dataCollection/' + trialNum))
  .then((snapshot) => {
    trialVal.textContent = trialNum;
    if (snapshot.exists()) {
      imgVal.textContent = snapshot.val()["images"] != null ? JSON.parse(snapshot.val()["images"]["images"]) : "N/A";
      audioVal.textContent = snapshot.val()["audio"] != null ? JSON.parse(snapshot.val()["audio"]["audio"]) : "N/A";
    } else {
      imgVal.textContent = "N/A";
      audioVal.textContent = "N/A";
    }
  })
  .catch((error) => {
    console.error(error);
  }
  );
}


// ---------------------------Get a month's data set --------------------------
// Must be an async function because you need to get all the data from FRD
// before you can process it for a table or graph

async function getDataSet(userID) {
  
  let tbody = document.getElementById("tbody-2")
  let trialNums = []
  let imgAccs = []
  let audioAccs = []

  const dbref = ref(db)
  for (let i = 10; i > 0; i--) {
  get(child(dbref, 'users/' + userID + `/dataCollection/${i}`))
  .then((snapshot) => {
      if (snapshot.exists()) {
        tbody.insertAdjacentHTML('afterend', `
        <tr>
          <td>${i}</td>
          <td>${snapshot.val()["images"] != null ? JSON.parse(snapshot.val()["images"]["images"]) : "N/A"}</td>
          <td>${snapshot.val()["audio"] != null ? JSON.parse(snapshot.val()["audio"]["audio"]) : "N/A"}</td>
        </tr>
        `)
        imgAccs.push(snapshot.val()["images"] != null ? JSON.parse(snapshot.val()["images"]["images"]) : "0")
        audioAccs.push(snapshot.val()["audio"] != null ? JSON.parse(snapshot.val()["audio"]["audio"]) : "0")
      } else {
        tbody.insertAdjacentHTML('afterend', `
        <tr>
          <td>${i}</td>
          <td>N/A</td>
          <td>N/A</td>
        </tr>
        `)
        imgAccs.push("0")
        audioAccs.push("0")
      }
      trialNums.push(i)
  })
  .catch((error) => {
    console.error(error);
  }
  );
  }
  
}


// Add a item to the table of data



// -------------------------Delete a day's data from FRD ---------------------

function deleteData(userID, trialNum, algorithm){
  remove(ref(db, 'users/' + userID + '/dataCollection/' + trialNum + '/' + algorithm))
  .then(()=>{
    alert('Data removed succesfully')
  })
  .catch((error)=>{
    alert('unsuccessful, error: ' + error)
  })
}

// --------------------------- Home Page Loading -----------------------------

window.onload = function() {
  // Get the user's name from storage
  console.log(window.document.location.pathname);
  getUsername();
  if(currentUser == null) {

    signOut.innerText = "Sign In / Register"
    signOut.classList.replace("nav-link", "btn")
    signOut.classList.add("btn-danger")
    signOut.href = "signIn.html"
  } else {
    empty.insertAdjacentHTML('afterend', `
    <li class="nav-item hover-underline-animation">
      <a id="userLink" class="nav-link" href=""><strong>${currentUser.firstName}</strong></a>
    </li>`)

    signOut.classList.replace("btn", "nav-link")
    signOut.classList.remove("btn-danger")
    signOut.innerText = "Sign Out";

    document.getElementById('signOut').addEventListener('click', signOutUser);

    if (window.document.location.pathname === "/ojhaSE2223/index.html") {
      // make sure to change pathname to just /index.html when you test locally sharabh
      console.log(welcome.innerText)
      welcome.innerText = "Welcome, " + currentUser.firstName;
      signedIn.insertAdjacentHTML('afterend', `
      <div id="showcase2">
    <div class="pt-3"></div>
    <div class="container border">
        <br>
        <h2>Set (Overwrite) & Update (Replace, Add) Data</h2><br>

        <div class="container dataForm mb-5">
            <form>
                <select class="form-select mb-3" aria-label="Default select example" id="trialNum">
                    <option selected>Trial #</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                </select>
                <select class="form-select mb-3" aria-label="Default select example" id="algorithm">
                    <option selected>Dataset used</option>
                    <option value="images">Images</option>
                    <option value="audio">Audio</option>
                </select>
                <input type="number" class="form-control mb-3" placeholder="Trial Accuracy (%, do not include the sign)"
                    id="accuracy">
                <button type="button" id="set" name="set" class="btn btn-outline-primary mb-3 w-100">Set</button>
                <button type="button" id="update" name="update"
                    class="btn btn-outline-secondary mb-3 w-100">Update</button>
            </form>
        </div>
    </div><br>

    <!--Get a single datum -->
    <div class="container border">
        <br>
        <h2>Display a Datum</h2><br>

        <div class="container dataForm mb-5">
            <form>
                <select class="form-select mb-3" aria-label="Default select example" id="trialReturn">
                    <option selected>Trial #</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                </select>
                <button type="button" id="get" name="get" class="btn btn-outline-primary mb-3 w-100">get</button>
            </form>
        </div>

        <!-- Table for displaying selected data -->
        <table class="table">
            <thead>
                <tr>
                    <th scope="col">Trial #</th>
                    <th scope="col">Image Accuracy</th>
                    <th scope="col">Audio Accuracy</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <p id="trialVal"></p>
                    </td>
                    <td>
                        <p id="imgVal">
                    </td>
                    <td>
                        <p id="audioVal">
                    </td>
                </tr>
                <tr>
            </tbody>
        </table>
    </div><br>

    <!-- Get a Dataset and return as table-->
    <div class="container border">
        <br>
        <h2>Get a Data Set</h2><br>

        <div class="container dataForm mb-5">
            <form>
                <button type="button" id="getDataSet" name="getDataSet" class="btn btn-outline-primary mb-3 w-100">Get
                    Dataset</button>
            </form>
        </div>

        <!-- Table for displaying data set -->
        <div class="container">
            <table class="table">
                <thead>
                    <tr>
                        <th scope="col">Trial #</th>
                        <th scope="col">Image Accuracy</th>
                        <th scope="col">Audio Accuracy</th>
                    </tr>
                </thead>
                <tbody>
                    <tr id="tbody-2"><td></td><td></td><td></td></tr>
                </tbody>
            </table>
        </div>
    </div><br>

    <div class="container border">
    <br><h2>Delete Data</h2><br>
    
    <div class="container dataForm mb-5">
        <form>
            <select class="form-select mb-3" aria-label="Default select example" id="delTrial">
                <option selected>Trial #</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
            </select>
            <select class="form-select mb-3" aria-label="Default select example" id="delAlg">
                <option selected>Dataset Used</option>
                <option value="images">Images</option>
                <option value="audio">Audio</option>
            </select>
            <button type = "button" id="delete" name="delete" class="btn btn-outline-primary mb-3 w-100">Delete</button>
        </form>       
    </div>
</div><br>


</div>
      `);
      signedIn.remove();

      // Set (Insert) data function call
      document.getElementById('set').onclick = function() {
        const trial = document.getElementById('trialNum').value;
        const alg = document.getElementById('algorithm').value;
        const acc = document.getElementById('accuracy').value;
        setData(currentUser.uid, trial, alg, acc);
      }
      // Update data function call
      document.getElementById('update').onclick = function() {
        const trial = document.getElementById('trialNum').value;
        const alg = document.getElementById('algorithm').value;
        const acc = document.getElementById('accuracy').value;
        updateData(currentUser.uid, trial, alg, acc);
      }
      // Get a datum function call
      document.getElementById('get').onclick = function() {
        const trialNum = document.getElementById('trialReturn').value;
        getData(currentUser.uid, trialNum);
      }

      document.getElementById('getDataSet').onclick = function() {
        getDataSet(currentUser.uid);
      }

      document.getElementById('delete').onclick = function(){
        const trial = document.getElementById('delTrial').value;
        const algorithm = document.getElementById('delAlg').value;
        const userID = currentUser.uid;
    
        deleteData(userID, trial, algorithm)
      }
    

      

    }

  }
}


  // ------------------------- Set Welcome Message -------------------------

  
  // Get, Set, Update, Delete Sharkriver Temp. Data in FRD
  // Set (Insert) data function call
  

  // Update data function call
  

  // Get a datum function call
  

  // Get a data set function call
  

  // Delete a single day's data function call
  

