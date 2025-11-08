// hearing_tracker.js
(() => {
  const frequencies = [125,250,500,1000,2000,4000,8000];
  const storageKey = 'hearingAppointments_v1';

  const el = id => document.getElementById(id);
  const freqTable = el('freqTable');
  const apptDate = el('apptDate');
  const addAppt = el('addAppt');
  const clearAll = el('clearAll');
  const appointmentsList = el('appointmentsList');

  // Build frequency rows
  frequencies.forEach(freq => {
    const tr = document.createElement('tr');
    const tdFreq = document.createElement('td');
    tdFreq.textContent = freq;
    const tdInput = document.createElement('td');
  const input = document.createElement('input');
  // Use a regular text field so there is no spinner/arrow keypad.
  // Provide a numeric keyboard on supporting devices via inputmode.
  input.type = 'text';
  input.inputMode = 'decimal';
  input.placeholder = 'dB';
  input.dataset.freq = String(freq);
  // allow characters like comma for decimal (we normalize on parse)
  input.pattern = '[0-9.,\-]+';
    tdInput.appendChild(input);
    tr.appendChild(tdFreq);
    tr.appendChild(tdInput);
    freqTable.appendChild(tr);
  });

  // Storage helpers
  function loadAppointments(){
    try{
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    }catch(e){ return []; }
  }
  function saveAppointments(arr){ localStorage.setItem(storageKey, JSON.stringify(arr)); }

  // Chart setup
  const ctx = el('chart').getContext('2d');
  let chart = null;

  function createChart(appointments){
    const labels = appointments.map(a => a.date);
    const colorPalette = [ '#e6194b','#3cb44b','#4363d8','#ffe119','#f58231','#911eb4','#46f0f0' ];

    const datasets = frequencies.map((f, idx) => ({
      label: String(f) + ' Hz',
      data: appointments.map(a => {
        const v = a.levels && (f in a.levels) ? a.levels[f] : null;
        return v === '' || v === null || v === undefined ? null : Number(v);
      }),
      borderColor: colorPalette[idx % colorPalette.length],
      backgroundColor: colorPalette[idx % colorPalette.length],
      tension: 0.2,
      fill:false,
      spanGaps:true,
    }));

    if(chart) chart.destroy();
    chart = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive:true,
        scales: {
          x: { title: { display:true, text:'Appointment date' } },
          // fixed orientation: bottom = highest dB, top = 0 dB
          y: { title: { display:true, text:'Hearing level (dB)' }, beginAtZero:false, reverse: true }
        },
        plugins: { legend: { position:'bottom' } }
      }
    });
  }


  function renderAppointments(){
    const apps = loadAppointments();
    // sort by date ascending
    apps.sort((a,b) => a.date.localeCompare(b.date));
    appointmentsList.innerHTML = '';
    apps.forEach((a, i) => {
      const li = document.createElement('li');
      const left = document.createElement('div');
      left.innerHTML = `<strong>${a.date}</strong> <span class="muted">(${Object.keys(a.levels||{}).length} freqs)</span>`;
      const right = document.createElement('div');
      const del = document.createElement('button'); del.textContent='Delete';
      del.addEventListener('click', ()=>{
        apps.splice(i,1); saveAppointments(apps); renderAppointments(); createChart(apps);
      });
      right.appendChild(del);
      li.appendChild(left); li.appendChild(right);
      appointmentsList.appendChild(li);
    });
    createChart(apps);
  }

  addAppt.addEventListener('click', ()=>{
    const date = apptDate.value;
    if(!date){ alert('Please choose a date for the appointment.'); return; }
    const inputs = Array.from(document.querySelectorAll('#freqTable input'));
    const levels = {};
    inputs.forEach(inp => {
      const f = Number(inp.dataset.freq);
        const v = inp.value.trim();
        if(v !== ''){
          // allow comma as decimal separator, normalize to dot
          const normalized = v.replace(',', '.');
          const n = parseFloat(normalized);
          if(!Number.isNaN(n)) levels[f] = n;
        }
    });

    const apps = loadAppointments();
    // If same date exists, replace it
    const existingIndex = apps.findIndex(a => a.date === date);
    const entry = { date, levels };
    if(existingIndex >= 0) apps[existingIndex] = entry; else apps.push(entry);
    saveAppointments(apps);
    renderAppointments();
    // clear inputs
    // inputs.forEach(i=> i.value=''); // keep values so user can add similar quickly
    alert('Appointment saved.');
  });

  clearAll.addEventListener('click', ()=>{
    if(!confirm('Clear all saved appointments?')) return;
    localStorage.removeItem(storageKey);
    renderAppointments();
  });

  // init
  document.addEventListener('DOMContentLoaded', ()=>{
    // render existing
    renderAppointments();
  });

})();
