import React from 'react';
import { Github, Linkedin, Instagram, Twitter } from 'lucide-react';

export const Footer: React.FC = () => {
    return (
        <footer className="w-full bg-slate-900 border-t border-white/10 mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center space-y-6">

                    {/* Follow Us Section */}
                    <div className="flex flex-col items-center space-y-3">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Follow us</h3>
                        <div className="flex space-x-6">
                            <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors transform hover:scale-110">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors transform hover:scale-110">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors transform hover:scale-110">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors transform hover:scale-110">
                                <Github className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    {/* Copyright */}
                    <div className="text-center">
                        <p className="text-xs text-slate-500">
                            &copy; 2026 OneSAAS – All Rights Reserved by <span className="text-slate-400 font-medium">Ganesh Devadiga</span>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};
