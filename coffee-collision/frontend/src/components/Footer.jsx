import { useLang } from '../i18n/LangContext.jsx';

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="footer">
      <a href="mailto:hello@evara.com">hello@evara.com</a>
      <span>© {new Date().getFullYear()} {t('footerRights')}</span>
    </footer>
  );
}
