import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useComplaints } from "@/context/ComplaintContext";
import { useNotifications } from "@/context/NotificationContext";
import { useLanguage } from "@/context/LanguageContext";
import Navigation from "@/components/Navigation";
import AdminSchemeManager from "@/components/AdminSchemeManager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Users,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Bell,
  Building2,
  Shield,
  Activity,
  Eye,
  Edit,
  Trash2,
  Sparkles,
  Globe,
  Star,
} from "lucide-react";

const DashboardEnhanced = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const { complaints, getComplaintStats } = useComplaints();
  const { notifications, unreadCount } = useNotifications();
  const [activeTab, setActiveTab] = useState("overview");

  const isAdmin = user?.role === "admin";
  const stats = getComplaintStats();

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "complaints", label: "Complaints", icon: FileText },
    { id: "schemes", label: "Schemes", icon: Sparkles },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "users", label: "Users", icon: Users },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  const overviewStats = [
    {
      title: "Total Complaints",
      value: stats.total.toString(),
      change: "+5.2%",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Resolved",
      value: stats.resolved.toString(),
      change: "+8.1%",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "In Progress",
      value: stats.inProgress.toString(),
      change: "-2.3%",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Users",
      value: "2,847",
      change: "+12.3%",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const OverviewPanel = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p
                    className={`text-sm flex items-center gap-1 mt-1 ${
                      stat.change.startsWith("+")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    {stat.change}
                  </p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Complaints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complaints.slice(0, 5).map((complaint) => (
                <div
                  key={complaint.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{complaint.title}</p>
                    <p className="text-xs text-gray-600">
                      {complaint.id} • {complaint.category}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      complaint.status === "resolved"
                        ? "border-green-200 text-green-700"
                        : complaint.status === "in-progress"
                          ? "border-blue-200 text-blue-700"
                          : "border-yellow-200 text-yellow-700"
                    }
                  >
                    {complaint.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-xs text-gray-600 truncate">
                      {notification.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const ComplaintsPanel = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Complaints Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complaints.slice(0, 10).map((complaint) => (
              <div
                key={complaint.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-sm text-blue-600 font-medium">
                      {complaint.id}
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        complaint.priority === "high"
                          ? "border-red-200 text-red-700"
                          : complaint.priority === "medium"
                            ? "border-yellow-200 text-yellow-700"
                            : "border-green-200 text-green-700"
                      }
                    >
                      {complaint.priority}
                    </Badge>
                    <Badge
                      className={
                        complaint.status === "resolved"
                          ? "bg-green-100 text-green-800"
                          : complaint.status === "in-progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {complaint.status}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {complaint.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {complaint.name} • {complaint.category} •{" "}
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm">
                    <Edit className="w-4 h-4 mr-1" />
                    Action
                  </Button>
                  {isAdmin && (
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const AnalyticsPanel = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resolution Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">94%</div>
              <p className="text-sm text-gray-600">
                Average resolution rate this month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Avg Resolution Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">3.2</div>
              <p className="text-sm text-gray-600">Days on average</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <div className="text-4xl font-bold text-yellow-600">4.8</div>
                <Star className="w-6 h-6 text-yellow-500 fill-current" />
              </div>
              <p className="text-sm text-gray-600">Average rating</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { category: "Roads", count: 156, color: "bg-blue-500" },
              { category: "Water", count: 89, color: "bg-green-500" },
              { category: "Sanitation", count: 67, color: "bg-yellow-500" },
              { category: "Electricity", count: 45, color: "bg-red-500" },
              { category: "Street Lights", count: 23, color: "bg-purple-500" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-16 text-sm font-medium">{item.category}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`${item.color} h-2 rounded-full`}
                    style={{ width: `${(item.count / 156) * 100}%` }}
                  />
                </div>
                <div className="w-12 text-sm text-gray-600">{item.count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const UsersPanel = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                name: "Admin User",
                email: "admin@tgcivic.gov.in",
                role: "admin",
                status: "active",
              },
              {
                name: "Rajesh Kumar",
                email: "rajesh@email.com",
                role: "citizen",
                status: "active",
              },
              {
                name: "GHMC Officer",
                email: "officer@ghmc.gov.in",
                role: "official",
                status: "active",
              },
            ].map((user, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={
                      user.role === "admin"
                        ? "border-red-200 text-red-700"
                        : user.role === "official"
                          ? "border-green-200 text-green-700"
                          : "border-blue-200 text-blue-700"
                    }
                  >
                    {user.role}
                  </Badge>
                  <Badge className="bg-green-100 text-green-800">
                    {user.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const NotificationsPanel = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Notifications
            <Badge variant="secondary">{unreadCount} unread</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.slice(0, 10).map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${
                  notification.read
                    ? "bg-gray-50 border-gray-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isAdmin ? "Admin Dashboard" : "Official Dashboard"}
            </h1>
            <p className="text-gray-600">
              {isAdmin
                ? "Complete platform management and oversight"
                : "Manage assigned complaints and tasks"}
            </p>
          </div>
          {isAdmin && (
            <Badge variant="destructive" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Administrator Access
            </Badge>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2"
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            <OverviewPanel />
          </TabsContent>

          <TabsContent value="complaints">
            <ComplaintsPanel />
          </TabsContent>

          <TabsContent value="schemes">
            <AdminSchemeManager />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsPanel />
          </TabsContent>

          <TabsContent value="users">
            <UsersPanel />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardEnhanced;
