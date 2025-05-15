// leaderboard.js

const leaderboardKey = "2048_leaderboard";

function getLeaderboard() {
  const data = localStorage.getItem(leaderboardKey);
  return data ? JSON.parse(data) : [];
}

function saveScore(score) {
  let leaderboard = getLeaderboard();
  leaderboard.push({ score, date: new Date().toISOString() });
  // Sort descending and keep top 5
  leaderboard = leaderboard.sort((a, b) => b.score - a.score).slice(0, 5);
  localStorage.setItem(leaderboardKey, JSON.stringify(leaderboard));
}

function displayLeaderboard() {
  const leaderboard = getLeaderboard();
  const container = document.getElementById("leaderboard-container");
  if (!container) return;
  container.innerHTML = "<h2>Leaderboard (Top 5)</h2>";
  if (leaderboard.length === 0) {
    container.innerHTML += "<p>No scores yet.</p>";
    return;
  }
  const list = document.createElement("ol");
  leaderboard.forEach(entry => {
    const item = document.createElement("li");
    const date = new Date(entry.date).toLocaleDateString();
    item.textContent = `${entry.score} points (${date})`;
    list.appendChild(item);
  });
  container.appendChild(list);
}
window.addEventListener("DOMContentLoaded", () => {
  displayLeaderboard();
});
