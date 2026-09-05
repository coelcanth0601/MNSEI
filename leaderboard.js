let ggLeaderboardRows = [];

function loadLeaderboard() {
  const db = getDb();
  const listEl = document.getElementById("leaderboard-list");

  db.collection("plant_scans").orderBy("count", "desc").limit(200).get().then(function (snapshot) {
    if (snapshot.empty) {
      listEl.innerHTML = "<p>No scans recorded yet.</p>";
      return;
    }
    listEl.innerHTML = "";
    ggLeaderboardRows = [];
    let rank = 1;
    snapshot.forEach(function (doc) {
      const data = doc.data();
      const label = data.label || data.slug || "(unknown plant)";
      const count = data.count || 0;
      const row = document.createElement("div");
      row.className = "lb-row";
      row.innerHTML =
        '<span class="lb-rank">' + rank + '</span>' +
        '<span class="lb-name">' + escapeHtmlGG(label) + '</span>' +
        '<span class="lb-count">' + count + ' scan' + (count === 1 ? "" : "s") + '</span>';
      listEl.appendChild(row);
      ggLeaderboardRows.push([rank, label, count]);
      rank++;
    });
  }).catch(function (err) {
    listEl.innerHTML = "<p>Couldn't load the stats right now.</p>";
    console.error(err);
  });
}

function exportLeaderboardCSV() {
  if (!ggLeaderboardRows.length) {
    alert("Nothing to export yet.");
    return;
  }
  const header = ["Rank", "Plant", "Scan Count"];
  const rows = [header].concat(ggLeaderboardRows);
  const csv = rows.map(function (row) {
    return row.map(function (cell) {
      const str = String(cell);
      return /[",\n]/.test(str) ? '"' + str.replace(/"/g, '""') + '"' : str;
    }).join(",");
  }).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "garden-plant-scan-stats.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
