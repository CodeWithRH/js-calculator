const display = document.getElementById('display');
const equals = document.getElementById('equals');
const clear = document.getElementById('clear');


// append digits/decimal
for (const btn of document.querySelectorAll('[data-key]')) {
btn.addEventListener('click', () => {
display.value += btn.dataset.key;
});
}


// operators
for (const opBtn of document.querySelectorAll('[data-op]')) {
opBtn.addEventListener('click', () => {
const v = display.value.trim();
if (!v) return; // ignore if empty
const last = v.at(-1);
// prevent duplicates like "+-"; replace last operator if needed
if ('+-*/'.includes(last)) {
display.value = v.slice(0, -1) + opBtn.dataset.op;
} else {
display.value += opBtn.dataset.op;
}
});
}


// equals: safe eval using Function on allowed characters only
equals.addEventListener('click', () => {
const expr = display.value.trim();
if (!/^[-+*/.\d\s]+$/.test(expr)) {
alert('Invalid characters');
return;
}
try {
// Evaluate and fix floating point rounding to 10 decimals max
const result = Function(`"use strict"; return (${expr})`)();
display.value = Number.isFinite(result) ? Number(result.toFixed(10)).toString() : '';
} catch {
alert('Malformed expression');
}
});


clear.addEventListener('click', () => (display.value = ''));


// Keyboard support
window.addEventListener('keydown', (e) => {
if ((e.key >= '0' && e.key <= '9') || e.key === '.') display.value += e.key;
if ('+-*/'.includes(e.key)) {
const v = display.value.trim();
if (!v) return;
const last = v.at(-1);
if ('+-*/'.includes(last)) display.value = v.slice(0, -1) + e.key; else display.value += e.key;
}
if (e.key === 'Enter' || e.key === '=') equals.click();
if (e.key.toLowerCase() === 'c') clear.click();
});

const installBtn = document.getElementById('install');
const copyBtn = document.getElementById('copy');
const shareBtn = document.getElementById('share');
const locateBtn = document.getElementById('locate');
const statusEl = document.getElementById('status');


// Haptics on button press
function buzz() { if (navigator.vibrate) navigator.vibrate(10); }
for (const el of document.querySelectorAll('button[data-key], button[data-op], #equals, #clear')) {
el.addEventListener('click', buzz);
}


// Clipboard copy
copyBtn.addEventListener('click', async () => {
try {
await navigator.clipboard.writeText(display.value || '0');
statusEl.textContent = 'Copied!';
} catch {
statusEl.textContent = 'Clipboard unavailable.';
}
});


// Web Share (if supported)
if (navigator.share) {
shareBtn.hidden = false;
shareBtn.addEventListener('click', async () => {
try {
await navigator.share({ title: 'Calculator', text: `Result: ${display.value || '0'}`, url: location.href });
statusEl.textContent = 'Shared.';
} catch { statusEl.textContent = 'Share canceled.'; }
});
}


// Geolocation
locateBtn.addEventListener('click', () => {
if (!('geolocation' in navigator)) { statusEl.textContent = 'No geolocation.'; return; }
navigator.geolocation.getCurrentPosition(
({ coords }) => statusEl.textContent = `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`,
(err) => statusEl.textContent = err.message
);
});


// Install prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
e.preventDefault();
deferredPrompt = e;
installBtn.hidden = false;
});
installBtn.addEventListener('click', async () => {
installBtn.hidden = true;
if (!deferredPrompt) return;
deferredPrompt.prompt();
const { outcome } = await deferredPrompt.userChoice;
statusEl.textContent = outcome === 'accepted' ? 'Installed!' : 'Install dismissed.';
deferredPrompt = null;
});