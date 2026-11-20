/**
 * GOOGLE APPS SCRIPT - SUBIDA DE FOTOS + PANEL DE ANALÍTICAS EN GOOGLE DRIVE
 * 9º Encuentro Nacional Mixed Ability Córdoba 2026
 *
 * INSTRUCCIONES DE INSTALACIÓN / ACTUALIZACIÓN (Toma 1 minuto):
 * 1. Abre https://script.google.com/ con la cuenta de Google dueña de la carpeta de Drive.
 * 2. Abre el proyecto existente (o haz clic en "Nuevo proyecto"), borra el código y pega TODO este archivo.
 * 3. Arriba a la derecha, haz clic en "Implementar" -> "Administrar implementaciones" (lápiz -> "Nueva versión")
 *    o "Nueva implementación" si es la primera vez.
 * 4. En "Seleccionar tipo" (ícono de engranaje), elige "Aplicación web".
 * 5. Configura estos dos campos:
 *    - Ejecutar como: "Yo" (tu cuenta de Google)
 *    - Quién tiene acceso: "Cualquier persona" (Anyone)
 * 6. Haz clic en "Implementar", autoriza permisos si te lo pide y verifica que la URL terminada en /exec
 *    coincida con GOOGLE_SCRIPT_URL en app-encuentro/src/data/encuentro.ts (o NEXT_PUBLIC_GOOGLE_SCRIPT_URL).
 */

const FOLDER_ID = '1OjAiwQ9BVsGZWaRmrKlUh_log31TkHKS';
const ANALYTICS_FILENAME = '_analytics_encuentro_2026.json';
const MAX_KNOWN_IDS = 2500;
const MAX_RECENT_EVENTS = 40;
const MAX_PROCESSED_IDS = 400;
const ARGENTINA_OFFSET_MS = 3 * 60 * 60 * 1000;

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function createEmptyAnalytics() {
  const now = new Date().toISOString();
  return {
    createdAt: now,
    updatedAt: now,
    totals: {
      sessions: 0,
      uniqueVisitors: 0,
      returningSessions: 0,
      interactions: 0,
      engagedSessions: 0,
      totalDurationSec: 0,
      offlineSessions: 0,
      pwaSessions: 0,
      pwaPromptShown: 0,
      pwaInstalls: 0,
      photosUploaded: 0,
      photosQueuedOffline: 0,
      driveAlbumClicks: 0,
      mapExpands: 0,
      directionsClicks: 0,
      addressCopies: 0,
      shareClicks: 0,
      whatsappClicks: 0,
      emailClicks: 0,
      streamClicks: 0
    },
    devices: { android: 0, ios: 0, desktop: 0 },
    sections: {
      inicio: 0,
      agenda: 0,
      fixture: 0,
      equipos: 0,
      sede: 0,
      guia: 0,
      fotos: 0,
      contacto: 0
    },
    navClicks: {
      inicio: 0,
      agenda: 0,
      fixture: 0,
      equipos: 0,
      sede: 0,
      guia: 0,
      fotos: 0,
      contacto: 0
    },
    scheduleDays: { sabado: 0, domingo: 0 },
    fixtureFilters: {},
    teamFichas: {},
    searchTerms: {},
    faqsOpened: {},
    byHour: {},
    byDay: {},
    activeVisitors: {},
    knownVisitors: [],
    engagedSessionIds: [],
    recentEvents: [],
    processedEventIds: []
  };
}

function getOrCreateAnalyticsFile(folder) {
  const files = folder.getFilesByName(ANALYTICS_FILENAME);
  if (files.hasNext()) {
    return files.next();
  }
  const initial = createEmptyAnalytics();
  return folder.createFile(ANALYTICS_FILENAME, JSON.stringify(initial), MimeType.PLAIN_TEXT);
}

function readAnalyticsFromFolder(folder) {
  const file = getOrCreateAnalyticsFile(folder);
  try {
    const raw = file.getBlob().getDataAsString('UTF-8');
    const parsed = JSON.parse(raw);
    const base = createEmptyAnalytics();
    return Object.assign(base, parsed, {
      totals: Object.assign({}, base.totals, parsed.totals || {}),
      devices: Object.assign({}, base.devices, parsed.devices || {}),
      sections: Object.assign({}, base.sections, parsed.sections || {}),
      navClicks: Object.assign({}, base.navClicks, parsed.navClicks || {}),
      scheduleDays: Object.assign({}, base.scheduleDays, parsed.scheduleDays || {})
    });
  } catch (err) {
    return createEmptyAnalytics();
  }
}

