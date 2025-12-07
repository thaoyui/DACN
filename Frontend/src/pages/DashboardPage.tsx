import React from 'react';
import { CheckCircle2, AlertCircle, ShieldAlert, Activity } from 'lucide-react';

export const DashboardPage: React.FC = () => {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Security Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">Overall Score</h3>
                        <Activity className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900">85%</span>
                        <span className="ml-2 text-sm text-green-600">+5% from last scan</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">Passing Checks</h3>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900">47</span>
                        <span className="ml-2 text-sm text-gray-500">/ 59 checked</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">Critical Failures</h3>
                        <ShieldAlert className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900">2</span>
                        <span className="ml-2 text-sm text-red-600">Needs attention</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">Warnings</h3>
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900">10</span>
                        <span className="ml-2 text-sm text-gray-500">Manual checks</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Full Cluster Scan</p>
                                        <p className="text-xs text-gray-500">2 hours ago</p>
                                    </div>
                                </div>
                                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Completed</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Failing Checks</h3>
                    <div className="space-y-4">
                        <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                            <div className="flex items-start space-x-3">
                                <ShieldAlert className="h-5 w-5 text-red-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-red-900">1.2.5 --kubelet-certificate-authority</p>
                                    <p className="text-xs text-red-700 mt-1">Argument is missing in API server pod spec</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                            <div className="flex items-start space-x-3">
                                <ShieldAlert className="h-5 w-5 text-red-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-red-900">1.2.15 --profiling</p>
                                    <p className="text-xs text-red-700 mt-1">Profiling argument is set to true</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
