import en from '@/messages/en.json';
import de from '@/messages/de.json';
import type {Locale} from '@/lib/domain/types';
export type MessageKey=keyof typeof en;
export function translate(locale:Locale,key:MessageKey):string{return (locale==='de'?de:en)[key];}
export function dynamicKey(key:string):MessageKey{if(!(key in en))throw new Error('MISSING_TRANSLATION:'+key);return key as MessageKey;}