function writeAnalyticsToFolder(folder, stats) {
  const file = getOrCreateAnalyticsFile(folder);
  file.setContent(JSON.stringify(stats));
}

function getArgentinaTimeKeys(ts) {
  const shifted = new Date(ts - ARGENTINA_OFFSET_MS);
  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  const day = String(shifted.getUTCDate()).padStart(2, '0');
  const hour = String(shifted.getUTCHours()).padStart(2, '0');
  const dayKey = year + '-' + month + '-' + day;
  return { dayKey: dayKey, hourKey: dayKey + ' ' + hour + ':00' };
}

function formatEventLabel(ev) {
  const meta = ev.meta || {};
  const sectionLabels = {
    inicio: 'Inicio',
    agenda: 'Cronograma',
    fixture: 'Fixture',
    equipos: 'Equipos',
    sede: 'Sede y Mapa',
    guia: 'Guía Oficial',
    fotos: 'Álbum y Fotos',
    contacto: 'Contacto'
  };
  switch (ev.type) {
    case 'session_start': return meta.isReturning ? 'Visita recurrente a la app' : 'Nueva visita a la app';
    case 'section_view': return 'Exploró sección: ' + (sectionLabels[meta.section] || meta.section || '');
    case 'nav_click': return 'Tocó menú: ' + (sectionLabels[meta.section] || meta.section || '');
    case 'schedule_day': return 'Consultó cronograma: ' + (meta.day === 'domingo' ? 'Domingo 22' : 'Sábado 21');
    case 'fixture_filter': return 'Filtró fixture (' + (meta.filter || 'general') + ')';
    case 'fixture_search': return 'Buscó en fixture: “' + (meta.query || '') + '”';
    case 'fixture_block_toggle': return 'Desplegó bloque del fixture (' + (meta.blockId || '') + ')';
    case 'team_search': return 'Buscó equipo: “' + (meta.query || '') + '”';
    case 'team_ficha_open': return 'Abrió ficha de ' + (meta.team || 'equipo');
    case 'map_expand': return 'Amplió mapa oficial del predio';
    case 'venue_directions': return 'Abrió GPS / Cómo llegar al club';
    case 'venue_copy_address': return 'Copió dirección de la sede';
    case 'faq_open': return 'Abrió FAQ: ' + (meta.question || 'Pregunta');
    case 'photo_drive_open': return 'Abrió el álbum en Google Drive';
    case 'photo_upload_success': return 'Subió ' + (meta.count || 1) + ' archivo(s) al álbum';
    case 'photo_upload_offline_queue': return 'Guardó ' + (meta.count || 1) + ' archivo(s) en cola sin conexión';
    case 'share_click': return 'Compartió la app';
    case 'contact_click': return meta.channel === 'whatsapp' ? 'Tocó contacto por WhatsApp' : 'Tocó contacto por Email';
    case 'stream_click': return 'Abrió stream en vivo (' + (meta.day === 'domingo' ? 'Domingo 22' : 'Sábado 21') + ')';
    case 'pwa_prompt_shown': return 'Se mostró aviso de instalar app';
    case 'pwa_installed': return 'Instaló la app (PWA)';
    case 'offline_usage': return 'Usó la app sin conexión en el predio';
    default: return ev.type;
  }
}

function applyEventsToStats(stats, events) {
  const interactive = {
    nav_click: true, schedule_day: true, fixture_filter: true, fixture_search: true,
    fixture_block_toggle: true, team_search: true, team_ficha_open: true, map_expand: true,
    venue_directions: true, venue_copy_address: true, faq_open: true, photo_drive_open: true,
    photo_upload_success: true, photo_upload_offline_queue: true, share_click: true,
    contact_click: true, stream_click: true, pwa_installed: true
  };

  stats.knownVisitors = Array.isArray(stats.knownVisitors) ? stats.knownVisitors : [];
  stats.engagedSessionIds = Array.isArray(stats.engagedSessionIds) ? stats.engagedSessionIds : [];
  stats.processedEventIds = Array.isArray(stats.processedEventIds) ? stats.processedEventIds : [];
  stats.recentEvents = Array.isArray(stats.recentEvents) ? stats.recentEvents : [];
  stats.activeVisitors = stats.activeVisitors || {};
  stats.byHour = stats.byHour || {};
  stats.byDay = stats.byDay || {};
  stats.fixtureFilters = stats.fixtureFilters || {};
  stats.teamFichas = stats.teamFichas || {};
  stats.searchTerms = stats.searchTerms || {};
  stats.faqsOpened = stats.faqsOpened || {};

  const knownSet = {};
  stats.knownVisitors.forEach(function (v) { knownSet[v] = true; });
  const engagedSet = {};
  stats.engagedSessionIds.forEach(function (s) { engagedSet[s] = true; });
  const processedSet = {};
  stats.processedEventIds.forEach(function (id) { processedSet[id] = true; });

  const sorted = events.slice().sort(function (a, b) { return (a.ts || 0) - (b.ts || 0); });
  const newRecent = [];

  for (let i = 0; i < sorted.length; i++) {
    const ev = sorted[i];
    if (!ev || !ev.id || !ev.type || processedSet[ev.id]) continue;
    processedSet[ev.id] = true;
    stats.processedEventIds.push(ev.id);

    const ts = typeof ev.ts === 'number' && ev.ts > 0 ? ev.ts : Date.now();
    const keys = getArgentinaTimeKeys(ts);
    if (!stats.byDay[keys.dayKey]) {
      stats.byDay[keys.dayKey] = { sessions: 0, interactions: 0 };
    }
    const dayBucket = stats.byDay[keys.dayKey];
    const meta = ev.meta || {};

    if (ev.visitorId) {
      stats.activeVisitors[ev.visitorId] = Math.max(stats.activeVisitors[ev.visitorId] || 0, ts);
      if (!knownSet[ev.visitorId]) {
        knownSet[ev.visitorId] = true;
        stats.knownVisitors.push(ev.visitorId);
      }
    }

    const markEngaged = function () {
      if (ev.sessionId && !engagedSet[ev.sessionId]) {
        engagedSet[ev.sessionId] = true;
        stats.engagedSessionIds.push(ev.sessionId);
      }
    };

    if (ev.type === 'session_start') {
      stats.totals.sessions += 1;
      dayBucket.sessions += 1;
      stats.byHour[keys.hourKey] = (stats.byHour[keys.hourKey] || 0) + 1;
      if (meta.isReturning) stats.totals.returningSessions += 1;
      if (ev.mode === 'pwa') stats.totals.pwaSessions += 1;
      if (!ev.online) stats.totals.offlineSessions += 1;
      if (ev.device && stats.devices.hasOwnProperty(ev.device)) {
        stats.devices[ev.device] += 1;
      }
    } else if (ev.type === 'heartbeat') {
      const sec = Math.min(Math.max(Number(meta.durationSec) || 30, 1), 120);
      stats.totals.totalDurationSec += sec;
    } else if (ev.type === 'section_view') {
      const sec = String(meta.section || '');
      if (sec) {
        stats.sections[sec] = (stats.sections[sec] || 0) + 1;
        if (sec !== 'inicio') markEngaged();
      }
    } else if (ev.type === 'offline_usage') {
      stats.totals.offlineSessions += 1;
    } else if (ev.type === 'pwa_prompt_shown') {
      stats.totals.pwaPromptShown += 1;
    }

    if (interactive[ev.type]) {
      stats.totals.interactions += 1;
      dayBucket.interactions += 1;
      markEngaged();

      if (ev.type === 'nav_click' && meta.section) {
        stats.navClicks[meta.section] = (stats.navClicks[meta.section] || 0) + 1;
      } else if (ev.type === 'schedule_day' && meta.day) {
        stats.scheduleDays[meta.day] = (stats.scheduleDays[meta.day] || 0) + 1;
      } else if (ev.type === 'fixture_filter' && meta.filter) {
        stats.fixtureFilters[meta.filter] = (stats.fixtureFilters[meta.filter] || 0) + 1;
      } else if ((ev.type === 'fixture_search' || ev.type === 'team_search') && meta.query) {
        const q = String(meta.query).trim().toLowerCase();
        if (q.length >= 2) stats.searchTerms[q] = (stats.searchTerms[q] || 0) + 1;
      } else if (ev.type === 'team_ficha_open' && meta.team) {
        stats.teamFichas[meta.team] = (stats.teamFichas[meta.team] || 0) + 1;
      } else if (ev.type === 'map_expand') {
        stats.totals.mapExpands += 1;
      } else if (ev.type === 'venue_directions') {
        stats.totals.directionsClicks += 1;
      } else if (ev.type === 'venue_copy_address') {
        stats.totals.addressCopies += 1;
      } else if (ev.type === 'faq_open' && meta.question) {
        stats.faqsOpened[meta.question] = (stats.faqsOpened[meta.question] || 0) + 1;
      } else if (ev.type === 'photo_drive_open') {
        stats.totals.driveAlbumClicks += 1;
      } else if (ev.type === 'photo_upload_success') {
        stats.totals.photosUploaded += Number(meta.count) || 1;
      } else if (ev.type === 'photo_upload_offline_queue') {
        stats.totals.photosQueuedOffline += Number(meta.count) || 1;
      } else if (ev.type === 'share_click') {
        stats.totals.shareClicks += 1;
      } else if (ev.type === 'contact_click') {
        if (meta.channel === 'whatsapp') stats.totals.whatsappClicks += 1;
        else if (meta.channel === 'email') stats.totals.emailClicks += 1;
      } else if (ev.type === 'stream_click') {
        stats.totals.streamClicks = (stats.totals.streamClicks || 0) + 1;
      } else if (ev.type === 'pwa_installed') {
        stats.totals.pwaInstalls += 1;
      }
    }

    if (ev.type !== 'heartbeat') {
      newRecent.push({
        id: ev.id,
        type: ev.type,
        label: formatEventLabel(ev),
        ts: ts,
        device: ev.device || 'desktop',
        mode: ev.mode || 'browser'
      });
    }
  }

  stats.knownVisitors = stats.knownVisitors.slice(-MAX_KNOWN_IDS);
  stats.engagedSessionIds = stats.engagedSessionIds.slice(-MAX_KNOWN_IDS);
  stats.processedEventIds = stats.processedEventIds.slice(-MAX_PROCESSED_IDS);
  stats.totals.uniqueVisitors = Math.max(stats.totals.uniqueVisitors || 0, stats.knownVisitors.length);
  stats.totals.engagedSessions = Math.max(stats.totals.engagedSessions || 0, stats.engagedSessionIds.length);

  if (newRecent.length > 0) {
    const merged = newRecent.reverse().concat(stats.recentEvents);
    const seen = {};
    stats.recentEvents = merged.filter(function (item) {
      if (!item || !item.id || seen[item.id]) return false;
      seen[item.id] = true;
      return true;
    }).sort(function (a, b) { return b.ts - a.ts; }).slice(0, MAX_RECENT_EVENTS);
  }

  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  Object.keys(stats.activeVisitors).forEach(function (vid) {
    if (stats.activeVisitors[vid] < cutoff) delete stats.activeVisitors[vid];
  });

  stats.updatedAt = new Date().toISOString();
  return stats;
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const folder = DriveApp.getFolderById(FOLDER_ID);

    if (data.action === 'analytics_track') {
      const lock = LockService.getScriptLock();
      lock.waitLock(10000);
      try {
        let stats = readAnalyticsFromFolder(folder);
        if (
          stats.totals.sessions === 0 &&
          (!stats.recentEvents || stats.recentEvents.length === 0) &&
          data.snapshot
        ) {
          stats = Object.assign(stats, data.snapshot);
        }
        if (Array.isArray(data.events) && data.events.length > 0) {
          stats = applyEventsToStats(stats, data.events);
        }
        writeAnalyticsToFolder(folder, stats);
        return jsonResponse({ ok: true, analyticsReady: true, analytics: stats });
      } finally {
        lock.releaseLock();
      }
    }

    if (data.action === 'analytics_reset') {
      const lock = LockService.getScriptLock();
      lock.waitLock(10000);
      try {
        const empty = createEmptyAnalytics();
        writeAnalyticsToFolder(folder, empty);
        return jsonResponse({ ok: true, analyticsReady: true, analytics: empty });
      } finally {
        lock.releaseLock();
      }
    }

    // Subida normal de fotos y videos a Drive (100% compatible con versión anterior)
    const decodedBytes = Utilities.base64Decode(data.base64);
    const safePrefix = data.uploader ? data.uploader.trim().replace(/[^\w\s\-áéíóúÁÉÍÓÚñÑ]/g, '') + ' - ' : '';
    const fileName = safePrefix + (data.fileName || ('archivo_' + new Date().getTime()));
    const mimeType = data.mimeType || 'application/octet-stream';

    const blob = Utilities.newBlob(decodedBytes, mimeType, fileName);
    const file = folder.createFile(blob);

    return jsonResponse({
      ok: true,
      fileId: file.getId(),
      fileName: file.getName(),
      url: file.getUrl()
    });
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: error.toString()
    });
  }
}

function doGet() {
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const analytics = readAnalyticsFromFolder(folder);
    return jsonResponse({
      ok: true,
      analyticsReady: true,
      message: 'Servicio activo para 9º Encuentro Nacional Mixed Ability',
      analytics: analytics
    });
  } catch (error) {
    return jsonResponse({
      ok: true,
      analyticsReady: false,
      message: 'Servicio de subida activo para 9º Encuentro Nacional Mixed Ability',
      error: error.toString()
    });
  }
}
