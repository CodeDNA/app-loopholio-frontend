const formatK = (num: number) => (num >= 1000 ? num / 1000 + "K" : num);

// ** TEXT LENGTH CONSTRAINTS **
const MIN_TEXT_LENGTH = 100;
const MAX_TEXT_LENGTH = 50000;
const MAX_TEXT_LENGTH_ERROR = `[ ERROR: Max allowed text length: ${formatK(MAX_TEXT_LENGTH)} characters ]`;

// ** UPLOADED FILE SIZE CONSTRAINTS **
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const FILE_SIZE_ERROR_MESSAGE = `[ ERROR: Max file size exceeded! File must be smaller than ${MAX_FILE_SIZE_MB} Mb ]`;
const FILE_SIZE_INSTRUCTION = `Max file size: ${MAX_FILE_SIZE_MB} MB | Text length: Min - ${MIN_TEXT_LENGTH}, Max - ${formatK(MAX_TEXT_LENGTH)}`;

export {
  MAX_FILE_SIZE_MB,
  MIN_TEXT_LENGTH,
  MAX_TEXT_LENGTH,
  MAX_FILE_SIZE_BYTES,
  FILE_SIZE_INSTRUCTION,
  FILE_SIZE_ERROR_MESSAGE,
  MAX_TEXT_LENGTH_ERROR,
  formatK,
};
