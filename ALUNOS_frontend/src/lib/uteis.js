import * as xlsx from 'xlsx';
import JSZip from 'jszip';
import FileSaver from 'file-saver';

/**
 * @param {number} length
 */
export function randomid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

/**
 * @param {number} num
 */
export function converteDecimalParaHHhMM(num){
  if(!num) return "-";
  var segundos = +num*3600;
  var horas = Math.floor(segundos/3600);
  segundos -= horas*3600;
  var minutos = Math.floor(segundos/60);
  return `${horas}h${("" + minutos).padStart(2, '0')}`;
}

/** * @param {string} nome */
export function reduzNomeLongo(nome){
  let partes = nome.split(" ")
  let nome_final = ""
  partes.forEach(function(parte, idx) {
      if(idx == 0 || idx == (partes.length-1)){
          nome_final += parte + " ";
      } else {
          if(parte.charAt(0) == parte.charAt(0).toUpperCase()) nome_final += parte.charAt(0) + ".";
      }
  });

  return nome_final.trim()
}

/**
 * Splits an array into chunks of a specified size.
 *
 * @param {Array} array - The array to split into chunks.
 * @param {number} chunkSize - The maximum number of items in each chunk.
 * @return {Array<Array>} An array of chunks.
 */
export function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Recursively gets all keys from an object, including nested keys.
 * If a nested key is found, the output key will be in the format 'parentKey.nestedKey'.
 *
 * @param {Object} obj - The object to extract keys from.
 * @param {string} [parentKey=''] - The parent key to prepend to nested keys.
 * @returns {string[]} - An array of all keys, including nested keys.
 *
 * @example
 * // Example usage:
 * const exampleObj = {
 *   a: 1,
 *   b: {
 *     c: 2,
 *     d: {
 *       e: 3
 *     }
 *   },
 *   f: 4
 * };
 * const keys = getObjectKeys(exampleObj);
 * console.log(keys); // Output: ['a', 'b.c', 'b.d.e', 'f']
 */
export function getObjectKeys(obj, parentKey = '') {
  return Object.keys(obj).reduce((acc, key) => {
    const newKey = parentKey ? `${parentKey}.${key}` : key;

    if (typeof obj[key] === 'object' && obj[key] !== null) {
      return acc.concat(getObjectKeys(obj[key], newKey));
    }

    acc.push(newKey);
    return acc;
  }, []);
}

/**
 * Creates a debounced function that delays the invocation of the provided
 * callback until after the specified wait time has elapsed since the last
 * time the debounced function was invoked.
 *
 * @param {Function} callback - The function to debounce.
 * @param {number} [delay=300] - The number of milliseconds to delay; defaults to 300ms.
 * @returns {Function} A debounced function that delays invoking the callback.
 *
 * @example
 * // Create a debounced function that logs 'Hello' after 500ms of no invocation.
 * const debouncedLog = debounce(() => console.log('Hello'), 500);
 *
 * // Invoke the debounced function.
 * debouncedLog();
 */
export function debounce(callback, delay = 300){
  let timeout

  return (...args) => {
    clearTimeout(timeout)

    timeout = setTimeout(() => {
      callback(...args)
    }, delay)
  }
}

/**
 * Exports JSON data to an XLSX file.
 *
 * @param {Object[]} data - The JSON data to be exported. Each object in the array represents a row in the sheet.
 * @param {string} filename - The name of the output file (without extension).
 * @param {string} [sheetname='Exported data'] - The name of the sheet within the XLSX file. Defaults to 'Exported data'.
 * @returns {void}
 */
export function exportJsonToXlsx(data, filename, sheetname, download ) {
  const workbook = xlsx.utils.book_new();

  xlsx.utils.book_append_sheet(
    workbook,
    xlsx.utils.json_to_sheet(data),
    sheetname ? sheetname : 'Exported data'
  );

  xlsx.writeFileXLSX (
    workbook,
    `${filename}.xlsx`,
    {
      compression: true
    }
  );
}

/**
 * Generate a XLSX file from JSON data.
 *
 * @param {Object[]} data - The JSON data to include on xlsx file. Each object in the array represents a row in the sheet.
 * @param {string} filename - The name of the output file (without extension).
 */
export function generateXlsxFromJson(data, filename ) {
  const workbook = xlsx.utils.book_new();

  xlsx.utils.book_append_sheet(
    workbook,
    xlsx.utils.json_to_sheet(data),
    filename
  );

  return xlsx.writeXLSX (
    workbook,
    {
      compression: true,
      bookType: 'xlsx',
      type: 'array',
    }
  )
}

/**
 * Exports content to zip file.
 *
 * @param {string} filename - The name of the output zip (without extension).
 * @param {{
 *   filename: string,
 *   file: Blob | ArrayBuffer
 * }[]} contents - The contents to be zipped
 */
export function exportZip(filename, contents) {
  const zip = new JSZip();

  contents.forEach(content => {
    zip.file(content.filename, content.file,{ binary: true })
  });

  zip
  .generateAsync({
    type:"blob"
  })
  .then(function (blob) {
    FileSaver.saveAs(blob, `${filename}.zip`);
  });
}



//https://gist.github.com/eresende/88562d2c4dc85b62cb0c
/**
 * @param {string} contribuinte
 * @returns {boolean}
 */
export function validaContribuinte(contribuinte){
  // algoritmo de validação do NIF de acordo com
  // http://pt.wikipedia.org/wiki/N%C3%BAmero_de_identifica%C3%A7%C3%A3o_fiscal

  var temErro=0;
  var comparador;

  if (
    contribuinte.substr(0,1) != '1' && // pessoa singular
    contribuinte.substr(0,1) != '2' && // pessoa singular
    contribuinte.substr(0,1) != '3' && // pessoa singular
    contribuinte.substr(0,2) != '45' && // pessoa singular não residente
    contribuinte.substr(0,1) != '5' && // pessoa colectiva
    contribuinte.substr(0,1) != '6' && // administração pública
    contribuinte.substr(0,2) != '70' && // herança indivisa
    contribuinte.substr(0,2) != '71' && // pessoa colectiva não residente
    contribuinte.substr(0,2) != '72' && // fundos de investimento
    contribuinte.substr(0,2) != '77' && // atribuição oficiosa
    contribuinte.substr(0,2) != '79' && // regime excepcional
    contribuinte.substr(0,1) != '8' && // empresário em nome individual (extinto)
    contribuinte.substr(0,2) != '90' && // condominios e sociedades irregulares
    contribuinte.substr(0,2) != '91' && // condominios e sociedades irregulares
    contribuinte.substr(0,2) != '98' && // não residentes
    contribuinte.substr(0,2) != '99' // sociedades civis

  ) { temErro=1;}
  var check1 = contribuinte.substr(0,1)*9;
  var check2 = contribuinte.substr(1,1)*8;
  var check3 = contribuinte.substr(2,1)*7;
  var check4 = contribuinte.substr(3,1)*6;
  var check5 = contribuinte.substr(4,1)*5;
  var check6 = contribuinte.substr(5,1)*4;
  var check7 = contribuinte.substr(6,1)*3;
  var check8 = contribuinte.substr(7,1)*2;

  var total= check1 + check2 + check3 + check4 + check5 + check6 + check7 + check8;
  var divisao= total / 11;
  var modulo11=total - parseInt(divisao)*11;
  if ( modulo11==1 || modulo11==0){ comparador=0; } // excepção
  else { comparador= 11-modulo11;}


  var ultimoDigito=contribuinte.substr(8,1)*1;
  if ( ultimoDigito != comparador ){ temErro=1;}

  return !temErro;

}