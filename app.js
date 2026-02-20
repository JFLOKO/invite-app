
// --- Utils ---
const normalize = (s) => s
  .toLowerCase()
  .normalize('NFD')
  .replace(/\p{Diacritic}/gu, '')
  .trim();

// --- Store ---
let guests = JSON.parse(localStorage.getItem('guests')) || {
  'jean dupont': '12',
  'marie kalla': '5',
  'élodie mboa': '3',
  'patrick onana': '8',
  'sandra mobio': '4',
  'mickaël essomba': '6'
};

// Build normalized index for partial search
const buildIndex = () => Object.entries(guests).map(([name, table]) => ({
  key: name,
  nkey: normalize(name),
  table: String(table)
}));
let index = buildIndex();

// DOM
const inputEl = document.getElementById('search');
const suggEl  = document.getElementById('suggestions');
const resEl   = document.getElementById('result');

function findGuest() {
  if (!inputEl) return;
  const q = normalize(inputEl.value);
  if (suggEl) suggEl.innerHTML = '';
  if (resEl) resEl.innerHTML = '';
  if (!q) return;

  const matches = index.filter(x => x.nkey.includes(q));
  matches.sort((a,b)=>{
    const aw = a.nkey.startsWith(q) ? 0 : 1;
    const bw = b.nkey.startsWith(q) ? 0 : 1;
    return aw !== bw ? aw - bw : a.nkey.length - b.nkey.length;
  });

  if (matches.length === 0) {
    if (suggEl) suggEl.innerHTML = '<div class="hint">Aucun résultat. Vérifiez l\'orthographe.</div>';
    return;
  }

  const top = matches[0];
  if (matches.length === 1 && (top.nkey === q || top.nkey.startsWith(q))) {
    if (resEl) resEl.innerHTML = `✔ Table : <b>${top.table}</b> — <span class="name">${top.key}</span>`;
    return;
  }

  const limit = 8;
  matches.slice(0,limit).forEach(m => {
    const item = document.createElement('div');
    item.className = 'suggestion';
    item.innerHTML = highlight(m.key, q);
    item.onclick = () => {
      inputEl.value = m.key;
      if (resEl) resEl.innerHTML = `✔ Table : <b>${m.table}</b> — <span class="name">${m.key}</span>`;
      if (suggEl) suggEl.innerHTML = '';
    };
    if (suggEl) suggEl.appendChild(item);
  });
}

function highlight(text, q){
  const nq = normalize(q);
  const nt = normalize(text);
  const pos = nt.indexOf(nq);
  if (pos === -1) return text;
  // Try to map position back to original string approximately
  // Simpler: just wrap the typed query length at that approximate position
  return text.substring(0, pos) + '<mark>' + text.substring(pos, pos + q.length) + '</mark>' + text.substring(pos + q.length);
}

if (inputEl) {
  let t; inputEl.addEventListener('input', ()=>{ clearTimeout(t); t = setTimeout(findGuest, 120); });
}

// --- Manage functions ---
function saveGuests(){
  const ta = document.getElementById('guestData');
  if(!ta) return;
  const lines = ta.value.trim().split(/\n+/);
  const map = {};
  lines.forEach(line => {
    const parts = line.split(',');
    if (parts.length === 2){
      const name = parts[0].trim();
      const table = parts[1].trim();
      if (name) map[name.toLowerCase()] = table;
    }
  });
  localStorage.setItem('guests', JSON.stringify(map));
  guests = map; index = buildIndex();
  alert('Liste mise à jour !');
}

function importCSV(){
  const fileInput = document.getElementById('csvFile');
  if (!fileInput || !fileInput.files || !fileInput.files[0]){ alert('Sélectionnez un fichier CSV.'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    const lines = e.target.result.split(/\r?\n/).filter(Boolean);
    document.getElementById('guestData').value = lines.join('\n');
    alert('CSV chargé. Cliquez sur Enregistrer pour appliquer.');
  };
  reader.readAsText(fileInput.files[0], 'utf-8');
}

function exportCSV(){
  const rows = Object.entries(guests).map(([name, table])=> `${name.replace(/\b\w/g, c=>c.toUpperCase())}, ${table}`);
  const blob = new Blob([rows.join('\n')], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'invites.csv'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

// Prefill manage textarea
window.addEventListener('DOMContentLoaded', ()=>{
  const ta = document.getElementById('guestData');
  if (ta){
    const rows = Object.entries(guests).map(([name, table])=> `${name.replace(/\b\w/g, c=>c.toUpperCase())}, ${table}`);
    ta.value = rows.join('\n');
  }
});
