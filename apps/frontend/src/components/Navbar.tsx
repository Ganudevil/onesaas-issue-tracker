'use client';
import React from 'react';
import Image from 'next/image';
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
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const { user, tenantId, role, setTenant, setRole, clearSession } = useAuthStore();
    const { logout, updateRole } = useAuth();

    const getLinkClass = (path: string) => {
        const isActive = pathname === path || (path !== '/issues' && pathname?.startsWith(path));
        return `text-sm font-medium cursor-pointer transition-colors block py-2 ${isActive
            ? 'text-blue-600'
            : 'text-slate-500 hover:text-blue-600'
            }`;
    };

    return (
        <div className="border-b bg-white relative z-50">
            <div className="flex h-16 items-center justify-between px-3 sm:px-4 max-w-7xl mx-auto">
                <div className="flex items-center space-x-4">
                    <div
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => router.push('/issues')}
                    >
                        <Image
                            src="/logo.png"
                            alt="oneSAAS"
                            width={140}
                            height={40}
                            className="h-10 w-auto object-contain"
                            priority
                        />
                    </div>
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center space-x-6 ml-6 flex-1">
                    <select
                        value={tenantId || 'tenant1'}
                        onChange={(e) => {
                            setTenant(e.target.value);
                            router.push('/issues');
                        }}
                        className="text-xs px-2 py-1 bg-slate-100 rounded text-black border border-slate-300 focus:outline-none cursor-pointer hover:border-blue-500 mr-4"
                    >
                        <option value="tenant1">tenant1</option>
                        <option value="tenant2">tenant2</option>
                    </select>

                    <nav className="flex items-center space-x-6">
                        <span className={getLinkClass('/issues')} onClick={() => router.push('/issues')}>All Issues</span>
                        <span className={getLinkClass('/issues/assigned')} onClick={() => router.push('/issues/assigned')}>My Assigned Issues</span>
                    </nav>
                </div>

                {/* Desktop User Actions */}
                <div className="hidden md:flex items-center space-x-4 ml-auto">
                    <div className="flex items-center text-sm text-black">
                        <UserIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="font-medium truncate max-w-[100px] lg:max-w-[200px]">{user?.name || user?.email}</span>
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
                    <NovuInbox />
                    <Button variant="ghost" size="sm" onClick={() => {
                        clearSession();
                        logout();
                    }}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                    </Button>
                </div>

                {/* Mobile Actions */}
                <div className="flex md:hidden items-center gap-2 ml-auto">
                    <NovuInbox />
                    <button
                        className="p-2 text-slate-600"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-slate-100 p-3 sm:p-4 space-y-4 bg-white shadow-lg absolute w-full left-0">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Tenant</label>
                        <select
                            value={tenantId || 'tenant1'}
                            onChange={(e) => {
                                setTenant(e.target.value);
                                router.push('/issues');
                            }}
                            className="w-full text-sm px-3 py-2 bg-slate-100 rounded text-black border border-slate-300 focus:outline-none"
                        >
                            <option value="tenant1">tenant1</option>
                            <option value="tenant2">tenant2</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Navigation</label>
                        <div onClick={() => { setIsMenuOpen(false); router.push('/issues'); }} className={getLinkClass('/issues')}>All Issues</div>
                        <div onClick={() => { setIsMenuOpen(false); router.push('/issues/assigned'); }} className={getLinkClass('/issues/assigned')}>My Assigned Issues</div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-4">
                        <div className="flex items-center text-sm text-black">
                            <UserIcon className="h-4 w-4 mr-2" />
                            <span className="font-medium truncate">{user?.name || user?.email}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Role</label>
                            <select
                                value={role || 'viewer'}
                                onChange={(e) => {
                                    const newRole = e.target.value as any;
                                    setRole(newRole);
                                    updateRole(newRole);
                                }}
                                className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded uppercase border-none focus:outline-none"
                            >
                                <option value="admin">Admin</option>
                                <option value="member">Member</option>
                                <option value="viewer">Viewer</option>
                            </select>
                        </div>

                        <Button variant="ghost" size="sm" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => {
                            clearSession();
                            logout();
                        }}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
