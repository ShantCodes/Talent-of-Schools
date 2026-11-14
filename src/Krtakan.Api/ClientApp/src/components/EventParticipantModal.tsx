
import { useCallback, useEffect, useState } from 'react';
import { Search, UserPlus, X } from 'lucide-react';
import type { User } from '../features/auth/types';
import { eventsApi, participantsApi, usersApi } from '../lib/endpoints';
import { SearchInput } from './SearchInput';
import { errorText } from './ui';


type Props = {
    eventId: number;
    onClose: () => void;
    onSaved: () => void;
};

export function AddEventParticipantModal({
    eventId,
    onClose,
    onSaved,
}: Props) {
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = useCallback((value: string) => {
        setQuery(value);
        setSelectedUser(null);
    }, []);

    useEffect(() => {
        if (!query) {
            setUsers([]);
            return;
        }

        let cancelled = false;

        async function searchUsers() {
            setLoading(true);
            setError('');

            try {
                const result = await usersApi.search(query, 1, 10);
                if (!cancelled) setUsers(result.items);
            } catch (e) {
                if (!cancelled) setError(errorText(e));
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        searchUsers();

        return () => {
            cancelled = true;
        };
    }, [query]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!selectedUser) {
            setError('Please select a user.');
            return;
        }

        const formData = new FormData();
        formData.append('Title', title);
        formData.append('Author', author);
        formData.append('EventId', String(eventId));

        if (file) {
            formData.append('File', file);
        }

        setSaving(true);
        setError('');

        try {
            await participantsApi.adminSignupUser(selectedUser.id, formData);
            onSaved();
        } catch (e) {
            setError(errorText(e));
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900">
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Add event participant</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-fg-subtle hover:text-fg"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Search user
                        </label>

                        <SearchInput
                            onSearch={handleSearch}
                            placeholder="Search by name or email..."
                            className="w-full"
                        />
                    </div>

                    {loading && (
                        <p className="text-sm text-fg-subtle">Searching users...</p>
                    )}

                    {users.length > 0 && !selectedUser && (
                        <div className="max-h-48 overflow-y-auto rounded-lg border border-border">
                            {users.map(user => (
                                <button
                                    key={user.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedUser(user);
                                        setUsers([]);
                                    }}
                                    className="flex w-full flex-col border-b border-border p-3 text-left last:border-0 hover:bg-surface-secondary"
                                >
                                    <span className="text-sm font-medium">{user.fullName}</span>
                                    <span className="text-xs text-fg-subtle">{user.email}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {!loading && query && users.length === 0 && !selectedUser && (
                        <p className="text-sm text-fg-subtle">No users found.</p>
                    )}

                    {selectedUser && (
                        <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary-soft p-3">
                            <div>
                                <div className="text-sm font-medium">
                                    {selectedUser.fullName}
                                </div>
                                <div className="text-xs text-fg-subtle">
                                    {selectedUser.email}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedUser(null)}
                                className="text-fg-subtle hover:text-fg"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    )}

                    <div>
                        <label className="mb-1 block text-sm font-medium">Title</label>
                        <input
                            required
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
                            placeholder="Performance title"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Author</label>
                        <input
                            required
                            value={author}
                            onChange={e => setAuthor(e.target.value)}
                            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
                            placeholder="Author name"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Document (optional)
                        </label>
                        <input
                            type="file"
                            onChange={e => setFile(e.target.files?.[0] ?? null)}
                            className="w-full text-sm"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-danger">{error}</p>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-lg border border-border px-4 py-2 text-sm"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving || !selectedUser || !title.trim() || !author.trim()}
                            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-white disabled:opacity-50"
                        >
                            <UserPlus size={16} />
                            {saving ? 'Adding...' : 'Add participant'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
