const GG_FOUND_KEY = "gardenGameFoundPlants";

function getDb() {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  return firebase.firestore();
}

function getFoundPlants() {
  try {
    const raw = localStorage.getItem(GG_FOUND_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveFoundPlants(list) {
  localStorage.setItem(GG_FOUND_KEY, JSON.stringify(list));
}

function recordScan(plantSlug, plantLabel, totalPlants) {
try {
const found = getFoundPlants();
if (found.indexOf(plantSlug) === -1) {
found.push(plantSlug);
saveFoundPlants(found);
}
showProgress(found.length, totalPlants);

const db = getDb();
db.collection("plant_scans").doc(plantSlug).set({
slug: plantSlug,
label: plantLabel,
count: firebase.firestore.FieldValue.increment(1),
lastScanned: firebase.firestore.FieldValue.serverTimestamp()
}, { merge: true }).catch(function (err) {
console.error(err);
});
} catch (err) {
console.error(err);
}
}

function showProgress(found, total) {
  const banner = document.createElement("div");
  banner.className = "gg-banner";
  if (found >= total) {
    banner.innerHTML =
      '<div class="gg-banner-inner gg-complete">' +
      '\ud83c\udfc6 You\u2019ve found all ' + total + ' plants on this device!<br>' +
      '<span class="gg-reward">EDIT ME in generate_site.py: put your reward instructions here</span>' +
      '</div>';
  } else {
    banner.innerHTML =
      '<div class="gg-banner-inner">\ud83c\udf3f ' + found + ' / ' + total + ' plants found on this device</div>';
  }
  document.body.appendChild(banner);
  setTimeout(function () { banner.classList.add("gg-show"); }, 50);
}

function escapeHtmlGG(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function ggCloseWithVines() {
  const overlay = document.getElementById("gg-close-overlay");
  if (!overlay) return;
  overlay.classList.add("gg-active");
  setTimeout(function () {
    window.close();
  }, 1300);
}
