// Futsal Event Tagger — vanilla implementation of the "Futsal Event Tagger" design.

const CONFIG = {
  squadSize: 14,              // 4–24
  showPlayerNames: true,
};

const CARDS = ['None', 'Yellow', 'Red'];

// One button per event + outcome, so a single tap logs a complete event.
const TAGS = [
  { key: 'tagGoal', group: 'shot', eventType: 'Shot', outcomeShot: 'Goal' },
  { key: 'tagSaved', group: 'shot', eventType: 'Shot', outcomeShot: 'Saved' },
  { key: 'tagBlocked', group: 'shot', eventType: 'Shot', outcomeShot: 'Blocked' },
  { key: 'tagOff', group: 'shot', eventType: 'Shot', outcomeShot: 'Off Target' },
  { key: 'tagPassOk', group: 'pass', eventType: 'Pass', outcomePass: 'Complete' },
  { key: 'tagPassBad', group: 'pass', eventType: 'Pass', outcomePass: 'Incomplete' },
  { key: 'tagTackle', eventType: 'Tackle' },
  { key: 'tagInterception', eventType: 'Interception' },
  { key: 'tagFoul', eventType: 'Foul' },
  { key: 'tagTurnover', eventType: 'Turnover' },
  { key: 'tagSave', eventType: 'Save' },
];

// Event data is stored with the English keys above; only what is displayed/exported is translated.
const I18N = {
  en: {
    opponent: 'Opponent', opponentName: 'Opponent name', date: 'Date', own: 'Own', opp: 'Opp', tagged: 'tagged',
    decOwn: 'Decrease own score', incOwn: 'Increase own score', decOpp: 'Decrease opponent score', incOpp: 'Increase opponent score',
    squad: 'Squad', editNames: 'Edit Squad', done: 'Done', name: 'name', nameFor: 'Name for #', numberFor: 'Number for player ',
    accumulated: 'Accumulated', toggleAccumulated: 'Toggle accumulated foul', togglePowerPlay: 'Toggle power play',
    powerPlay: 'Power Play', setPiece: 'Set Piece',
    spNone: 'None', kickin: 'Kick-in', freekick: 'Free Kick', corner: 'Corner', penalty: 'Penalty',
    matchLog: 'Match Log', exportCsv: 'Export CSV', event1: 'event', eventN: 'events',
    empty: 'No events tagged yet — tap a player\'s event button to log one.',
    deleteEvent: 'Delete event', noCard: 'No card', cardSuffix: (c) => `${c} card`, undo: 'Undo',
    yes: 'Yes', no: 'No',
    csv: ['Date', 'Opponent', 'Final Score', 'Seq', 'Team', 'Player #', 'Player Name',
      'Event', 'Outcome', 'Card', 'Accumulated Foul', 'Power Play', 'Set Piece'],
    Shot: 'Shot', Pass: 'Pass', Tackle: 'Tackle', Interception: 'Interception', Foul: 'Foul', Turnover: 'Turnover', Save: 'Save',
    Goal: 'Goal', Saved: 'Saved', Blocked: 'Blocked', 'Off Target': 'Off Target',
    Complete: 'Complete', Incomplete: 'Incomplete', None: 'None', Yellow: 'Yellow', Red: 'Red',
    tagGoal: 'Goal', tagSaved: 'On target', tagBlocked: 'Blocked', tagOff: 'Off target',
    tagPassOk: 'Pass ✓', tagPassBad: 'Pass ✗', tagTackle: 'Tackle', tagInterception: 'Intercept',
    tagFoul: 'Foul', tagTurnover: 'Lost ball', tagSave: 'Save',
  },
  pt: {
    opponent: 'Adversário', opponentName: 'Nome do adversário', date: 'Data', own: 'Nós', opp: 'Adv.', tagged: 'registados',
    decOwn: 'Diminuir o nosso resultado', incOwn: 'Aumentar o nosso resultado', decOpp: 'Diminuir resultado do adversário', incOpp: 'Aumentar resultado do adversário',
    squad: 'Plantel', editNames: 'Editar Plantel', done: 'Concluído', name: 'nome', nameFor: 'Nome do nº ', numberFor: 'Número do jogador ',
    accumulated: 'Acumulada', toggleAccumulated: 'Alternar falta acumulada', togglePowerPlay: 'Alternar power play',
    powerPlay: 'Power Play', setPiece: 'Bola Parada',
    spNone: 'Nenhuma', kickin: 'Pontapé de Linha Lateral', freekick: 'Livre', corner: 'Canto', penalty: 'Penálti',
    matchLog: 'Registo do Jogo', exportCsv: 'Exportar CSV', event1: 'evento', eventN: 'eventos',
    empty: 'Ainda sem eventos — toque num botão de evento de um jogador para registar.',
    deleteEvent: 'Apagar evento', noCard: 'Sem cartão', cardSuffix: (c) => `Cartão ${c.toLowerCase()}`, undo: 'Anular',
    yes: 'Sim', no: 'Não',
    csv: ['Data', 'Adversário', 'Resultado Final', 'Seq', 'Equipa', 'Nº Jogador', 'Nome do Jogador',
      'Evento', 'Resultado', 'Cartão', 'Falta Acumulada', 'Power Play', 'Bola Parada'],
    Shot: 'Remate', Pass: 'Passe', Tackle: 'Desarme', Interception: 'Interceção', Foul: 'Falta', Turnover: 'Perda de Bola', Save: 'Defesa',
    Goal: 'Golo', Saved: 'Defendido', Blocked: 'Bloqueado', 'Off Target': 'Fora',
    Complete: 'Certo', Incomplete: 'Errado', None: 'Nenhum', Yellow: 'Amarelo', Red: 'Vermelho',
    tagGoal: 'Golo', tagSaved: 'À baliza', tagBlocked: 'Bloqueado', tagOff: 'Fora',
    tagPassOk: 'Passe ✓', tagPassBad: 'Passe ✗', tagTackle: 'Desarme', tagInterception: 'Interceção',
    tagFoul: 'Falta', tagTurnover: 'Perda', tagSave: 'Defesa',
  },
};

function storedLang() {
  try {
    const v = localStorage.getItem('lang');
    if (v in I18N) return v;
  } catch { /* storage unavailable */ }
  return navigator.language?.toLowerCase().startsWith('pt') ? 'pt' : 'en';
}

const SET_PIECE_KEYS = { none: 'spNone', kickin: 'kickin', freekick: 'freekick', corner: 'corner', penalty: 'penalty' };

const DELETE_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>';

const today = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

const state = {
  lang: storedLang(),
  opponent: '', date: today(),
  ownScore: 0, oppScore: 0,
  // Squad slots; numbers are editable, so events keep the number/name the player had when tagged.
  squad: Array.from({ length: CONFIG.squadSize }, (_, i) => ({ number: String(i + 1), name: '' })),
  editingNames: false,
  powerPlay: false, setPiece: 'none',
  events: [], nextSeq: 1,
  flash: null, // { player, tag } of the button just tapped, for visual feedback
};

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pressed = (on) => `aria-pressed="${on}"`;
const t = (key) => I18N[state.lang][key] ?? I18N.en[key] ?? key;

// — actions —

function adjustScoreFor(e, delta) {
  if (e.outcomeShot !== 'Goal') return;
  const key = e.team === 'own' ? 'ownScore' : 'oppScore';
  state[key] = Math.max(0, state[key] + delta);
}

function tagEvent(player, tagKey) {
  const s = state;
  const tag = TAGS.find((x) => x.key === tagKey);
  if (!tag) return;
  const own = player !== 'OPP';
  const slot = own ? s.squad[Number(player)] : null;
  const entry = {
    id: Date.now() + Math.random(),
    seq: s.nextSeq,
    team: own ? 'own' : 'opponent',
    player: own ? slot.number : 'OPP',
    playerName: own ? slot.name : '',
    eventType: tag.eventType, outcomeShot: tag.outcomeShot || null, outcomePass: tag.outcomePass || null,
    foulCard: 'None', accumulatedFoul: false,
    powerPlay: s.powerPlay, setPiece: s.setPiece,
  };
  s.events = [entry, ...s.events];
  s.nextSeq += 1;
  s.setPiece = 'none'; // a set piece applies to one action; power play persists until switched off
  s.flash = { player: String(player), tag: tagKey };
  adjustScoreFor(entry, 1);
}

