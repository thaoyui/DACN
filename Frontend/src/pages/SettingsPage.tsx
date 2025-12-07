import React from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';

export const SettingsPage: React.FC = () => {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <SettingsIcon className="h-5 w-5 mr-2 text-gray-500" />
                    General Configuration
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">API Endpoint</label>
                        <input
                            type="text"
                            defaultValue="http://localhost:3001"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Scan Timeout (seconds)</label>
                        <input
                            type="number"
                            defaultValue="300"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                        <input type="checkbox" id="auto-download" className="rounded text-blue-600 focus:ring-blue-500" defaultChecked />
                        <label htmlFor="auto-download" className="text-sm text-gray-700">Automatically download reports after generation</label>
                    </div>

                    <div className="pt-4">
                        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
