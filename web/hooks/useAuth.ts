'use client';

import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';

export const useAuth = () => {
    const { data: session, status } = useSession();
    const loading = status === 'loading';
    const user = session?.user ?? null;

    const signIn = (provider?: string) => {
        nextAuthSignIn(provider);
    };

    const signOut = () => {
        nextAuthSignOut();
    };

    return { user, session, loading, signIn, signOut };
};
