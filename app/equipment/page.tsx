'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Package, 
  Wrench, 
  Calendar, 
  QrCode, 
  BarChart3,
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clock
} from 'lucide-react';

const EquipmentPage: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Studio</span>
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Equipment Management</h1>
                <p className="text-sm text-gray-600">Tier 3 - Laboratory Equipment Tracking</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-purple-600">Tier 3</Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Equipment Management System
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive laboratory equipment tracking, maintenance scheduling, and inventory management with QR code integration and real-time analytics.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Available Equipment</p>
                <p className="text-2xl font-bold">127</p>
              </div>
              <CheckCircle className="h-8 w-8" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">In Maintenance</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <Wrench className="h-8 w-8" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Reserved Today</p>
                <p className="text-2xl font-bold">23</p>
              </div>
              <Calendar className="h-8 w-8" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-r from-red-500 to-red-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100">Overdue Maintenance</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <AlertTriangle className="h-8 w-8" />
            </div>
          </Card>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Inventory Management */}
          <Card className="p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-purple-600 text-white">Core Module</Badge>
              </div>
              <CardTitle className="text-2xl">Inventory Management</CardTitle>
              <CardDescription className="text-gray-600">
                Real-time tracking of all laboratory equipment with QR code integration and location management.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600 mb-6">
                <li className="flex items-center">
                  <QrCode className="h-4 w-4 text-purple-600 mr-3" />
                  QR Code Equipment Tracking
                </li>
                <li className="flex items-center">
                  <Package className="h-4 w-4 text-purple-600 mr-3" />
                  Real-time Inventory Status
                </li>
                <li className="flex items-center">
                  <Shield className="h-4 w-4 text-purple-600 mr-3" />
                  Equipment Location Mapping
                </li>
                <li className="flex items-center">
                  <BarChart3 className="h-4 w-4 text-purple-600 mr-3" />
                  Usage Analytics
                </li>
              </ul>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={() => router.push('/equipment/inventory')}
              >
                Manage Inventory
              </Button>
            </CardContent>
          </Card>

          {/* Maintenance System */}
          <Card className="p-6 border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                  <Wrench className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-orange-600 text-white">Automated</Badge>
              </div>
              <CardTitle className="text-2xl">Maintenance Scheduling</CardTitle>
              <CardDescription className="text-gray-600">
                Automated maintenance alerts, scheduling, and comprehensive service record tracking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600 mb-6">
                <li className="flex items-center">
                  <Calendar className="h-4 w-4 text-orange-600 mr-3" />
                  Automated Scheduling
                </li>
                <li className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mr-3" />
                  Proactive Alerts
                </li>
                <li className="flex items-center">
                  <Wrench className="h-4 w-4 text-orange-600 mr-3" />
                  Service Record Tracking
                </li>
                <li className="flex items-center">
                  <Clock className="h-4 w-4 text-orange-600 mr-3" />
                  Preventive Maintenance
                </li>
              </ul>
              <Button 
                className="w-full bg-orange-600 hover:bg-orange-700"
                onClick={() => router.push('/equipment/maintenance')}
              >
                Schedule Maintenance
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-white hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mb-3">
                <Package className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-lg">Consumables Management</CardTitle>
              <CardDescription>
                Track and manage consumable supplies and materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/equipment/consumables')}
              >
                Manage Consumables
              </Button>
            </CardContent>
          </Card>

          <Card className="p-6 bg-white hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mb-3">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-lg">Equipment Reservations</CardTitle>
              <CardDescription>
                Book and schedule equipment for training sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/equipment/reservations')}
              >
                Make Reservations
              </Button>
            </CardContent>
          </Card>

          <Card className="p-6 bg-white hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center mb-3">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-lg">Analytics & Reports</CardTitle>
              <CardDescription>
                Equipment usage analytics and performance reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/equipment/analytics')}
              >
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Integration Note */}
        <div className="mt-12 p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Integrated Training Experience
            </h3>
            <p className="text-gray-600">
              Equipment usage is automatically tracked when used in Skills Management (Tier 1) and Clinical Practice (Tier 2) modules, providing comprehensive training analytics and resource optimization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentPage;