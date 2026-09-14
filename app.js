/**
 * LexiScan house tour — interactive controller (client-facing UI).
 */

import { ROOMS, EXPORT_SCHEMA } from './data.js';

const STORAGE_KEY = 'fabfloow-ul-playground-v2';

/** @typedef {{ currentRoom: string, quests: Record<string, boolean>, decisions: Array<object>, quizzes: Record<string, string>, startedAt: string, lastVisit: string }} State */

/** @returns {State} */
function defaultState() {
  return {
    currentRoom: 'ingest',
    quests: {},
    decisions: [],
    quizzes: {},
    startedAt: new Date().toISOString(),
    lastVisit: new Date().toISOString(),
  };
}

/** @returns {State} */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

/** @param {State} state */
function saveState(state) {
  state.lastVisit = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();

// ── DOM refs ──
const floorPlan = document.getElementById('floor-plan');
const roomContainer = document.getElementById('room-container');
const ledgerList = document.getElementById('ledger-list');
const progressText = document.getElementById('progress-text');
const welcomeOverlay = document.getElementById('welcome-overlay');
const startTourBtn = document.getElementById('start-tour');
const exportJsonBtn = document.getElementById('export-json');
const exportMdBtn = document.getElementById('export-md');
const resetBtn = document.getElementById('reset-progress');
const mobileMapToggle = document.getElementById('mobile-map-toggle');

// ── Helpers ──
function totalQuests() {
  return ROOMS.reduce((n, r) => n + r.quests.length, 0);
}

function completedQuestCount() {
  return Object.values(state.quests).filter(Boolean).length;
}

function roomQuestDone(room) {
  return room.quests.every((q) => state.quests[`${room.id}:${q.id}`]);
}

function questKey(roomId, questId) {
  return `${roomId}:${questId}`;
}

function roomById(id) {
  return ROOMS.find((r) => r.id === id);
}

function activityLabel(count) {
  return count === 1 ? '1 actividad' : `${count} actividades`;
}

// ── Render floor plan ──
function renderFloorPlan() {
  floorPlan.innerHTML = `
    <div class="corridor-label">↕ Corredor principal</div>
    ${ROOMS.map((room) => {
      const done = roomQuestDone(room);
      const pending = room.quests.filter((q) => !state.quests[questKey(room.id, q.id)]).length;
      const isActive = state.currentRoom === room.id;
      return `
        <button class="room-node ${isActive ? 'active' : ''} ${done ? 'completed' : ''}"
                data-room="${room.id}" type="button">
          <span class="room-icon">${room.icon}</span>
          <span class="room-name">${room.nameEs}</span>
          <span class="room-sub">${room.sub}</span>
          <span class="quest-badge ${done ? 'done' : ''}">${done ? '✓' : activityLabel(pending)}</span>
        </button>
      `;
    }).join('')}
    <div class="corridor-label">↕ Salida · Descargar decisiones</div>
  `;

  floorPlan.querySelectorAll('.room-node').forEach((btn) => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.room));
  });
}

// ── Room-specific demo HTML ──
function demoHtml(room) {
  switch (room.id) {
    case 'ingest':
      return `
        <div class="demo-zone" id="demo-ingest">
          <div class="panel-grid">
            <div class="mock-ui">
              <div class="mock-ui-header" style="background:#c4a035;color:white">Demo guiada (~90 s)</div>
              <div class="mock-ui-body">
                <p>Expediente SL1392-2024 · laboral</p>
                <button class="btn btn-primary btn-sm" data-action="meeting-demo">Iniciar demo guiada</button>
              </div>
            </div>
            <div class="mock-ui">
              <div class="mock-ui-header">Carga propia</div>
              <div class="mock-ui-body">
                <div class="drop-zone" id="drop-zone">
                  <p>📄 Arrastre su PDF, HTML o texto aquí</p>
                  <p style="font-size:0.75rem;margin-top:0.5rem">o haga clic para simular una carga</p>
                </div>
              </div>
            </div>
          </div>
          <div id="folio-map" style="display:none;margin-top:1rem">
            <h4 style="font-size:0.9rem;color:var(--mustard);margin-bottom:0.5rem">Mapa de folios del expediente</h4>
            <div class="mock-ui"><div class="mock-ui-body">
              <div class="mock-row"><span>Demanda SL1392-2024</span><span class="badge badge-info">folios 1–12</span></div>
              <div class="mock-row"><span>Contestación</span><span class="badge badge-info">folios 13–28</span></div>
              <div class="mock-row"><span>Anexos</span><span class="badge badge-pending">PDF sin texto legible</span></div>
            </div></div>
          </div>
          <div id="source-banner" style="display:none;margin-top:0.75rem" class="badge badge-pending"></div>
        </div>`;

    case 'p1':
      return `
        <div class="demo-zone" id="demo-p1">
          <label>Área del derecho</label>
          <select id="vertical-select">
            <option value="laboral">Laboral · SL1392-2024</option>
            <option value="penal">Penal · SP-2024-001</option>
            <option value="civil">Civil · SC-2024-001</option>
            <option value="contencioso">Contencioso · CA-2024-001</option>
          </select>
          <button class="btn btn-primary btn-sm" id="load-p1">Cargar alertas del caso</button>
          <div id="p1-board" style="display:none;margin-top:1rem">
            <div class="mock-ui"><div class="mock-ui-body" id="p1-rows"></div></div>
          </div>
        </div>`;

    case 'hitl':
      return `
        <div class="demo-zone" id="demo-hitl">
          <div class="mock-ui"><div class="mock-ui-body">
            <div class="mock-row" id="hitl-row-1">
              <span>⚠ Prescripción art. 488 CST</span>
              <span class="badge badge-pending">pendiente</span>
            </div>
            <div class="mock-row" id="hitl-row-2">
              <span>⚠ Firma faltante en contestación</span>
              <span class="badge badge-pending">pendiente</span>
            </div>
          </div></div>
          <div style="margin-top:0.75rem;display:flex;gap:0.5rem;flex-wrap:wrap">
            <button class="btn btn-primary btn-sm" id="hitl-confirm-btn">Confirmar alerta 1</button>
            <button class="btn btn-secondary btn-sm" id="hitl-waive-btn">Resolver cita con nota</button>
            <button class="btn btn-danger btn-sm" id="hitl-export-btn">Intentar exportar informe</button>
          </div>
          <div id="hitl-waive-form" style="display:none;margin-top:0.75rem">
            <label>Nota obligatoria para resolver la cita</label>
            <textarea id="waive-note" placeholder="Ej.: Cita verificada manualmente en Relatoría…"></textarea>
            <button class="btn btn-copper btn-sm" id="submit-waive">Registrar resolución</button>
          </div>
          <div id="hitl-export-result" class="feedback" style="margin-top:0.75rem"></div>
        </div>`;

    case 'juriscol':
      return `
        <div class="demo-zone" id="demo-juriscol">
          <div class="mock-ui"><div class="mock-ui-body">
            <div class="mock-row">
              <span>Complemento Juriscol</span>
              <button class="toggle-switch" id="juriscol-toggle" type="button" aria-label="Activar Juriscol"></button>
            </div>
            <div id="juriscol-audit" style="display:none;font-size:0.8rem;color:var(--ink-muted);margin-top:0.5rem"></div>
            <div id="juriscol-stub" style="display:none;margin-top:0.75rem">
              <div class="mock-row">
                <span>Cita T-012/92 — pendiente de verificación</span>
                <span class="badge badge-pending">sin confirmar</span>
              </div>
            </div>
          </div></div>
          <button class="btn btn-danger btn-sm" id="jur-export-btn" style="margin-top:0.75rem" disabled>Exportar informe</button>
          <div id="jur-export-result" class="feedback" style="margin-top:0.75rem"></div>
        </div>`;

    case 'openlaw':
      return `
        <div class="demo-zone" id="demo-openlaw">
          <div class="panel-grid">
            <div class="mock-ui">
              <div class="mock-ui-header">Corte Constitucional · datos.gov</div>
              <div class="mock-ui-body">
                <span>Sentencia <strong>T-012/92</strong></span><br>
                <span class="badge badge-ok">encontrada</span> · enlace a fuente oficial
              </div>
            </div>
            <div class="mock-ui">
              <div class="mock-ui-header">Consulta al momento</div>
              <div class="mock-ui-body">
                <div class="mock-row"><span>Referencias de citas</span><span>metadatos guardados</span></div>
                <div class="mock-row"><span>Texto completo</span><span>bajo demanda · caché temporal</span></div>
              </div>
            </div>
          </div>
          <div style="margin-top:1rem">
            <label>Pruebe el comportamiento</label>
            <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.5rem">
              <button class="btn btn-primary btn-sm" id="ol-single-cite">Consultar una cita ✓</button>
              <button class="btn btn-danger btn-sm" id="ol-bulk-crawl">Pedir descarga masiva</button>
              <button class="btn btn-secondary btn-sm" id="ol-show-lru">Ver espacio usado (50 GB)</button>
            </div>
          </div>
          <div id="ol-result" class="feedback" style="margin-top:0.75rem"></div>
          <div id="ol-lru-panel" style="display:none;margin-top:0.75rem">
            <div class="meter-bar"><div class="meter-fill mid" style="width:34%"></div></div>
            <p style="font-size:0.8rem;color:var(--ink-muted)">17,2 GB de 50 GB usados · consultamos cita por cita, no copiamos toda la jurisprudencia</p>
          </div>
        </div>`;

    case 'export':
      return `
        <div class="demo-zone" id="demo-export">
          <div class="mock-ui"><div class="mock-ui-body">
            <div class="mock-row"><span>Alertas sin resolver</span><span id="exp-p1" class="badge badge-pending">2</span></div>
            <div class="mock-row"><span>Citas sin verificar (Juriscol)</span><span id="exp-cite" class="badge badge-pending">1</span></div>
            <div class="mock-row"><span>Sello de confirmación</span><span id="exp-sig">—</span></div>
          </div></div>
          <div style="margin-top:0.75rem;display:flex;gap:0.5rem">
            <button class="btn btn-danger btn-sm" id="exp-try">Intentar exportar (bloqueado)</button>
            <button class="btn btn-primary btn-sm" id="exp-clear-btn">Resolver todo y exportar</button>
          </div>
          <div id="exp-result" class="feedback" style="margin-top:0.75rem"></div>
          <div id="exp-provenance-panel" style="display:none;margin-top:0.75rem" class="pre-block client-pre">
Origen: demo guiada
Sello de confirmación: registrado
Cita T-012/92 · verificada · fuente oficial · fecha de consulta registrada
          </div>
        </div>`;

    case 'vault':
      return `
        <div class="demo-zone" id="demo-vault">
          <label>Estudio</label>
          <select id="estudio-select">
            <option value="estudio-demo">Socio · estudio-demo</option>
            <option value="estudio-otro">Socio · estudio-otro</option>
          </select>
          <div id="vault-list" style="margin-top:0.75rem">
            <div class="mock-ui"><div class="mock-ui-body" id="vault-rows">
              <div class="mock-row"><span>SL1392-2024</span><span class="badge badge-info">expediente</span></div>
            </div></div>
          </div>
          <div style="margin-top:1rem">
            <button class="btn btn-secondary btn-sm" id="vault-perp-btn">Ver separación archivo / consultas</button>
            <button class="btn btn-primary btn-sm" id="vault-meter-btn">Consultar espacio usado</button>
          </div>
          <div id="vault-perp-panel" style="display:none;margin-top:0.75rem" class="pre-block client-pre">
Archivo del estudio (expedientes del cliente)
  → separado de →
Caché de consultas jurídicas (referencias temporales)
          </div>
          <div id="vault-meter-panel" style="display:none;margin-top:0.75rem">
            <div class="meter-bar"><div class="meter-fill low" style="width:34%"></div></div>
            <p style="font-size:0.8rem">Archivo: 2,1 GB · referencias: 48 MB · caché consultas: 890 MB · límite compartido 50 GB</p>
          </div>
        </div>`;

    default:
      return '';
  }
}

// ── Render room ──
function renderRoom(room) {
  const quizAnswered = state.quizzes[room.id];
  const existingDecision = state.decisions.find((d) => d.room_id === room.id);

  return `
    <article class="room-view active" data-room="${room.id}">
      <header class="room-header">
        <div class="breadcrumb">${room.breadcrumb}</div>
        <h2>${room.icon} ${room.nameEs}</h2>
        <p class="room-desc-en" style="font-size:0.8rem;color:var(--ink-muted);margin-top:0.25rem">${room.nameEn}</p>
        <p class="room-desc">${room.description}</p>
        <div class="gideon-note"><strong>En la práctica</strong><br>${room.gideonNote}</div>
      </header>

      <section class="panel">
        <h3>Actividades de esta sala</h3>
        <ul class="quest-list">
          ${room.quests.map((q) => {
            const key = questKey(room.id, q.id);
            const done = state.quests[key];
            return `
              <li class="quest-item ${done ? 'completed' : ''}" data-quest="${q.id}">
                <span class="quest-check">${done ? '✓' : ''}</span>
                <span class="quest-text">${q.text}</span>
              </li>`;
          }).join('')}
        </ul>
        ${demoHtml(room)}
      </section>

      <section class="panel">
        <h3>Pregunta · ¿Cómo funciona?</h3>
        <p>${room.quiz.question}</p>
        <div class="quiz-options" id="quiz-${room.id}">
          ${room.quiz.options.map((opt) => `
            <button type="button" class="quiz-option ${quizAnswered === opt.id ? (opt.correct ? 'correct' : 'incorrect') : ''}"
                    data-opt="${opt.id}" ${quizAnswered ? 'disabled' : ''}>
              ${opt.text}
            </button>
          `).join('')}
        </div>
        <div id="quiz-feedback-${room.id}" class="feedback ${quizAnswered ? 'show' : ''} ${quizAnswered ? (room.quiz.options.find(o => o.id === quizAnswered)?.correct ? 'ok' : 'no') : ''}">
          ${quizAnswered ? room.quiz.options.find(o => o.id === quizAnswered)?.feedback || '' : ''}
        </div>
      </section>

      <section class="decision-door" id="door-${room.id}">
        <div class="door-icon">🚪</div>
        <h4>${room.decision.title}</h4>
        <p>${room.decision.prompt}</p>
        ${existingDecision ? `
          <p><span class="badge badge-ok">Decisión registrada</span> <strong>${existingDecision.choice_label || existingDecision.choice}</strong></p>
          <p class="entry-rationale">"${existingDecision.rationale}"</p>
        ` : `
          <div class="decision-options" id="dec-opts-${room.id}">
            ${room.decision.options.map((o) => `
              <button type="button" class="btn btn-secondary btn-sm dec-opt" data-key="${o.key}">${o.label}</button>
            `).join('')}
          </div>
          <label>Su razonamiento (por qué elige esta opción)</label>
          <textarea id="dec-rationale-${room.id}" placeholder="Notas para el registro de decisiones del estudio…"></textarea>
          <button type="button" class="btn btn-copper btn-sm" id="dec-save-${room.id}" disabled>Registrar decisión</button>
        `}
      </section>

      <nav class="room-nav">
        ${prevRoom(room) ? `<button type="button" class="btn btn-secondary btn-sm nav-prev" data-room="${prevRoom(room).id}">← ${prevRoom(room).nameEs}</button>` : '<span></span>'}
        ${nextRoom(room) ? `<button type="button" class="btn btn-primary btn-sm nav-next" data-room="${nextRoom(room).id}">${nextRoom(room).nameEs} →</button>` : '<span></span>'}
      </nav>
    </article>
  `;
}

function prevRoom(room) {
  const i = ROOMS.findIndex((r) => r.id === room.id);
  return i > 0 ? ROOMS[i - 1] : null;
}

function nextRoom(room) {
  const i = ROOMS.findIndex((r) => r.id === room.id);
  return i < ROOMS.length - 1 ? ROOMS[i + 1] : null;
}

function completeQuest(roomId, questId) {
  const key = questKey(roomId, questId);
  if (!state.quests[key]) {
    state.quests[key] = true;
    saveState(state);
    updateUI();
  }
}

function navigateTo(roomId) {
  state.currentRoom = roomId;
  saveState(state);
  updateUI();
}

function updateUI() {
  renderFloorPlan();
  const room = ROOMS.find((r) => r.id === state.currentRoom) || ROOMS[0];
  roomContainer.innerHTML = renderRoom(room);
  bindRoomEvents(room);
  renderLedger();
  progressText.innerHTML = `<strong>${completedQuestCount()}</strong> de ${totalQuests()} actividades · <strong>${state.decisions.length}</strong> de ${ROOMS.length} decisiones`;
}

function renderLedger() {
  if (state.decisions.length === 0) {
    ledgerList.innerHTML = '<p class="ledger-empty">Aún no hay decisiones. Complete las puertas 🚪 en cada sala.</p>';
    return;
  }
  ledgerList.innerHTML = state.decisions.map((d) => {
    const room = roomById(d.room_id);
    const roomName = room ? room.nameEs : d.room_id;
    return `
    <div class="ledger-entry">
      <div class="entry-room">${roomName}</div>
      <div class="entry-choice">${d.choice_label || d.choice}</div>
      <div class="entry-rationale">"${d.rationale}"</div>
    </div>
  `;
  }).join('');
}

// ── Room event bindings ──
function bindRoomEvents(room) {
  document.querySelectorAll(`#quiz-${room.id} .quiz-option`).forEach((btn) => {
    btn.addEventListener('click', () => {
      const optId = btn.dataset.opt;
      state.quizzes[room.id] = optId;
      saveState(state);
      updateUI();
    });
  });

  if (!state.decisions.find((d) => d.room_id === room.id)) {
    let selectedKey = null;
    document.querySelectorAll(`#dec-opts-${room.id} .dec-opt`).forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedKey = btn.dataset.key;
        document.querySelectorAll(`#dec-opts-${room.id} .dec-opt`).forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        checkDecisionReady(room.id, selectedKey);
      });
    });
    document.getElementById(`dec-rationale-${room.id}`)?.addEventListener('input', () => {
      checkDecisionReady(room.id, selectedKey);
    });
    document.getElementById(`dec-save-${room.id}`)?.addEventListener('click', () => {
      const rationale = document.getElementById(`dec-rationale-${room.id}`)?.value.trim();
      const opt = room.decision.options.find((o) => o.key === selectedKey);
      if (!opt || !rationale) return;
      state.decisions.push({
        room_id: room.id,
        phase: room.phase,
        option_key: room.optionKey,
        choice: opt.key,
        choice_label: opt.label,
        rationale,
        recorded_at: new Date().toISOString(),
      });
      saveState(state);
      updateUI();
    });
  }

  document.querySelector('.nav-prev')?.addEventListener('click', (e) => navigateTo(e.target.dataset.room));
  document.querySelector('.nav-next')?.addEventListener('click', (e) => navigateTo(e.target.dataset.room));

  bindDemoEvents(room);
}

function checkDecisionReady(roomId, selectedKey) {
  const rationale = document.getElementById(`dec-rationale-${roomId}`)?.value.trim();
  const saveBtn = document.getElementById(`dec-save-${roomId}`);
  if (saveBtn) saveBtn.disabled = !(selectedKey && rationale);
}

function bindDemoEvents(room) {
  switch (room.id) {
    case 'ingest':
      bindIngestDemo(room);
      break;
    case 'p1':
      bindP1Demo(room);
      break;
    case 'hitl':
      bindHitlDemo(room);
      break;
    case 'juriscol':
      bindJuriscolDemo(room);
      break;
    case 'openlaw':
      bindOpenLawDemo(room);
      break;
    case 'export':
      bindExportDemo(room);
      break;
    case 'vault':
      bindVaultDemo(room);
      break;
  }
}

function bindIngestDemo(room) {
  document.querySelector('[data-action="meeting-demo"]')?.addEventListener('click', () => {
    completeQuest(room.id, 'ingest-drop');
    completeQuest(room.id, 'ingest-source');
    const banner = document.getElementById('source-banner');
    if (banner) {
      banner.style.display = 'inline-block';
      banner.textContent = 'Origen: demo guiada · SL1392-2024';
    }
    showFolioMap();
  });

  const dropZone = document.getElementById('drop-zone');
  dropZone?.addEventListener('click', () => {
    dropZone.classList.add('has-file');
    dropZone.innerHTML = '<p>✓ escrito-propio.pdf · carga propia</p>';
    completeQuest(room.id, 'ingest-drop');
    completeQuest(room.id, 'ingest-source');
    const banner = document.getElementById('source-banner');
    if (banner) {
      banner.style.display = 'inline-block';
      banner.textContent = 'Origen: carga propia';
    }
    showFolioMap();
  });
}

function showFolioMap() {
  const map = document.getElementById('folio-map');
  if (map) map.style.display = 'block';
  completeQuest('ingest', 'ingest-folio');
}

function bindP1Demo(room) {
  document.getElementById('load-p1')?.addEventListener('click', () => {
    const v = document.getElementById('vertical-select')?.value || 'laboral';
    completeQuest(room.id, 'p1-load');
    completeQuest(room.id, 'p1-pending');
    const board = document.getElementById('p1-board');
    const rows = document.getElementById('p1-rows');
    if (board) board.style.display = 'block';
    if (rows) {
      rows.innerHTML = `
        <div class="mock-row"><span>⚠ Prescripción · ${v}</span><span class="badge badge-pending">pendiente</span></div>
        <div class="mock-row"><span>⚠ Contradicción de fechas</span><span class="badge badge-pending">pendiente</span></div>
        <div class="mock-row"><span>✓ Firma en demanda</span><span class="badge badge-ok">confirmada</span></div>`;
    }
  });
  document.getElementById('vertical-select')?.addEventListener('change', () => {
    completeQuest(room.id, 'p1-vertical');
  });
}

function bindHitlDemo(room) {
  let confirmed = false;
  let waived = false;

  document.getElementById('hitl-confirm-btn')?.addEventListener('click', () => {
    const row = document.getElementById('hitl-row-1');
    if (row) {
      row.querySelector('.badge').className = 'badge badge-ok';
      row.querySelector('.badge').textContent = 'confirmada';
    }
    confirmed = true;
    completeQuest(room.id, 'hitl-confirm');
  });

  document.getElementById('hitl-waive-btn')?.addEventListener('click', () => {
    document.getElementById('hitl-waive-form').style.display = 'block';
  });

  document.getElementById('submit-waive')?.addEventListener('click', () => {
    const note = document.getElementById('waive-note')?.value.trim();
    if (!note) return;
    waived = true;
    completeQuest(room.id, 'hitl-waive');
    document.getElementById('hitl-waive-form').style.display = 'none';
  });

  document.getElementById('hitl-export-btn')?.addEventListener('click', () => {
    const el = document.getElementById('hitl-export-result');
    if (!el) return;
    el.classList.add('show');
    if (!confirmed || !waived) {
      el.className = 'feedback show no';
      el.innerHTML = '<strong>Informe bloqueado</strong> — hay alertas o citas sin resolver. LexiScan no deja salir el informe hasta confirmación humana.';
      completeQuest(room.id, 'hitl-fail');
    } else {
      el.className = 'feedback show ok';
      el.textContent = 'Informe listo — todas las confirmaciones registradas.';
    }
  });
}

