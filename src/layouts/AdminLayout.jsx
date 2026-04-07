import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import {
    Tags,
    MapPin,
    LayoutDashboard,
    Menu,
    X,
    LogOut,
    UserCircle
} from "lucide-react";

export default function AdminLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Danh sách các menu điều hướng
    const navItems = [
        { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/admin/tags", label: "Tag Management", icon: Tags },
        { path: "/admin/itineraries", label: "Itineraries", icon: MapPin },
    ];

    return (
        <div className="flex h-screen bg-gray-50/50">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-zinc-900/20 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
                lg:translate-x-0 lg:static lg:block
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
                <div className="flex flex-col h-full">
                    {/* Logo/Brand */}
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
                        <Link to="/admin" className="text-lg font-bold text-zinc-900 tracking-tight">
                            Admin<span className="text-zinc-500">Panel</span>
                        </Link>
                        <button
                            className="lg:hidden text-zinc-400 hover:text-zinc-900"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        <p className="px-2 mb-4 text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                            Menu
                        </p>
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)} // Tự đóng menu trên mobile khi click
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                    ${isActive
                                        ? "bg-zinc-900 text-white"
                                        : "text-zinc-600 hover:bg-gray-100 hover:text-zinc-900"
                                    }
                                `}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* User Profile / Logout (Bottom) */}
                    <div className="p-4 border-t border-gray-100">
                        <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header (Top bar) */}
                <header className="flex items-center justify-between h-16 px-4 sm:px-8 bg-white border-b border-gray-200 lg:justify-end">
                    <button
                        className="p-2 -ml-2 rounded-md text-zinc-500 hover:bg-gray-100 lg:hidden"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-zinc-700 hidden sm:block">
                            Admin User
                        </span>
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center border border-gray-200">
                            <UserCircle className="w-5 h-5 text-zinc-500" />
                        </div>
                    </div>
                </header>

                {/* Page Content (Render các Component con ở đây) */}
                <div className="flex-1 overflow-auto bg-gray-50/30">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}