import { Helmet } from 'react-helmet-async';
import { useI18n } from '../i18n/I18nContext';

/** Sets the browser tab title as "Page | Brand", or just the brand when no title is given. */
export function PageTitle({ title }: { title?: string }) {
  const { t } = useI18n();
  const brand = t('brand');
  return (
    <Helmet>
      <title>{title ? `${title} | ${brand}` : brand}</title>
    </Helmet>
  );
}