function bindJuriscolDemo(room) {
  let enabled = false;
  let stubVisible = false;

  document.getElementById('juriscol-toggle')?.addEventListener('click', (e) => {
    enabled = !enabled;
    e.target.classList.toggle('on', enabled);
    const audit = document.getElementById('juriscol-audit');
    if (enabled) {
      completeQuest(room.id, 'jur-toggle');
      if (audit) {
        audit.style.display = 'block';
        audit.textContent = `Activado por abogado · ${new Date().toLocaleString('es-CO')} · expediente SL1392-2024`;
      }
      document.getElementById('juriscol-stub').style.display = 'block';
      stubVisible = true;
      completeQuest(room.id, 'jur-stub');
      document.getElementById('jur-export-btn').disabled = false;
    } else {
      if (audit) audit.style.display = 'none';
      document.getElementById('juriscol-stub').style.display = 'none';
      stubVisible = false;
    }
  });

  document.getElementById('jur-export-btn')?.addEventListener('click', () => {
    const el = document.getElementById('jur-export-result');
    if (!el) return;
    el.classList.add('show');
    if (enabled && stubVisible) {
      el.className = 'feedback show no';
      el.innerHTML = '<strong>Informe bloqueado</strong> — hay una cita sin verificar. Resuélvala antes de exportar.';
      completeQuest(room.id, 'jur-403');
    } else {
      el.className = 'feedback show ok';
      el.textContent = 'Informe listo para exportar.';
    }
  });
}

function bindOpenLawDemo(room) {
  document.getElementById('ol-single-cite')?.addEventListener('click', () => {
    completeQuest(room.id, 'ol-adapter');
    const el = document.getElementById('ol-result');
    if (el) {
      el.className = 'feedback show ok';
      el.textContent = '✓ Sentencia T-012/92 consultada en fuente oficial — referencia guardada.';
    }
  });

  document.getElementById('ol-bulk-crawl')?.addEventListener('click', () => {
    completeQuest(room.id, 'ol-bulk');
    const el = document.getElementById('ol-result');
    if (el) {
      el.className = 'feedback show no';
      // BulkCrawlRefused — product lock (not shown to end user)
      el.innerHTML = '<strong>No permitido</strong> — LexiScan consulta cita por cita. No descargamos toda la jurisprudencia al servidor.';
    }
  });

  document.getElementById('ol-show-lru')?.addEventListener('click', () => {
    completeQuest(room.id, 'ol-lru');
    document.getElementById('ol-lru-panel').style.display = 'block';
  });
}

function bindExportDemo(room) {
  let cleared = false;

  document.getElementById('exp-try')?.addEventListener('click', () => {
    const el = document.getElementById('exp-result');
    if (!el) return;
    el.classList.add('show');
    if (!cleared) {
      el.className = 'feedback show no';
      el.innerHTML = '<strong>Informe bloqueado</strong> — quedan 2 alertas y 1 cita sin resolver.';
      completeQuest(room.id, 'exp-403');
    } else {
      el.className = 'feedback show ok';
      el.textContent = 'Informe exportado correctamente.';
    }
  });

  document.getElementById('exp-clear-btn')?.addEventListener('click', () => {
    cleared = true;
    document.getElementById('exp-p1').className = 'badge badge-ok';
    document.getElementById('exp-p1').textContent = '0';
    document.getElementById('exp-cite').className = 'badge badge-ok';
    document.getElementById('exp-cite').textContent = '0';
    document.getElementById('exp-sig').textContent = 'Registrado ✓';
    completeQuest(room.id, 'exp-clear');
    document.getElementById('exp-provenance-panel').style.display = 'block';
    completeQuest(room.id, 'exp-provenance');
  });
}

function bindVaultDemo(room) {
  document.getElementById('estudio-select')?.addEventListener('change', (e) => {
    const rows = document.getElementById('vault-rows');
    if (e.target.value === 'estudio-otro') {
      rows.innerHTML = '<p style="color:var(--ink-muted);font-style:italic">Sin expedientes — cada estudio solo ve su propio archivo</p>';
    } else {
      rows.innerHTML = '<div class="mock-row"><span>SL1392-2024</span><span class="badge badge-info">expediente</span></div>';
    }
    completeQuest(room.id, 'vault-isolate');
  });

  document.getElementById('vault-perp-btn')?.addEventListener('click', () => {
    document.getElementById('vault-perp-panel').style.display = 'block';
    completeQuest(room.id, 'vault-perp');
  });

  document.getElementById('vault-meter-btn')?.addEventListener('click', () => {
    document.getElementById('vault-meter-panel').style.display = 'block';
    completeQuest(room.id, 'vault-meter');
  });
}

