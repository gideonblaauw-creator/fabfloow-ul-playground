/**
 * LexiScan house tour — room definitions, activities, quizzes, decision doors.
 * Option keys align with product closeout themes for registro de decisiones export.
 * Product lock: BulkCrawlRefused — live per cite only (not surfaced in client UI).
 */

export const ROOMS = [
  {
    id: 'ingest',
    icon: '📁',
    nameEs: 'Recepción del expediente',
    nameEn: 'Case intake',
    sub: 'Demo guiada · carga propia · folios',
    breadcrumb: 'Planta baja · Recepción',
    phase: 'P9',
    optionKey: 'p9_ingest_source',
    description:
      'Aquí entra el expediente al estudio: una demo guiada (~90 s), una carga propia (PDF, HTML o texto), o un expediente de ejemplo. LexiScan organiza las piezas con referencias de folio. Recuerde: LexiScan es un verificador — no redacta memoriales por usted.',
    gideonNote:
      'En producción verá dos opciones: demo guiada (mostaza) y carga propia (crema). El origen del expediente queda registrado en el informe final.',
    quests: [
      { id: 'ingest-drop', text: 'Recibir un expediente laboral de ejemplo (SL1392-2024)', action: 'drop' },
      { id: 'ingest-folio', text: 'Ver el mapa de folios del expediente', action: 'folio' },
      { id: 'ingest-source', text: 'Elegir origen: demo guiada o carga propia', action: 'source' },
    ],
    quiz: {
      question: 'Un PDF escaneado sin texto legible — ¿qué hace LexiScan?',
      options: [
        { id: 'a', text: 'Inventa el texto automáticamente', correct: false, feedback: 'No. LexiScan no adivina el contenido de un escaneo sin texto legible. Registra el archivo pero no genera hallazgos inventados.' },
        { id: 'b', text: 'Registra el archivo sin inventar texto (política de seguridad)', correct: true, feedback: 'Correcto. El abogado ve que el archivo llegó; el sistema no fabrica folios ni alertas a partir de píxeles.' },
        { id: 'c', text: 'Rechaza la carga por completo', correct: false, feedback: 'No rechaza — acepta el PDF pero indica que no hay texto legible. Usted decide los siguientes pasos.' },
      ],
    },
    decision: {
      title: 'Puerta · Cómo recibimos expedientes',
      prompt: 'Para el piloto del estudio, ¿qué forma de ingreso priorizamos?',
      options: [
        { key: 'meeting_demo_first', label: 'Demo guiada primero (~90 s)' },
        { key: 'own_upload_first', label: 'Carga propia de PDF como opción principal' },
        { key: 'fixture_only', label: 'Solo expedientes de ejemplo del recorrido' },
      ],
    },
  },
  {
    id: 'p1',
    icon: '📊',
    nameEs: 'Alertas del caso',
    nameEn: 'Case alerts',
    sub: 'Prescripción · firmas · contradicciones',
    breadcrumb: 'Planta 1 · Sala de análisis',
    phase: 'P8',
    optionKey: 'p8_vertical_p1',
    description:
      'LexiScan señala posibles problemas en el expediente: plazos de prescripción, firmas faltantes y contradicciones entre documentos. Funciona en varias áreas del derecho — laboral, penal, civil y contencioso-administrativo.',
    gideonNote:
      'Las alertas pendientes bloquean la salida del informe hasta que un abogado las confirme o resuelva. La misma regla aplica en todas las áreas del derecho.',
    quests: [
      { id: 'p1-load', text: 'Cargar las alertas del expediente de ejemplo', action: 'load' },
      { id: 'p1-vertical', text: 'Cambiar el área del derecho (p. ej. laboral → penal)', action: 'vertical' },
      { id: 'p1-pending', text: 'Identificar alertas pendientes (bloquean el informe)', action: 'pending' },
    ],
    quiz: {
      question: '¿Las alertas de laboral y penal siguen la misma regla antes de exportar el informe?',
      options: [
        { id: 'a', text: 'Sí — ningún informe sale con alertas sin resolver', correct: true, feedback: 'Correcto. LexiScan exige confirmación humana en todas las áreas: alerta pendiente = informe bloqueado.' },
        { id: 'b', text: 'No — penal puede exportar libremente', correct: false, feedback: 'Incorrecto. La confirmación humana es obligatoria en todas las áreas del derecho.' },
        { id: 'c', text: 'Solo laboral bloquea el informe', correct: false, feedback: 'Todas las áreas del derecho participan en la misma regla de confirmación.' },
      ],
    },
    decision: {
      title: 'Puerta · Área piloto',
      prompt: '¿Qué área del derecho abrimos primero en el estudio piloto?',
      options: [
        { key: 'laboral', label: 'Laboral (expediente SL1392-2024)' },
        { key: 'penal', label: 'Penal (expediente SP-2024-001)' },
        { key: 'civil', label: 'Civil (expediente SC-2024-001)' },
        { key: 'contencioso', label: 'Contencioso-administrativo' },
      ],
    },
  },
  {
    id: 'hitl',
    icon: '🚦',
    nameEs: 'Confirmación humana',
    nameEn: 'Human confirmation',
    sub: 'Confirmar · resolver · bloqueo seguro',
    breadcrumb: 'Planta 1 · Pasillo de control',
    phase: 'P4',
    optionKey: 'p4_hitl_policy',
    description:
      'Antes de que salga cualquier informe, un abogado debe confirmar o resolver cada alerta y cada cita pendiente. Sin confirmación completa, el informe permanece bloqueado — por diseño, para proteger al estudio.',
    gideonNote:
      'Si decide no verificar una cita, debe dejar una nota escrita. Queda registro de quién, cuándo y en qué expediente tomó la decisión.',
    quests: [
      { id: 'hitl-confirm', text: 'Confirmar una alerta del expediente', action: 'confirm' },
      { id: 'hitl-waive', text: 'Resolver una cita con nota escrita', action: 'waive' },
      { id: 'hitl-fail', text: 'Ver el informe bloqueado con alertas pendientes', action: 'fail' },
    ],
    quiz: {
      question: '¿Se puede exportar el informe con una alerta aún pendiente?',
      options: [
        { id: 'a', text: 'Sí, si Juriscol está desactivado', correct: false, feedback: 'No. Las alertas del caso se revisan independientemente de Juriscol. Alerta pendiente = informe bloqueado.' },
        { id: 'b', text: 'No — hasta confirmar o resolver cada alerta', correct: true, feedback: 'Correcto. LexiScan no deja salir un informe sin la confirmación humana correspondiente.' },
        { id: 'c', text: 'Sí, si el abogado lo autoriza por correo', correct: false, feedback: 'La confirmación debe registrarse dentro del sistema — no basta un mensaje externo.' },
      ],
    },
    decision: {
      title: 'Puerta · Confirmación en lote',
      prompt: '¿Permitimos confirmar varias alertas de una sola vez en producción?',
      options: [
        { key: 'batch_meeting_demo_only', label: 'Solo en la demo guiada' },
        { key: 'batch_never', label: 'Nunca — una decisión por alerta' },
        { key: 'batch_socio_only', label: 'En lote solo para el rol de socio' },
      ],
    },
  },
  {
    id: 'juriscol',
    icon: '⚖️',
    nameEs: 'Verificación de citas — Juriscol',
    nameEn: 'Citation check — Juriscol',
    sub: 'Complemento opcional · verificar citas',
    breadcrumb: 'Planta 2 · Módulo Juriscol',
    phase: 'P2',
    optionKey: 'p2_juriscol_seed',
    description:
      'Juriscol es un complemento dentro de LexiScan — no es una aplicación aparte. Al activarlo, el sistema verifica las citas jurídicas del expediente. Si hay citas sin revisar, el informe queda bloqueado hasta resolverlas.',
    gideonNote:
      'Con Juriscol desactivado, las citas no bloquean el informe (siguen aplicando las alertas del caso). Con Juriscol activo, cada cita debe confirmarse o resolverse con nota.',
    quests: [
      { id: 'jur-toggle', text: 'Activar Juriscol (queda registro de quién y cuándo)', action: 'toggle' },
      { id: 'jur-stub', text: 'Ver una cita de ejemplo pendiente de verificación', action: 'stub' },
      { id: 'jur-403', text: 'Intentar exportar con una cita pendiente', action: '403' },
    ],
    quiz: {
      question: 'Juriscol desactivado — ¿las citas bloquean la salida del informe?',
      options: [
        { id: 'a', text: 'Sí, siempre', correct: false, feedback: 'No. La verificación de citas solo aplica cuando Juriscol está activado.' },
        { id: 'b', text: 'No — solo aplican las alertas del caso', correct: true, feedback: 'Correcto. Juriscol apagado = citas no bloquean; las alertas del caso siguen vigentes.' },
        { id: 'c', text: 'Depende del área del derecho', correct: false, feedback: 'Activar Juriscol es una decisión por expediente, no por área del derecho.' },
      ],
    },
    decision: {
      title: 'Puerta · Citas de ejemplo al activar',
      prompt: '¿Mostramos una cita de ejemplo la primera vez que se activa Juriscol?',
      options: [
        { key: 'keep_stub', label: 'Sí — para practicar el flujo de bloqueo' },
        { key: 'no_stub', label: 'No — solo citas reales del expediente' },
        { key: 'stub_dev_only', label: 'Solo en entorno de prueba del estudio' },
      ],
    },
  },
  {
    id: 'openlaw',
    icon: '🔧',
    nameEs: 'Fuentes oficiales',
    nameEn: 'Official sources',
    sub: 'Consulta al momento · sin descarga masiva',
    breadcrumb: 'Sótano · Consulta jurídica',
    phase: 'P5',
    optionKey: 'p5_open_law_policy',
    description:
      'LexiScan consulta fuentes oficiales (Corte Constitucional, Consejo de Estado, SUIN, etc.) en el momento en que se necesita cada cita — no descarga toda la jurisprudencia al servidor. Hay un límite compartido de almacenamiento (50 GB) para caché temporal.',
    gideonNote:
      'No mantenemos una base de datos nacional de sentencias. Cada cita se consulta cuando hace falta y se guarda solo la referencia necesaria.',
    quests: [
      { id: 'ol-adapter', text: 'Consultar una cita oficial de ejemplo (T-012/92)', action: 'adapter' },
      { id: 'ol-bulk', text: 'Rechazar una descarga masiva de jurisprudencia', action: 'bulk' },
      { id: 'ol-lru', text: 'Entender el límite de almacenamiento (50 GB)', action: 'lru' },
    ],
    quiz: {
      question: '¿LexiScan guarda toda la jurisprudencia nacional en el servidor del estudio?',
      options: [
        { id: 'a', text: 'Sí, hasta 50 GB', correct: false, feedback: 'No. Los 50 GB son para caché temporal y archivos del estudio — no para copiar toda la jurisprudencia.' },
        { id: 'b', text: 'No — consulta cita por cita al momento', correct: true, feedback: 'Correcto. Cada cita se consulta cuando se necesita. Las descargas masivas no están permitidas.' },
        { id: 'c', text: 'Solo de la Corte Constitucional', correct: false, feedback: 'Varias fuentes oficiales están disponibles — todas con consulta al momento, sin volcado masivo.' },
      ],
    },
    decision: {
      title: 'Puerta · Espacio de almacenamiento',
      prompt: 'Si el almacenamiento compartido se llena, ¿qué liberamos primero?',
      options: [
        { key: 'bodies_lru_first', label: 'Caché de consultas recientes (se puede volver a pedir)' },
        { key: 'vault_oldest_first', label: 'Archivos más antiguos del estudio' },
        { key: 'refuse_writes', label: 'Detener nuevas cargas hasta liberar espacio' },
      ],
    },
  },
  {
    id: 'export',
    icon: '📤',
    nameEs: 'Informe final',
    nameEn: 'Final report',
    sub: 'Bloqueado hasta confirmar · trazabilidad',
    breadcrumb: 'Planta 2 · Puerta de salida',
    phase: 'P3',
    optionKey: 'p3_export_provenance',
    description:
      'El informe de verificación solo sale cuando no quedan alertas ni citas pendientes. Incluye el origen del expediente (demo o carga propia), un sello de confirmación y la fuente de cada cita verificada.',
    gideonNote:
      'LexiScan produce un informe de verificación — no un memorial redactado automáticamente. Precio por definir.',
    quests: [
      { id: 'exp-403', text: 'Intentar exportar con alertas pendientes', action: '403' },
      { id: 'exp-clear', text: 'Resolver pendientes y exportar el informe', action: 'clear' },
      { id: 'exp-provenance', text: 'Revisar el origen y las citas en el informe', action: 'provenance' },
    ],
    quiz: {
      question: '¿Qué contiene el informe que sale de LexiScan?',
      options: [
        { id: 'a', text: 'Un memorial redactado automáticamente', correct: false, feedback: 'LexiScan es verificador, no redactor. No genera escritos jurídicos por usted.' },
        { id: 'b', text: 'Informe de verificación con origen, confirmaciones y fuentes de citas', correct: true, feedback: 'Correcto. Incluye de dónde vino el expediente, qué se confirmó y de qué fuente proviene cada cita.' },
        { id: 'c', text: 'Solo una copia del PDF original', correct: false, feedback: 'Es un informe estructurado de verificación, no una réplica del archivo cargado.' },
      ],
    },
    decision: {
      title: 'Puerta · Formato del informe',
      prompt: '¿Qué formato prefiere el estudio para el informe de verificación?',
      options: [
        { key: 'html_informe', label: 'Informe en pantalla (HTML)' },
        { key: 'pdf_future', label: 'PDF (previsto para una fase posterior)' },
        { key: 'json_audit', label: 'Informe en pantalla + archivo de respaldo' },
      ],
    },
  },
  {
    id: 'vault',
    icon: '🔐',
    nameEs: 'Archivo del estudio',
    nameEn: 'Firm archive',
    sub: 'Aislamiento por estudio · espacio usado',
    breadcrumb: 'Sótano · Archivo privado',
    phase: 'P10',
    optionKey: 'p10_vault_ops',
    description:
      'Cada estudio ve solo sus propios expedientes — un socio no accede al archivo de otro estudio. Los archivos del cliente están separados de la caché de consultas jurídicas. Hay un medidor del espacio usado (límite compartido 50 GB).',
    gideonNote:
      'El archivo del estudio es complementario — no sustituye su gestor documental actual. Los roles de socio y asociado se configuran en el piloto.',
    quests: [
      { id: 'vault-isolate', text: 'Ver que cada estudio solo ve sus expedientes', action: 'isolate' },
      { id: 'vault-perp', text: 'Confirmar que archivo y consultas jurídicas están separados', action: 'perp' },
      { id: 'vault-meter', text: 'Consultar el espacio usado (50 GB compartidos)', action: 'meter' },
    ],
    quiz: {
      question: '¿Los archivos del estudio se mezclan con la caché de fuentes oficiales?',
      options: [
        { id: 'a', text: 'Sí, bajo presión de espacio', correct: false, feedback: 'Nunca. El archivo del cliente y la caché de consultas son almacenes separados.' },
        { id: 'b', text: 'No — están en espacios independientes', correct: true, feedback: 'Correcto. Los expedientes del estudio y las consultas jurídicas no comparten almacenamiento.' },
        { id: 'c', text: 'Solo para sentencias de la Corte Constitucional', correct: false, feedback: 'La separación aplica a todo — ningún archivo del estudio entra en la caché de consultas.' },
      ],
    },
    decision: {
      title: 'Puerta · Retención de expedientes',
      prompt: '¿Cuánto tiempo guardamos los expedientes del piloto por defecto?',
      options: [
        { key: 'retention_90d', label: '90 días (configurable por el socio)' },
        { key: 'retention_1y', label: '1 año' },
        { key: 'retention_manual', label: 'Sin borrado automático durante el piloto' },
      ],
    },
  },
];

export const EXPORT_SCHEMA = {
  version: 'understanding-lab-playground-v2',
  notion_url: 'https://app.notion.com/p/3d9dfee50be981a39107ef7854ec3ce8',
  locked_at: null,
  fields: ['room_id', 'phase', 'option_key', 'choice', 'rationale', 'recorded_at'],
};
