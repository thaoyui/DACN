import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Scan, FileText, Settings, Shield } from 'lucide-react';

export const MainLayout: React.FC = () => {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 fixed h-full z-10">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                        <Shield className="h-8 w-8 text-blue-600" />
                        <span className="text-xl font-bold text-gray-900">KubeCheck</span>
                    </div>
                </div>
                <nav className="p-4 space-y-1">
                    <Link
                        to="/"
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <LayoutDashboard className="h-5 w-5" />
                        <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link
                        to="/scan"
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/scan') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <Scan className="h-5 w-5" />
                        <span className="font-medium">Scan & Fix</span>
                    </Link>
                    <Link
                        to="/reports"
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/reports') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <FileText className="h-5 w-5" />
                        <span className="font-medium">Reports</span>
                    </Link>
                    <Link
                        to="/settings"
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/settings') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <Settings className="h-5 w-5" />
                        <span className="font-medium">Settings</span>
                    </Link>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-64">
                <Outlet />
            </div>
        </div>
    );
};
