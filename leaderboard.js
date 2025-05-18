import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  child,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Your Firebase config here:
const firebaseConfig = {
  apiKey: "AIzaSyBIGbIRhgKYQjQB1WjpLjxXEDUHHYWrePM",
  authDomain: "https://project-mb2048-default-rtdb.firebaseio.com",
  projectId: "project-mb2048",
  storageBucket: "project-mb2048.appspot.com",
  messagingSenderId: "606442481491",
  appId: "1:606442481491:web:9ed706ef063e812229e3a6",
  measurementId: "G-2TD99RHYE7"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const lbDiv = document.getElementById("leaderboard-container");

// Save score securely with signature and optional nickname
export async function saveScore(score, nickname, signature, message) {
  const wallet = window.currentAcc;
  if (!wallet) return;

  const walletKey = wallet.toLowerCase();

  // Verify signature off-chain before saving (you can improve by sending to a backend for more security)
  if (!signature || !message) {
    console.warn("Missing signature or message for saveScore");
    return;
  }

  try {
    // Use ethers.js to verify signature
    const ethers = window.ethers;
    const signerAddr = ethers.utils.verifyMessage(message, signature);
    if (signerAddr.toLowerCase() !== walletKey) {
      console.warn("Signature verification failed.");
      return;
    }
  } catch (err) {
    console.warn("Signature verification error:", err);
    return;
  }

  // Fetch previous data
  const dbRef = ref(db, "leaderboard/" + walletKey);
  const snapshot = await get(dbRef);
  const prevEntry = snapshot.exists() ? snapshot.val() : { score: 0, nickname: "" };

  const newScore = prevEntry.score + score;
  const newNickname = nickname?.trim() || prevEntry.nickname || walletKey.slice(0,6);

  await set(dbRef, {
    wallet: walletKey,
    score: newScore,
    nickname: newNickname,
    updatedAt: serverTimestamp(),
  });

  renderBoard();
}

// Render leaderboard from Firebase
export function renderBoard() {
  if (!lbDiv) return;

  const dbRef = ref(db, "leaderboard");
  onValue(dbRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      lbDiv.innerHTML = "<p>No leaderboard data yet.</p>";
      return;
    }

    const top = Object.entries(data)
      .sort(([, a], [, b]) => b.score - a.score)
      .slice(0, 10);

    lbDiv.innerHTML = "<h3>🏆 Leaderboard</h3>";
    const ol = document.createElement("ol");
    top.forEach(([wallet, entry]) => {
      const li = document.createElement("li");
      li.textContent = `${entry.nickname || wallet.slice(0, 6)} — ${entry.score}`;
      ol.appendChild(li);
    });
    lbDiv.appendChild(ol);
  });
}

// Toggle leaderboard visibility on button click
document.getElementById("toggle-leaderboard").addEventListener("click", () => {
  if (!lbDiv) return;
  lbDiv.style.display = lbDiv.style.display === "none" ? "block" : "none";
});

// Initial render
renderBoard();
