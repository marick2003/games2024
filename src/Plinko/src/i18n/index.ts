import { createI18n } from 'vue-i18n';
import zhCN from './zh-CN.json';
import enUS from './en-US.json';
import queryString from 'query-string';

type MessageSchema = typeof enUS;

let currentLanguage = '';

interface LocationObject {
  lang?: string;
}

const parsed: LocationObject = queryString.parse(location.search) as LocationObject;
const langParam = parsed.lang || localStorage.getItem('locale') || 'zh-CN';

function getFormattedLanguageCode(langCode: string = 'zh-CN'): string {
  const lang = langCode;
  const langPrefix = lang.substring(0, 2).toLowerCase();
  switch (langPrefix) {
    case 'th':
      return 'th-TH';
    case 'vi':
      return 'vi-VN';
    case 'zh':
      return 'zh-CN';
    case 'id':
      return 'id-ID';
    case 'de':
      return 'de-DE';
    case 'hi':
      return 'hi-IN';
    case 'ja':
      return 'ja-JP';
    case 'km':
      return 'km-KH';
    case 'ko':
      return 'ko-KR';
    case 'ms':
      return 'ms-MY';
    case 'ru':
      return 'ru-RU';
    case 'tl':
      return 'tl-PH';
    case 'es':
      return 'es-ES';
    case 'hk': // 注意：这里使用 'hk' 而不是 'zh-HK'
      return 'zh-HK';
    default:
      return 'en-US';
  }
}

let lsLocale = getFormattedLanguageCode(langParam);
if (lsLocale) {
  const index = lsLocale.indexOf('-'); // 获取第一个连字符的位置
  currentLanguage = index !== -1 ? lsLocale.substring(0, index) : lsLocale;
}

document.documentElement.lang = currentLanguage === 'zh' ? 'zh-CN' : 'en-US';

export const i18n = createI18n<MessageSchema, 'zh-CN' | 'en-US'>({
  locale: lsLocale,
  legacy: false, // 修复组件引入 i18n 时 vite 脚手架报错的问题
  globalInjection: true, // 全局注册 $t
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
});

// 语系切换方法
export const switchLanguage = (lang: string) => {
  const formattedLang = getFormattedLanguageCode(lang);
  i18n.global.locale.value = formattedLang;
  localStorage.setItem('locale', formattedLang);
  document.documentElement.lang = formattedLang;
};