function deleteEvent(id) {
  const e = state.events.find((ev) => ev.id === id);
  if (!e) return;
  state.events = state.events.filter((ev) => ev.id !== id);
  adjustScoreFor(e, -1);
}

function updateEvent(id, patch) {
  state.events = state.events.map((e) => (e.id === id ? { ...e, ...patch } : e));
}

function csvCell(v) {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function exportCsv() {
  const s = state;
  const header = t('csv');
  const score = `${s.ownScore}-${s.oppScore}`;
  const yesNo = (v) => t(v ? 'yes' : 'no');
  const rows = [...s.events].sort((a, b) => a.seq - b.seq).map((e) => [
    s.date, s.opponent, score, e.seq,
    e.team === 'own' ? t('own') : t('opponent'),
    e.team === 'own' ? e.player : '',
    e.playerName,
    t(e.eventType),
    e.eventType === 'Shot' ? t(e.outcomeShot) : e.eventType === 'Pass' ? t(e.outcomePass) : '',
    e.eventType === 'Foul' ? t(e.foulCard) : '',
    e.eventType === 'Foul' ? yesNo(e.accumulatedFoul) : '',
    yesNo(e.powerPlay),
    e.setPiece && e.setPiece !== 'none' ? t(SET_PIECE_KEYS[e.setPiece]) : '',
  ]);
  const csv = [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');

  // BOM so Excel reads accented player names as UTF-8.
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const slug = (s.opponent || 'match').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `futsal-${s.date}-${slug || 'match'}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

const handlers = {
  export: () => exportCsv(),
  lang: ({ lang }) => {
    state.lang = lang;
    try { localStorage.setItem('lang', lang); } catch { /* storage unavailable */ }
  },
  score: ({ side, delta }) => {
    const key = side === 'own' ? 'ownScore' : 'oppScore';
    state[key] = Math.max(0, state[key] + Number(delta));
  },
  'toggle-names': () => { state.editingNames = !state.editingNames; },
  tag: ({ player, tag }) => tagEvent(player, tag),
  toggle: ({ key }) => { state[key] = !state[key]; },
  'foul-card': ({ id, value }) => updateEvent(Number(id), { foulCard: value }),
  'foul-acc': ({ id }) => {
    const e = state.events.find((ev) => ev.id === Number(id));
    if (e) updateEvent(e.id, { accumulatedFoul: !e.accumulatedFoul });
  },
  undo: () => { if (state.events[0]) deleteEvent(state.events[0].id); },
  remove: ({ id }) => deleteEvent(Number(id)),
};

// — rendering —

function tagButtons(player) {
  return TAGS.map((tag) =>
    `<button class="tag-btn" data-action="tag" data-player="${player}" data-tag="${tag.key}"${tag.group ? ` data-group="${tag.group}"` : ''}>${esc(t(tag.key))}</button>`
  ).join('');
}

function renderPlayers() {
  const s = state;
  const rows = [];
  s.squad.forEach(({ number, name }, i) => {
    const head = s.editingNames
      ? `<input class="input player-number-input" data-slot="${i}" data-field="number" value="${esc(number)}" inputmode="numeric" maxlength="3" aria-label="${t('numberFor')}${i + 1}">
         <input class="input player-name-input" data-slot="${i}" data-field="name" value="${esc(name)}" placeholder="${t('name')}" aria-label="${t('nameFor')}${esc(number)}">`
      : `<span class="player-number">${esc(number || '?')}</span>${CONFIG.showPlayerNames && name ? `<span class="player-name">${esc(name)}</span>` : ''}`;
    rows.push(`<div class="player-row">
      <div class="player-head">${head}</div>
      <div class="tag-grid">${tagButtons(i)}</div>
    </div>`);
  });
  $('players').innerHTML = rows.join('');
  $('edit-names').textContent = t(s.editingNames ? 'done' : 'editNames');

  $('opponent-row').innerHTML = `<div class="player-row opponent">
    <div class="player-head"><span class="player-number">${esc(s.opponent || t('opponent'))}</span></div>
    <div class="tag-grid">${tagButtons('OPP')}</div>
  </div>`;
}

function detailFor(e) {
  const parts = [];
  if (e.eventType === 'Shot') parts.push(e.outcomeShot ? t(e.outcomeShot) : '—');
  else if (e.eventType === 'Pass') parts.push(e.outcomePass ? t(e.outcomePass) : '—');
  else if (e.eventType === 'Foul') {
    parts.push(e.foulCard === 'None' ? t('noCard') : t('cardSuffix')(t(e.foulCard)));
    if (e.accumulatedFoul) parts.push(t('accumulated'));
  }
  if (e.powerPlay) parts.push(t('powerPlay'));
  if (e.setPiece && e.setPiece !== 'none') parts.push(t(SET_PIECE_KEYS[e.setPiece]));
  return parts.length ? parts.join(' · ') : '—';
}

function playerLabel(e) {
  return e.team === 'own' ? `#${e.player}${e.playerName ? ' ' + e.playerName : ''}` : t('opponent');
}

// Card and accumulated flag are set after the one-tap foul, directly on its log row.
function foulControls(e) {
  const cards = CARDS.map((c) =>
    `<button class="chip chip-sm" data-action="foul-card" data-id="${e.id}" data-value="${c}" data-card="${c}" ${pressed(e.foulCard === c)}>${esc(t(c))}</button>`
  ).join('');
  return `<div class="log-foul">
    <div class="chips">${cards}</div>
    <div class="switch-row">
      <button class="switch" role="switch" data-action="foul-acc" data-id="${e.id}" aria-checked="${e.accumulatedFoul}" aria-label="${t('toggleAccumulated')}"></button>
      <span>${t('accumulated')}</span>
    </div>
  </div>`;
}

function renderLog() {
  const { events } = state;
  $('log').innerHTML = events.map((e) => {
    const own = e.team === 'own';
    return `<div class="log-row">
      <div class="log-main">
        <div class="log-meta text-muted">#${e.seq} · ${own ? t('own') : t('opponent')}</div>
        <div class="log-title">${esc(playerLabel(e))} — ${esc(t(e.eventType))}</div>
        <div class="log-detail">${esc(detailFor(e))}</div>
        ${e.eventType === 'Foul' ? foulControls(e) : ''}
      </div>
      <div class="log-actions">
        <button class="btn btn-icon btn-ghost" data-action="remove" data-id="${e.id}" aria-label="${t('deleteEvent')}">${DELETE_ICON}</button>
      </div>
    </div>`;
  }).join('');
  $('log-empty').hidden = events.length > 0;
  $('export').disabled = events.length === 0;
  $('event-count').textContent = events.length;
  $('event-count-label').textContent = `${events.length} ${t(events.length === 1 ? 'event1' : 'eventN')}`;

  const last = events[0];
  $('undo-bar').hidden = !last;
  if (last) $('undo-text').textContent = `${playerLabel(last)} — ${t(last.eventType)} · ${detailFor(last)}`;
}

function renderStaticText() {
  document.documentElement.lang = state.lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  document.querySelectorAll('[data-action="lang"]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.lang === state.lang));
}

function render() {
  const s = state;

  renderStaticText();

  $('own-score').textContent = s.ownScore;
  $('opp-score').textContent = s.oppScore;

  renderPlayers();

  $('power-play').setAttribute('aria-checked', s.powerPlay);
  $('set-piece').value = s.setPiece;

  renderLog();

  if (s.flash) {
    $('players').parentElement
      .querySelector(`[data-action="tag"][data-player="${s.flash.player}"][data-tag="${s.flash.tag}"]`)
      ?.classList.add('flash');
    s.flash = null;
  }
}

// — wiring —

document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-action]');
  if (!el) return;
  const handler = handlers[el.dataset.action];
  if (!handler) return;
  handler(el.dataset);
  render();
});

document.addEventListener('input', (ev) => {
  const t = ev.target;
  if (t.id === 'opponent') state.opponent = t.value;
  else if (t.id === 'date') state.date = t.value;
  else if (t.dataset.slot) state.squad[t.dataset.slot][t.dataset.field] = t.value.trim(); // no re-render: keeps focus while typing
});

// Refresh the opponent row label once typing in the opponent field is done.
$('opponent').addEventListener('change', () => render());

$('set-piece').addEventListener('change', (ev) => { state.setPiece = ev.target.value; });

$('opponent').value = state.opponent;
$('date').value = state.date;
render();
