// Firebase import & config
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  child
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Replace these with your Firebase project's config
const firebaseConfig = {
  apiKey: "AIzaSyBIGbIRhgKYQjQB1WjpLjxXEDUHHYWrePM",
  authDomain: "project-mb2048.firebaseapp.com",
  projectId: "project-mb2048",
  storageBucket: "project-mb2048.firebasestorage.app",
  messagingSenderId: "606442481491",
  appId: "1:606442481491:web:9ed706ef063e812229e3a6",
  measurementId: "G-2TD99RHYE7"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Save score to Firebase leaderboard
export async function saveScore(score) {
  const wallet = window.currentAcc;
  if (!wallet) return;

  const walletKey = wallet.toLowerCase();

  const dbRef = ref(db, "leaderboard/" + walletKey);
  const snapshot = await get(dbRef);
  const prevScore = snapshot.exists() ? snapshot.val().score : 0;
  const newScore = prevScore + score;

  await set(dbRef, {
    wallet: walletKey,
    score: newScore
  });

  renderBoard();
}

// Render leaderboard from Firebase
export function renderBoard() {
  const lbDiv = document.getElementById("leaderboard");
  if (!lbDiv) return;

  const dbRef = ref(db, "leaderboard");
  onValue(dbRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    const top = Object.entries(data)
      .sort(([, a], [, b]) => b.score - a.score)
      .slice(0, 10);

    lbDiv.innerHTML = "<h3>🏆 Leaderboard</h3>";
    const ol = document.createElement("ol");
    top.forEach(([wallet, entry]) => {
      const li = document.createElement("li");
      li.textContent = `${wallet.slice(0, 6)}…${wallet.slice(-4)} — ${entry.score}`;
      ol.appendChild(li);
    });
    lbDiv.appendChild(ol);
  });
}

// Auto-render on load
renderBoard();
