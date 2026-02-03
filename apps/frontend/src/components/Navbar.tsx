'use client';
import React from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';

import { useAuthStore } from '../store/useAuthStore';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { LogOut, User as UserIcon, Menu, X } from 'lucide-react';
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
            ? 'text-cyan-400'
            : 'text-slate-300 hover:text-cyan-400'
            }`;
    };

    return (
        <div className="border-b border-white/10 bg-[var(--bg-header)] backdrop-blur-md relative z-50">
            <div className="flex h-16 items-center justify-between px-3 sm:px-4 max-w-7xl mx-auto">
                <div className="flex items-center space-x-4">
                    <div
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => router.push('/issues')}
                    >
                        <Image
                            src="/OnesaasLogo.png"
                            alt="oneSAAS"
                            width={180}
                            height={50}
                            className="h-12 w-auto object-contain"
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
                        className="text-xs px-2 py-1 bg-white/10 rounded text-slate-100 border border-white/20 focus:outline-none cursor-pointer hover:border-cyan-500 mr-4"
                    >
                        <option value="tenant1" className="bg-[var(--bg-header)] text-[var(--text-primary)]">tenant1</option>
                        <option value="tenant2" className="bg-[var(--bg-header)] text-[var(--text-primary)]">tenant2</option>
                    </select>

                    <nav className="flex items-center space-x-6">
                        <span className={getLinkClass('/issues')} onClick={() => router.push('/issues')}>All Issues</span>
                        <span className={getLinkClass('/issues/assigned')} onClick={() => router.push('/issues/assigned')}>My Assigned Issues</span>
                    </nav>
                </div>

                {/* Desktop User Actions */}
                <div className="hidden md:flex items-center space-x-4 ml-auto">
                    <div className="flex items-center text-sm text-slate-200">
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
                    <Button variant="ghost" size="sm" className="text-slate-200 hover:bg-white/10 hover:text-white" onClick={() => {
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
                        className="p-2 text-slate-300 hover:text-white"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-white/10 p-3 sm:p-4 space-y-4 bg-[#0f172a]/95 backdrop-blur-lg shadow-lg absolute w-full left-0 z-50">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase">Tenant</label>
                        <select
                            value={tenantId || 'tenant1'}
                            onChange={(e) => {
                                setTenant(e.target.value);
                            }}
                            className="w-full text-sm px-3 py-2 bg-white/10 rounded text-slate-100 border border-white/20 focus:outline-none"
                        >
                            <option value="tenant1" className="bg-[var(--bg-header)] text-[var(--text-primary)]">tenant1</option>
                            <option value="tenant2" className="bg-[var(--bg-header)] text-[var(--text-primary)]">tenant2</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-400 uppercase">Navigation</label>
                        <div onClick={() => { setIsMenuOpen(false); router.push('/issues'); }} className={getLinkClass('/issues')}>All Issues</div>
                        <div onClick={() => { setIsMenuOpen(false); router.push('/issues/assigned'); }} className={getLinkClass('/issues/assigned')}>My Assigned Issues</div>
                    </div>

                    <div className="pt-4 border-t border-white/10 space-y-4">
                        <div className="flex items-center text-sm text-slate-200">
                            <UserIcon className="h-4 w-4 mr-2" />
                            <span className="font-medium truncate">{user?.name || user?.email}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-400 uppercase">Role</label>
                            <select
                                value={role || 'viewer'}
                                onChange={(e) => {
                                    const newRole = e.target.value as any;
                                    setRole(newRole);
                                    updateRole(newRole);
                                }}
                                className="text-xs px-2 py-1 bg-blue-900/50 text-blue-100 rounded uppercase border border-blue-500/30 focus:outline-none"
                            >
                                <option value="admin">Admin</option>
                                <option value="member">Member</option>
                                <option value="viewer">Viewer</option>
                            </select>
                        </div>

                        <Button variant="ghost" size="sm" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => {
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
