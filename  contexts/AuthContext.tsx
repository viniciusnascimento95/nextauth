import { createContext, ReactNode, useEffect, useState } from 'react'
import { destroyCookie, parseCookies, setCookie } from 'nookies'

import Router from 'next/router'
import { api } from '../services/api';

type User = {
    email: string;
    permissions: string[];
    roles: string[];
}

type SignInCredencials = {
    email: string;
    password: string;
}

type AuthContextData = {
    signIn(credentials: SignInCredencials): Promise<void>;
    user: User;
    isAuthenticated: boolean;
};

type AuthProviderProps = {
    children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextData)

export function signOut() {
    destroyCookie(undefined, 'nextauth.token')
    destroyCookie(undefined, 'nextauth.refreshToken')
    Router.push('/')
}

export function AuthProvider({ children }: AuthProviderProps) {

    const [user, setUser] = useState<User>()
    const isAuthenticated = !!user;

    useEffect(() => {
        const { 'nextauth.token': token } = parseCookies()

        if (token) {
            api.get('/me')
                .then(response => {

                    const { email, permissions, roles } = response.data;

                    setUser({ email, permissions, roles })

                })
                .catch(() => {
                    signOut();
                })
        }

    }, [])

    async function signIn({ email, password }: SignInCredencials) {
        try {
            // console.log({email, password});
            const response = await api.post('sessions', { email, password })

            const { token, refreshtoken, permissions, roles } = response.data;

            setCookie(undefined, 'nextauth.token', token, {
                maxAge: 60 * 60 * 24 * 30,
                path: '/'
            })
            setCookie(undefined, 'nextauth.refreshtoken', refreshtoken, {
                maxAge: 60 * 60 * 24 * 30,
                path: '/'
            })

            setUser({ email, permissions, roles })

            api.defaults.headers['Authorization'] = `Bearer ${token}`;

            Router.push('/dashboard')

            console.log(response.data)
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
            {children}
        </AuthContext.Provider>
    )
}