'use client';
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { useAuthStore } from '../store/useAuthStore';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { LogOut, User as UserIcon } from 'lucide-react';
import { NovuInbox } from './NovuInbox';

interface NavbarProps {
    onNavigate?: (page: string) => void;
    currentPage?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ }) => {
    const { user, clearSession, tenantId, setTenant, role, setRole } = useAuthStore();
    const { logout, updateRole } = useAuth();
    const router = useRouter();

    const pathname = usePathname();

    const getLinkClass = (path: string) => {
        const isActive = pathname === path || (path !== '/issues' && pathname?.startsWith(path));
        return `text-sm font-medium cursor-pointer transition-colors ${isActive
            ? 'text-blue-600'
            : 'text-slate-500 hover:text-blue-600'
            }`;
    };

    return (
        <div className="border-b bg-white" style={{ borderBottom: '5px solid red' }}>
            <div className="flex h-16 items-center px-4 max-w-7xl mx-auto">
                <div className="flex items-center space-x-4">
                    <div
                        className="font-bold text-xl text-blue-700 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => router.push('/issues')}
                    >
                        oneSAAS
                    </div>
                    <select
                        value={tenantId || 'tenant1'}
                        onChange={(e) => {
                            setTenant(e.target.value);
                            router.push('/issues');
                        }}
                        className="text-xs px-2 py-1 bg-slate-100 rounded text-black border border-slate-300 focus:outline-none cursor-pointer hover:border-blue-500"
                    >
                        <option value="tenant1">tenant1</option>
                        <option value="tenant2">tenant2</option>
                    </select>
                </div>

                <nav className="flex items-center space-x-6 ml-6 mx-6">
                    <span
                        className={getLinkClass('/issues')}
                        onClick={() => router.push('/issues')}
                    >
                        All Issues
                    </span>
                    <span
                        className={getLinkClass('/issues/assigned')}
                        onClick={() => router.push('/issues/assigned')}
                    >
                        My Assigned Issues
                    </span>
                </nav>

                <div className="ml-auto flex items-center space-x-4">
                    <div className="flex items-center text-sm text-black">
                        <NovuInbox />
                        <UserIcon className="h-4 w-4 mr-2 ml-4" />
                        <span className="font-medium">{user?.name || user?.email}</span>
                        <select
                            value={role || 'viewer'}
                            onChange={(e) => {
                                const newRole = e.target.value as any;
                                setRole(newRole);
                                updateRole(newRole);
                            }}
                            className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded uppercase border-none focus:outline-none cursor-pointer"
                        >
                            <option value="admin">Admin</option>
                            <option value="member">Member</option>
                            <option value="viewer">Viewer</option>
                        </select>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => {
                        clearSession();
                        logout();
                    }}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </div>
        </div>
    );
};
