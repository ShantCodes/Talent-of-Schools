import { useEffect, useState } from "react";
import { usersApi } from "../lib/endpoints";

type AvatarUser = {
    name?: string | null;
    lastName?: string | null;
    fullName?: string | null;
    profilePictureMediaId?: number | null;
    profilePictureUrl?: string | null;
};

export function UserAvatar({ user }: { user: AvatarUser }) {
    const [picture, setPicture] = useState<string | null>(null);

    useEffect(() => {
        let objectUrl: string | null = null;
        let cancelled = false;

        async function loadPicture() {
            if (!user.profilePictureMediaId) return;

            try {
                const blob = await usersApi.getProfilePicture(user.profilePictureMediaId);
                if (cancelled) return;

                objectUrl = URL.createObjectURL(blob);
                setPicture(objectUrl);
            } catch (error) {
                console.error('Failed to load profile picture:', error);
            }
        }

        loadPicture();

        return () => {
            cancelled = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [user.profilePictureMediaId]);
    return (
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-line">
            {picture || user.profilePictureUrl ? (
                <img
                    src={picture || user.profilePictureUrl!}
                    alt={(user.fullName ?? `${user.name ?? ''} ${user.lastName ?? ''}`.trim()) || 'User profile'}
                    className="h-full w-full object-cover"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-primary-soft text-primary text-sm font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                    {user.lastName?.charAt(0).toUpperCase()}
                </div>
            )}
        </div>
    );
}