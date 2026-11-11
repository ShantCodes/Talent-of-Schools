import { rolesApi } from '../../../lib/endpoints';
import { Roles } from '../../../context/AuthContext';
import { roleLabel } from '../../../i18n/I18nContext';
import { NamedFormPage, NamedListPage } from '../shared/NamedResourcePages';
import type { NamedResource } from '../shared/NamedResourcePages';

const builtIn: string[] = Object.values(Roles);

const roles: NamedResource = {
  prefix: 'roles',
  base: '/admin/roles',
  maxLength: 50,
  isLocked: role => builtIn.includes(role.name),
  label: role => roleLabel(role.name),
  api: rolesApi,
};

export const RoleListPage = () => <NamedListPage resource={roles} />;
export const RoleFormPage = () => <NamedFormPage resource={roles} />;
