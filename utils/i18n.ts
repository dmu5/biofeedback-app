import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

const translations = {
  en: {
    dashboard: "Dashboard",
    history: "History",
    settings: "Settings",
    ready_to_measure: "Ready to measure your heart rate?",
    last_reading: "Last Reading",
    start_session: "Start Session",
    previous_measurements: "Your previous measurements will appear here.",
    configure_application: "Configure your application here.",
    need_permission: "We need your permission to use the camera",
    grant_permission: "Grant Permission",
    cancel: "Cancel",
    close: "Close",
    status_waiting: "❌ Place your finger firmly over the camera lens and flash.",
    status_calibrating: "⏳ Calibrating signal... Keep your finger still.",
    status_measuring: "❤️ Analyzing pulse...",
    status_motion: "⚠️ Too much movement. Relax your hand.",
    status_done: "✅ Measurement complete!",
    reduce_heart_rate: "Reduce Pulse",
    relax_breathing: "Breathing Exercise",
    breathe_in: "Breathe In",
    hold: "Hold",
    breathe_out: "Breathe Out",
    vibration: "Vibration",
  },
  ru: {
    dashboard: "Главная",
    history: "История",
    settings: "Настройки",
    ready_to_measure: "Готовы измерить пульс?",
    last_reading: "Последний замер",
    start_session: "Начать измерение",
    previous_measurements: "Здесь появится история ваших измерений.",
    configure_application: "Настройки приложения.",
    need_permission: "Нам нужен доступ к камере",
    grant_permission: "Дать разрешение",
    cancel: "Отмена",
    close: "Закрыть",
    status_waiting: "❌ Пожалуйста, плотно прижмите палец к камере.",
    status_calibrating: "⏳ Калибровка сигнала... Держите палец неподвижно.",
    status_measuring: "❤️ Измеряем пульс...",
    status_motion: "⚠️ Слишком много движения. Расслабьте руку.",
    status_done: "✅ Замер завершен!",
    reduce_heart_rate: "Снизить пульс",
    relax_breathing: "Дыхательная гимнастика",
    breathe_in: "Вдох",
    hold: "Задержка",
    breathe_out: "Выдох",
    vibration: "Вибрация",
  }
};

const i18n = new I18n(translations);

// Set the locale once at the beginning of your app.
i18n.locale = getLocales()[0].languageCode ?? 'en';
// Fallback to english if translation is missing
i18n.enableFallback = true;

export default i18n;
