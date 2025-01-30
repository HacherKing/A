import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  ar: {
    translation: {
      "app.title": "نظام مسح الباركود",
      "app.subtitle": "مسح وتصدير البيانات بسهولة",
      "scanner.title": "ماسح الباركود",
      "scanner.start": "تشغيل الماسح",
      "scanner.stop": "إيقاف الماسح",
      "items.title": "العناصر المسحوبة",
      "items.upload": "رفع ملف",
      "items.clear": "مسح الكل",
      "items.export": "تصدير إلى Excel",
      "items.export.sheets": "تصدير إلى Sheets",
      "items.empty": "لم يتم مسح أي عناصر بعد",
      "items.code": "الكود",
      "items.time": "الوقت",
      "toast.upload.success": "تم رفع الملف بنجاح",
      "toast.upload.success.detail": "تم إضافة {{count}} عنصر من الملف",
      "toast.upload.error": "خطأ في رفع الملف",
      "toast.upload.error.detail": "تأكد من أن الملف بتنسيق Excel صحيح",
      "dialog.password.placeholder": "أدخل كلمة المرور",
      "dialog.password.error": "كلمة المرور غير صحيحة",
      "dialog.cancel": "إلغاء",
      "dialog.confirm": "تأكيد",
      "dialog.title.upload": "تأكيد رفع الملف",
      "dialog.title.clear": "تأكيد مسح البيانات",
      "dialog.title.export": "تأكيد تصدير البيانات"
    }
  },
  tr: {
    translation: {
      "app.title": "Barkod Tarayıcı",
      "app.subtitle": "Verileri kolayca tarayın ve dışa aktarın",
      "scanner.title": "Barkod Tarayıcı",
      "scanner.start": "Tarayıcıyı Başlat",
      "scanner.stop": "Tarayıcıyı Durdur",
      "items.title": "Taranan Öğeler",
      "items.upload": "Dosya Yükle",
      "items.clear": "Tümünü Temizle",
      "items.export": "Excel'e Aktar",
      "items.export.sheets": "Sheets'e Aktar",
      "items.empty": "Henüz öğe taranmadı",
      "items.code": "Kod",
      "items.time": "Zaman",
      "toast.upload.success": "Dosya başarıyla yüklendi",
      "toast.upload.success.detail": "{{count}} öğe dosyadan eklendi",
      "toast.upload.error": "Dosya yükleme hatası",
      "toast.upload.error.detail": "Dosyanın doğru Excel formatında olduğundan emin olun",
      "dialog.password.placeholder": "Şifreyi girin",
      "dialog.password.error": "Yanlış şifre",
      "dialog.cancel": "İptal",
      "dialog.confirm": "Onayla",
      "dialog.title.upload": "Dosya Yüklemeyi Onayla",
      "dialog.title.clear": "Verileri Silmeyi Onayla",
      "dialog.title.export": "Veri Dışa Aktarmayı Onayla"
    }
  },
  fr: {
    translation: {
      "app.title": "Scanner de Code-barres",
      "app.subtitle": "Scannez et exportez facilement les données",
      "scanner.title": "Scanner de Code-barres",
      "scanner.start": "Démarrer le Scanner",
      "scanner.stop": "Arrêter le Scanner",
      "items.title": "Éléments Scannés",
      "items.upload": "Télécharger un Fichier",
      "items.clear": "Tout Effacer",
      "items.export": "Exporter vers Excel",
      "items.export.sheets": "Exporter vers Sheets",
      "items.empty": "Aucun élément scanné",
      "items.code": "Code",
      "items.time": "Temps",
      "toast.upload.success": "Fichier téléchargé avec succès",
      "toast.upload.success.detail": "{{count}} éléments ajoutés depuis le fichier",
      "toast.upload.error": "Erreur de téléchargement",
      "toast.upload.error.detail": "Assurez-vous que le fichier est au bon format Excel",
      "dialog.password.placeholder": "Entrez le mot de passe",
      "dialog.password.error": "Mot de passe incorrect",
      "dialog.cancel": "Annuler",
      "dialog.confirm": "Confirmer",
      "dialog.title.upload": "Confirmer le téléchargement",
      "dialog.title.clear": "Confirmer la suppression",
      "dialog.title.export": "Confirmer l'exportation"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;