// ── Export ──
function buildExportPayload() {
  return {
    ...EXPORT_SCHEMA,
    locked_at: null,
    exported_at: new Date().toISOString(),
    tour_progress: {
      quests_completed: completedQuestCount(),
      quests_total: totalQuests(),
      decisions_recorded: state.decisions.length,
      decisions_expected: ROOMS.length,
      quizzes_answered: Object.keys(state.quizzes).length,
      started_at: state.startedAt,
      last_visit: state.lastVisit,
    },
    decisions: state.decisions.map((d) => ({
      room_id: d.room_id,
      phase: d.phase,
      option_key: d.option_key,
      choice: d.choice,
      choice_label: d.choice_label,
      rationale: d.rationale,
      recorded_at: d.recorded_at,
    })),
  };
}

function buildMarkdownTable(payload) {
  const lines = [
    '# Recorrido LexiScan · registro de decisiones',
    '',
    `> Pegar en [registro de decisiones](${EXPORT_SCHEMA.notion_url})`,
    '',
    `| locked_at | exported_at | version |`,
    `|-----------|-------------|---------|`,
    `| _PENDIENTE_ | ${payload.exported_at} | ${payload.version} |`,
    '',
    '## Tabla de decisiones',
    '',
    '| phase | option_key | choice | rationale | recorded_at |',
    '|-------|------------|--------|-----------|-------------|',
  ];
  for (const d of payload.decisions) {
    const rat = d.rationale.replace(/\|/g, '\\|').replace(/\n/g, ' ');
    lines.push(`| ${d.phase} | ${d.option_key} | ${d.choice} | ${rat} | ${d.recorded_at} |`);
  }
  lines.push('');
  lines.push('## Progreso');
  lines.push('');
  lines.push(`- Actividades: ${payload.tour_progress.quests_completed}/${payload.tour_progress.quests_total}`);
  lines.push(`- Decisiones: ${payload.tour_progress.decisions_recorded}/${payload.tour_progress.decisions_expected}`);
  lines.push(`- Preguntas: ${payload.tour_progress.quizzes_answered}/${ROOMS.length}`);
  lines.push('');
  lines.push('---');
  lines.push('*FabFloow · LexiScan · verificador, no auto-memo · Precio por definir*');
  return lines.join('\n');
}

function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ── Init ──
startTourBtn?.addEventListener('click', () => {
  welcomeOverlay?.classList.add('hidden');
});

exportJsonBtn?.addEventListener('click', () => {
  const payload = buildExportPayload();
  downloadFile(
    `lexiscan-decisiones-${Date.now()}.json`,
    JSON.stringify(payload, null, 2),
    'application/json',
  );
});

exportMdBtn?.addEventListener('click', () => {
  const payload = buildExportPayload();
  downloadFile(
    `lexiscan-decisiones-${Date.now()}.md`,
    buildMarkdownTable(payload),
    'text/markdown',
  );
});

resetBtn?.addEventListener('click', () => {
  if (confirm('¿Reiniciar el recorrido? Se borrará su progreso guardado en este navegador.')) {
    localStorage.removeItem(STORAGE_KEY);
    state = defaultState();
    updateUI();
  }
});

mobileMapToggle?.addEventListener('click', () => {
  document.querySelector('.sidebar-map')?.classList.toggle('mobile-visible');
});

if (!localStorage.getItem(STORAGE_KEY + '-welcomed')) {
  welcomeOverlay?.classList.remove('hidden');
  localStorage.setItem(STORAGE_KEY + '-welcomed', '1');
} else {
  welcomeOverlay?.classList.add('hidden');
}

updateUI();
