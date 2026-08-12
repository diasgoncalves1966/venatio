'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  isAdminGroup,
  type AuthUser,
  type CategoryRef,
  type GroupRef,
} from '@venatio/shared';
import { ApiError, api } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';

type Tab = 'users' | 'groups' | 'categories';

export function AdminPanel() {
  const router = useRouter();
  const { user, token, ready } = useAuth();
  const [tab, setTab] = useState<Tab>('users');
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [groups, setGroups] = useState<GroupRef[]>([]);
  const [categories, setCategories] = useState<CategoryRef[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    displayName: '',
    groupId: '',
  });
  const [groupForm, setGroupForm] = useState({ name: '', slug: '' });
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '' });
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [passwordPendingId, setPasswordPendingId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [nextUsers, nextGroups, nextCategories] = await Promise.all([
        api.listAdminUsers(token),
        api.listAdminGroups(token),
        api.listAdminCategories(token),
      ]);
      setUsers(nextUsers);
      setGroups(nextGroups);
      setCategories(nextCategories);
      setUserForm((current) => ({
        ...current,
        groupId: current.groupId || nextGroups.find((g) => g.slug === 'general')?.id || '',
      }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar administração');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!ready) return;
    if (!user || !token) {
      router.replace('/login');
      return;
    }
    if (!isAdminGroup(user.group)) {
      router.replace('/anuncios');
      return;
    }
    void loadAll();
  }, [ready, user, token, router, loadAll]);

  async function onCreateUser(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    setPending(true);
    setError(null);
    try {
      await api.createAdminUser(token, userForm);
      setUserForm((current) => ({
        email: '',
        password: '',
        displayName: '',
        groupId: current.groupId,
      }));
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível criar utilizador');
    } finally {
      setPending(false);
    }
  }

  async function onCreateGroup(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    setPending(true);
    setError(null);
    try {
      await api.createAdminGroup(token, {
        name: groupForm.name,
        slug: groupForm.slug || undefined,
      });
      setGroupForm({ name: '', slug: '' });
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível criar grupo');
    } finally {
      setPending(false);
    }
  }

  async function onCreateCategory(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    setPending(true);
    setError(null);
    try {
      await api.createAdminCategory(token, {
        name: categoryForm.name,
        slug: categoryForm.slug || undefined,
      });
      setCategoryForm({ name: '', slug: '' });
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível criar categoria');
    } finally {
      setPending(false);
    }
  }

  if (!ready || !user || !isAdminGroup(user.group)) {
    return <p className="text-sm text-stone-500">A carregar…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Administração</h1>
        <p className="mt-2 text-stone-600">Gerir utilizadores, grupos e categorias.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ['users', 'Utilizadores'],
            ['groups', 'Grupos'],
            ['categories', 'Categorias'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-md px-3 py-1.5 text-sm transition ${
              tab === id
                ? 'bg-[#2f4a3a] text-stone-50'
                : 'bg-white text-stone-700 ring-1 ring-stone-300 hover:bg-stone-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {loading ? <p className="text-sm text-stone-500">A carregar…</p> : null}

      {!loading && tab === 'users' ? (
        <div className="space-y-6">
          <form onSubmit={onCreateUser} className="grid gap-3 sm:grid-cols-2">
            <input
              required
              placeholder="Nome"
              value={userForm.displayName}
              onChange={(e) => setUserForm({ ...userForm, displayName: e.target.value })}
              className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
            />
            <input
              required
              type="password"
              minLength={8}
              placeholder="Password"
              value={userForm.password}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
            />
            <select
              required
              value={userForm.groupId}
              onChange={(e) => setUserForm({ ...userForm, groupId: e.target.value })}
              className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-[#2f4a3a] px-4 py-2 text-sm text-stone-50 disabled:opacity-60 sm:col-span-2"
            >
              Criar utilizador
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead>
                <tr className="border-b border-stone-300 text-stone-500">
                  <th className="py-2 pr-3 font-medium">Nome</th>
                  <th className="py-2 pr-3 font-medium">Email</th>
                  <th className="py-2 pr-3 font-medium">Grupo</th>
                  <th className="py-2 pr-3 font-medium">Password</th>
                  <th className="py-2 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item.id} className="border-b border-stone-200">
                    <td className="py-3 pr-3">
                      <input
                        defaultValue={item.displayName}
                        onBlur={async (e) => {
                          if (!token || e.target.value === item.displayName) return;
                          try {
                            const updated = await api.updateAdminUser(token, item.id, {
                              displayName: e.target.value,
                            });
                            setUsers((current) =>
                              current.map((u) => (u.id === item.id ? updated : u)),
                            );
                          } catch (err) {
                            setError(
                              err instanceof ApiError
                                ? err.message
                                : 'Não foi possível alterar utilizador',
                            );
                          }
                        }}
                        className="w-full rounded-md border border-stone-300 bg-white px-2 py-1.5"
                      />
                    </td>
                    <td className="py-3 pr-3 text-stone-700">{item.email}</td>
                    <td className="py-3 pr-3">
                      <select
                        value={item.group.id}
                        onChange={async (e) => {
                          if (!token) return;
                          try {
                            const updated = await api.updateAdminUser(token, item.id, {
                              groupId: e.target.value,
                            });
                            setUsers((current) =>
                              current.map((u) => (u.id === item.id ? updated : u)),
                            );
                          } catch (err) {
                            setError(
                              err instanceof ApiError
                                ? err.message
                                : 'Não foi possível alterar grupo',
                            );
                          }
                        }}
                        className="rounded-md border border-stone-300 bg-white px-2 py-1.5"
                      >
                        {groups.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 pr-3">
                      <div className="flex min-w-[220px] items-center gap-2">
                        <input
                          type="password"
                          minLength={8}
                          autoComplete="new-password"
                          placeholder="Nova password"
                          value={passwordDrafts[item.id] ?? ''}
                          onChange={(e) =>
                            setPasswordDrafts((current) => ({
                              ...current,
                              [item.id]: e.target.value,
                            }))
                          }
                          className="w-full rounded-md border border-stone-300 bg-white px-2 py-1.5"
                        />
                        <button
                          type="button"
                          disabled={
                            passwordPendingId === item.id ||
                            !(passwordDrafts[item.id]?.length >= 8)
                          }
                          onClick={async () => {
                            if (!token) return;
                            const nextPassword = passwordDrafts[item.id]?.trim() ?? '';
                            if (nextPassword.length < 8) {
                              setError('A password deve ter pelo menos 8 caracteres');
                              return;
                            }
                            setPasswordPendingId(item.id);
                            setError(null);
                            try {
                              await api.updateAdminUser(token, item.id, {
                                password: nextPassword,
                              });
                              setPasswordDrafts((current) => {
                                const next = { ...current };
                                delete next[item.id];
                                return next;
                              });
                            } catch (err) {
                              setError(
                                err instanceof ApiError
                                  ? err.message
                                  : 'Não foi possível alterar a password',
                              );
                            } finally {
                              setPasswordPendingId(null);
                            }
                          }}
                          className="shrink-0 rounded-md border border-stone-300 px-2 py-1.5 text-stone-700 hover:bg-stone-50 disabled:opacity-40"
                        >
                          {passwordPendingId === item.id ? '…' : 'Alterar'}
                        </button>
                      </div>
                    </td>
                    <td className="py-3">
                      <button
                        type="button"
                        disabled={item.id === user.id}
                        onClick={async () => {
                          if (!token) return;
                          if (!window.confirm(`Apagar ${item.displayName}?`)) return;
                          try {
                            await api.deleteAdminUser(token, item.id);
                            setUsers((current) => current.filter((u) => u.id !== item.id));
                          } catch (err) {
                            setError(
                              err instanceof ApiError
                                ? err.message
                                : 'Não foi possível apagar utilizador',
                            );
                          }
                        }}
                        className="rounded-md border border-red-300 px-2 py-1 text-red-700 hover:bg-red-50 disabled:opacity-40"
                      >
                        Apagar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'groups' ? (
        <div className="space-y-6">
          <form onSubmit={onCreateGroup} className="grid gap-3 sm:grid-cols-3">
            <input
              required
              placeholder="Nome"
              value={groupForm.name}
              onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
              className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
            />
            <input
              placeholder="Slug (opcional)"
              value={groupForm.slug}
              onChange={(e) => setGroupForm({ ...groupForm, slug: e.target.value })}
              className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-[#2f4a3a] px-4 py-2 text-sm text-stone-50 disabled:opacity-60"
            >
              Criar grupo
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-stone-300 text-stone-500">
                  <th className="py-2 pr-3 font-medium">Nome</th>
                  <th className="py-2 pr-3 font-medium">Slug</th>
                  <th className="py-2 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <tr key={group.id} className="border-b border-stone-200">
                    <td className="py-3 pr-3">
                      <input
                        defaultValue={group.name}
                        onBlur={async (e) => {
                          if (!token || e.target.value === group.name) return;
                          try {
                            const updated = await api.updateAdminGroup(token, group.id, {
                              name: e.target.value,
                            });
                            setGroups((current) =>
                              current.map((g) => (g.id === group.id ? updated : g)),
                            );
                          } catch (err) {
                            setError(
                              err instanceof ApiError
                                ? err.message
                                : 'Não foi possível alterar grupo',
                            );
                          }
                        }}
                        className="w-full rounded-md border border-stone-300 bg-white px-2 py-1.5"
                      />
                    </td>
                    <td className="py-3 pr-3 text-stone-600">{group.slug}</td>
                    <td className="py-3">
                      <button
                        type="button"
                        disabled={group.slug === 'admin' || group.slug === 'general'}
                        onClick={async () => {
                          if (!token) return;
                          if (!window.confirm(`Apagar grupo ${group.name}?`)) return;
                          try {
                            await api.deleteAdminGroup(token, group.id);
                            setGroups((current) => current.filter((g) => g.id !== group.id));
                          } catch (err) {
                            setError(
                              err instanceof ApiError
                                ? err.message
                                : 'Não foi possível apagar grupo',
                            );
                          }
                        }}
                        className="rounded-md border border-red-300 px-2 py-1 text-red-700 hover:bg-red-50 disabled:opacity-40"
                      >
                        Apagar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'categories' ? (
        <div className="space-y-6">
          <form onSubmit={onCreateCategory} className="grid gap-3 sm:grid-cols-3">
            <input
              required
              placeholder="Nome"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
            />
            <input
              placeholder="Slug (opcional)"
              value={categoryForm.slug}
              onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
              className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-[#2f4a3a] px-4 py-2 text-sm text-stone-50 disabled:opacity-60"
            >
              Criar categoria
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-stone-300 text-stone-500">
                  <th className="py-2 pr-3 font-medium">Nome</th>
                  <th className="py-2 pr-3 font-medium">Slug</th>
                  <th className="py-2 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-b border-stone-200">
                    <td className="py-3 pr-3">
                      <input
                        defaultValue={category.name}
                        onBlur={async (e) => {
                          if (!token || e.target.value === category.name) return;
                          try {
                            const updated = await api.updateAdminCategory(token, category.id, {
                              name: e.target.value,
                            });
                            setCategories((current) =>
                              current.map((c) => (c.id === category.id ? updated : c)),
                            );
                          } catch (err) {
                            setError(
                              err instanceof ApiError
                                ? err.message
                                : 'Não foi possível alterar categoria',
                            );
                          }
                        }}
                        className="w-full rounded-md border border-stone-300 bg-white px-2 py-1.5"
                      />
                    </td>
                    <td className="py-3 pr-3 text-stone-600">{category.slug}</td>
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={async () => {
                          if (!token) return;
                          if (!window.confirm(`Apagar categoria ${category.name}?`)) return;
                          try {
                            await api.deleteAdminCategory(token, category.id);
                            setCategories((current) =>
                              current.filter((c) => c.id !== category.id),
                            );
                          } catch (err) {
                            setError(
                              err instanceof ApiError
                                ? err.message
                                : 'Não foi possível apagar categoria',
                            );
                          }
                        }}
                        className="rounded-md border border-red-300 px-2 py-1 text-red-700 hover:bg-red-50"
                      >
                        Apagar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
