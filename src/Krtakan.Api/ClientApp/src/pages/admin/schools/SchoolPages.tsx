import { schoolsApi } from '../../../lib/endpoints';
import { NamedFormPage, NamedListPage } from '../shared/NamedResourcePages';
import type { NamedResource } from '../shared/NamedResourcePages';

const schools: NamedResource = {
  prefix: 'schools',
  base: '/admin/schools',
  maxLength: 200,
  api: schoolsApi,
};

export const SchoolListPage = () => <NamedListPage resource={schools} />;
export const SchoolFormPage = () => <NamedFormPage resource={schools} />;
