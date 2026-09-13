// Futsal Event Tagger — vanilla implementation of the "Futsal Event Tagger" design.

const CONFIG = {
  squadSize: 14,              // 4–24
  showPlayerNames: true,
  confirmResetMode: 'full',   // 'full' | 'keepTeamPlayer' | 'keepAll'
};

const EVENT_TYPES = ['Shot', 'Pass', 'Tackle', 'Interception', 'Foul', 'Turnover', 'Save'];
const SHOT_OUTCOMES = ['Goal', 'Saved', 'Blocked', 'Off Target'];
const PASS_OUTCOMES = ['Complete', 'Incomplete'];
const CARDS = ['None', 'Yellow', 'Red'];

// Event data is stored with the English keys above; only what is displayed/exported is translated.
const I18N = {
  en: {
    opponent: 'Opponent', opponentName: 'Opponent name', date: 'Date', own: 'Own', opp: 'Opp', tagged: 'tagged',
    decOwn: 'Decrease own score', incOwn: 'Increase own score', decOpp: 'Decrease opponent score', incOpp: 'Increase opponent score',
    ownTeam: 'Own Team', squad: 'Squad', editNames: 'Edit Names', done: 'Done', name: 'name', nameFor: 'Name for #',
    event: 'Event', outcome: 'Outcome', card: 'Card', accumulatedFoul: 'Accumulated foul', accumulated: 'Accumulated',
    toggleAccumulated: 'Toggle accumulated foul', togglePowerPlay: 'Toggle power play',
    powerPlay: 'Power Play', setPiece: 'Set Piece',
    spNone: 'None', kickin: 'Kick-in', freekick: 'Free Kick', corner: 'Corner', penalty: 'Penalty',
    cancelEdit: 'Cancel Edit', confirm: 'Confirm', updateEvent: 'Update Event',
    matchLog: 'Match Log', exportCsv: 'Export CSV', event1: 'event', eventN: 'events',
    empty: 'No events tagged yet — the first one you confirm will show up here.',
    editEvent: 'Edit event', deleteEvent: 'Delete event', noCard: 'No card', cardSuffix: (c) => `${c} card`,
    yes: 'Yes', no: 'No',
    csv: ['Date', 'Opponent', 'Final Score', 'Seq', 'Team', 'Player #', 'Player Name',
      'Event', 'Outcome', 'Card', 'Accumulated Foul', 'Power Play', 'Set Piece'],
    Shot: 'Shot', Pass: 'Pass', Tackle: 'Tackle', Interception: 'Interception', Foul: 'Foul', Turnover: 'Turnover', Save: 'Save',
    Goal: 'Goal', Saved: 'Saved', Blocked: 'Blocked', 'Off Target': 'Off Target',
    Complete: 'Complete', Incomplete: 'Incomplete', None: 'None', Yellow: 'Yellow', Red: 'Red',
  },
  pt: {
    opponent: 'Adversário', opponentName: 'Nome do adversário', date: 'Data', own: 'Nós', opp: 'Adv.', tagged: 'registados',
    decOwn: 'Diminuir o nosso resultado', incOwn: 'Aumentar o nosso resultado', decOpp: 'Diminuir resultado do adversário', incOpp: 'Aumentar resultado do adversário',
    ownTeam: 'A Nossa Equipa', squad: 'Plantel', editNames: 'Editar Nomes', done: 'Concluído', name: 'nome', nameFor: 'Nome do nº ',
    event: 'Evento', outcome: 'Resultado', card: 'Cartão', accumulatedFoul: 'Falta acumulada', accumulated: 'Acumulada',
    toggleAccumulated: 'Alternar falta acumulada', togglePowerPlay: 'Alternar power play',
    powerPlay: 'Power Play', setPiece: 'Bola Parada',
    spNone: 'Nenhuma', kickin: 'Pontapé de Linha Lateral', freekick: 'Livre', corner: 'Canto', penalty: 'Penálti',
    cancelEdit: 'Cancelar Edição', confirm: 'Confirmar', updateEvent: 'Atualizar Evento',
    matchLog: 'Registo do Jogo', exportCsv: 'Exportar CSV', event1: 'evento', eventN: 'eventos',
    empty: 'Ainda sem eventos — o primeiro que confirmar aparece aqui.',
    editEvent: 'Editar evento', deleteEvent: 'Apagar evento', noCard: 'Sem cartão', cardSuffix: (c) => `Cartão ${c.toLowerCase()}`,
    yes: 'Sim', no: 'Não',
    csv: ['Data', 'Adversário', 'Resultado Final', 'Seq', 'Equipa', 'Nº Jogador', 'Nome do Jogador',
      'Evento', 'Resultado', 'Cartão', 'Falta Acumulada', 'Power Play', 'Bola Parada'],
    Shot: 'Remate', Pass: 'Passe', Tackle: 'Desarme', Interception: 'Interceção', Foul: 'Falta', Turnover: 'Perda de Bola', Save: 'Defesa',
    Goal: 'Golo', Saved: 'Defendido', Blocked: 'Bloqueado', 'Off Target': 'Fora',
    Complete: 'Certo', Incomplete: 'Errado', None: 'Nenhum', Yellow: 'Amarelo', Red: 'Vermelho',
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

const CORNERS = '<i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>';
const EDIT_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>';
const DELETE_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>';

const today = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

const FORM_DEFAULTS = {
  eventType: null, outcomeShot: null, outcomePass: null,
  foulCard: 'None', accumulatedFoul: false,
  powerPlay: false, setPiece: 'none', editingId: null,
};

const state = {
  lang: storedLang(),
  opponent: '', date: today(),
  ownScore: 0, oppScore: 0,
  squadNames: {}, editingNames: false,
  team: 'own', selectedPlayer: null,
  ...FORM_DEFAULTS,
  events: [], nextSeq: 1,
};

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pressed = (on) => `aria-pressed="${on}"`;
const t = (key) => I18N[state.lang][key] ?? I18N.en[key] ?? key;

// — actions —

function resetForm() {
  const mode = CONFIG.confirmResetMode;
  if (mode === 'keepAll') {
    state.editingId = null;
    return;
  }
  Object.assign(state, FORM_DEFAULTS);
  if (mode !== 'keepTeamPlayer') {
    state.team = 'own';
    state.selectedPlayer = null;
  }
}

function canConfirm() {
  const s = state;
  if (!s.eventType) return false;
  if (s.team === 'own' ? !s.selectedPlayer : s.selectedPlayer !== 'OPP') return false;
  if (s.eventType === 'Shot' && !s.outcomeShot) return false;
  if (s.eventType === 'Pass' && !s.outcomePass) return false;
  return true;
}

function confirmEvent() {
  if (!canConfirm()) return;
  const s = state;
  const existing = s.editingId && s.events.find((e) => e.id === s.editingId);
  const entry = {
    id: existing ? existing.id : Date.now() + Math.random(),
    seq: existing ? existing.seq : s.nextSeq,
    team: s.team, player: s.selectedPlayer,
    playerName: s.team === 'own' ? (s.squadNames[s.selectedPlayer] || '') : '',
    eventType: s.eventType, outcomeShot: s.outcomeShot, outcomePass: s.outcomePass,
    foulCard: s.foulCard, accumulatedFoul: s.accumulatedFoul,
    powerPlay: s.powerPlay, setPiece: s.setPiece,
  };
  if (existing) {
    s.events = s.events.map((e) => (e.id === existing.id ? entry : e));
  } else {
    s.events = [entry, ...s.events];
    s.nextSeq += 1;
  }
  resetForm();
}

function editEvent(id) {
  const e = state.events.find((ev) => ev.id === id);
  if (!e) return;
  Object.assign(state, {
    team: e.team, selectedPlayer: e.player, eventType: e.eventType,
    outcomeShot: e.outcomeShot, outcomePass: e.outcomePass,
    foulCard: e.foulCard, accumulatedFoul: e.accumulatedFoul,
    powerPlay: e.powerPlay, setPiece: e.setPiece, editingId: id,
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteEvent(id) {
  state.events = state.events.filter((e) => e.id !== id);
  if (state.editingId === id) resetForm();
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
  team: ({ team }) => {
    state.team = team;
    state.selectedPlayer = team === 'opponent' ? 'OPP' : null;
  },
  'toggle-names': () => { state.editingNames = !state.editingNames; },
  player: ({ number }) => { state.selectedPlayer = Number(number); },
  'select-opponent': () => { state.selectedPlayer = 'OPP'; },
  'event-type': ({ value }) => {
    state.eventType = value;
    state.outcomeShot = null;
    state.outcomePass = null;
  },
  'shot-outcome': ({ value }) => { state.outcomeShot = value; },
  'pass-outcome': ({ value }) => { state.outcomePass = value; },
  card: ({ value }) => { state.foulCard = value; },
  toggle: ({ key }) => { state[key] = !state[key]; },
  'cancel-edit': () => resetForm(),
  confirm: () => confirmEvent(),
  edit: ({ id }) => editEvent(Number(id)),
  remove: ({ id }) => deleteEvent(Number(id)),
};

// — rendering —

function chips(list, action, selected, extra = () => '') {
  return list.map((label) =>
    `<button class="chip" data-action="${action}" data-value="${esc(label)}" ${extra(label)} ${pressed(selected === label)}>${esc(t(label))}</button>`
  ).join('');
}

function renderSquad() {
  const s = state;
  const tiles = [];
  for (let n = 1; n <= CONFIG.squadSize; n++) {
    const name = s.squadNames[n] || '';
    const sel = pressed(s.team === 'own' && s.selectedPlayer === n);
    if (s.editingNames) {
      tiles.push(`<div class="blueprint tile" ${sel}>${CORNERS}
        <div class="tile-number">${n}</div>
        <input class="input" data-rename="${n}" value="${esc(name)}" placeholder="${t('name')}" aria-label="${t('nameFor')}${n}">
      </div>`);
    } else {
      const nameEl = CONFIG.showPlayerNames && name ? `<div class="tile-name">${esc(name)}</div>` : '';
      tiles.push(`<button class="blueprint tile" data-action="player" data-number="${n}" ${sel}>${CORNERS}
        <div class="tile-number">${n}</div>${nameEl}
      </button>`);
    }
  }
  $('squad-grid').innerHTML = tiles.join('');
  $('edit-names').textContent = t(s.editingNames ? 'done' : 'editNames');
}

function renderOutcome() {
  const s = state;
  const el = $('outcome');
  let html = '';
  if (s.eventType === 'Shot') {
    html = `<h4 class="subsection-title">${t('outcome')}</h4><div class="chips">${chips(SHOT_OUTCOMES, 'shot-outcome', s.outcomeShot)}</div>`;
  } else if (s.eventType === 'Pass') {
    html = `<h4 class="subsection-title">${t('outcome')}</h4><div class="chips">${chips(PASS_OUTCOMES, 'pass-outcome', s.outcomePass)}</div>`;
  } else if (s.eventType === 'Foul') {
    html = `<h4 class="subsection-title">${t('card')}</h4>
      <div class="chips card-row">${chips(CARDS, 'card', s.foulCard, (l) => `data-card="${l}"`)}</div>
      <div class="switch-row">
        <button class="switch" role="switch" data-action="toggle" data-key="accumulatedFoul" aria-checked="${s.accumulatedFoul}" aria-label="${t('toggleAccumulated')}"></button>
        <span>${t('accumulatedFoul')}</span>
      </div>`;
  }
  // Keep the last content while collapsing so the close transition has something to shrink.
  if (html) el.innerHTML = html;
  el.classList.toggle('open', !!html);
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

function renderLog() {
  const { events } = state;
  $('log').innerHTML = events.map((e) => {
    const own = e.team === 'own';
    const player = own ? `#${e.player}${e.playerName ? ' ' + e.playerName : ''}` : t('opponent');
    return `<div class="log-row">
      <div class="log-main">
        <div class="log-meta text-muted">#${e.seq} · ${own ? t('own') : t('opponent')}</div>
        <div class="log-title">${esc(player)} — ${esc(t(e.eventType))}</div>
        <div class="log-detail">${esc(detailFor(e))}</div>
      </div>
      <div class="log-actions">
        <button class="btn btn-icon btn-ghost" data-action="edit" data-id="${e.id}" aria-label="${t('editEvent')}">${EDIT_ICON}</button>
        <button class="btn btn-icon btn-ghost" data-action="remove" data-id="${e.id}" aria-label="${t('deleteEvent')}">${DELETE_ICON}</button>
      </div>
    </div>`;
  }).join('');
  $('log-empty').hidden = events.length > 0;
  $('export').disabled = events.length === 0;
  $('event-count').textContent = events.length;
  $('event-count-label').textContent = `${events.length} ${t(events.length === 1 ? 'event1' : 'eventN')}`;
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
  const isOwn = s.team === 'own';

  renderStaticText();

  $('own-score').textContent = s.ownScore;
  $('opp-score').textContent = s.oppScore;

  document.querySelectorAll('[data-action="team"]').forEach((b) =>
    b.setAttribute('aria-pressed', b.dataset.team === s.team));

  $('squad-section').hidden = !isOwn;
  $('opponent-section').hidden = isOwn;
  if (isOwn) renderSquad();
  $('opponent-tile').setAttribute('aria-pressed', !isOwn && s.selectedPlayer === 'OPP');

  $('event-types').innerHTML = chips(EVENT_TYPES, 'event-type', s.eventType);
  renderOutcome();

  $('power-play').setAttribute('aria-checked', s.powerPlay);
  $('set-piece').value = s.setPiece;

  $('cancel-edit').hidden = !s.editingId;
  $('confirm').textContent = t(s.editingId ? 'updateEvent' : 'confirm');
  $('confirm').disabled = !canConfirm();

  renderLog();
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
  else if (t.dataset.rename) state.squadNames[t.dataset.rename] = t.value; // no re-render: keeps focus while typing
});

$('set-piece').addEventListener('change', (ev) => { state.setPiece = ev.target.value; });

$('opponent').value = state.opponent;
$('date').value = state.date;
render();
