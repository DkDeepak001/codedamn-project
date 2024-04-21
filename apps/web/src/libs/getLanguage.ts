import _ from 'lodash'
import path from 'path';

export const getLanguage = (uri: string) => {
  const extension = _.trimStart(path.extname(uri), '.');
  return convertExtensionToLanguage(extension)
}


const convertExtensionToLanguage = (extension: string): string => {
  switch (extension) {
    case 'js':
    case 'cjs':
    case 'mjs':
    case 'jsx':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    default:
      return extension || "plaintext";
  }
};
