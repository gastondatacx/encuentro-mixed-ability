/**
 * GOOGLE APPS SCRIPT - SUBIDA DIRECTA DE FOTOS Y VIDEOS A GOOGLE DRIVE
 * 9º Encuentro Nacional Mixed Ability Córdoba 2026
 *
 * INSTRUCCIONES DE INSTALACIÓN (Toma 1 minuto):
 * 1. Abre https://script.google.com/ con la cuenta de Google dueña de la carpeta de Drive.
 * 2. Haz clic en "Nuevo proyecto", borra el código que aparece y pega TODO este archivo.
 * 3. Arriba a la derecha, haz clic en el botón azul "Implementar" -> "Nueva implementación".
 * 4. En "Seleccionar tipo" (ícono de engranaje), elige "Aplicación web".
 * 5. Configura estos dos campos:
 *    - Ejecutar como: "Yo" (tu cuenta de Google)
 *    - Quién tiene acceso: "Cualquier persona" (Anyone)
 * 6. Haz clic en "Implementar", autoriza los permisos de Google Drive cuando te lo pida
 *    (Avanzado -> Ir a Proyecto sin título) y copia la "URL de la aplicación web"
 *    (termina en /exec).
 * 7. Pega esa URL en la constante GOOGLE_SCRIPT_URL dentro de app-encuentro/src/data/encuentro.ts
 *    (o en la variable de entorno NEXT_PUBLIC_GOOGLE_SCRIPT_URL).
 */

const FOLDER_ID = '1OjAiwQ9BVsGZWaRmrKlUh_log31TkHKS';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const folder = DriveApp.getFolderById(FOLDER_ID);

    const decodedBytes = Utilities.base64Decode(data.base64);
    const safePrefix = data.uploader ? data.uploader.trim().replace(/[^\w\s\-áéíóúÁÉÍÓÚñÑ]/g, '') + ' - ' : '';
    const fileName = safePrefix + (data.fileName || ('archivo_' + new Date().getTime()));
    const mimeType = data.mimeType || 'application/octet-stream';

    const blob = Utilities.newBlob(decodedBytes, mimeType, fileName);
    const file = folder.createFile(blob);

    return ContentService
      .createTextOutput(JSON.stringify({
        ok: true,
        fileId: file.getId(),
        fileName: file.getName(),
        url: file.getUrl()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        ok: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      ok: true,
      message: 'Servicio de subida activo para 9º Encuentro Nacional Mixed Ability'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

