// src/components/InviteCollaboratorModal.jsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const ROLES = [
    { value: "VIEWER", label: "Viewer (chỉ xem)" },
    { value: "EDITOR", label: "Editor (chỉnh sửa)" },
];

export default function InviteCollaboratorModal({
    isOpen,
    onClose,
    onAdd, // (collab) => void
}) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("VIEWER");
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setEmail("");
            setRole("VIEWER");
            setError("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const validateEmail = (v) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email.trim()) return setError("Vui lòng nhập email.");
        if (!validateEmail(email)) return setError("Email không hợp lệ.");
        onAdd({ email: email.trim(), role });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                        Mời bạn đồng hành
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Vai trò
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {ROLES.map((r) => (
                                <label
                                    key={r.value}
                                    className={`border-2 rounded-xl px-4 py-3 cursor-pointer flex items-center justify-between ${role === r.value
                                            ? "border-blue-600 bg-blue-50"
                                            : "border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    <span className="text-sm font-medium">{r.label}</span>
                                    <input
                                        type="radio"
                                        name="role"
                                        value={r.value}
                                        checked={role === r.value}
                                        onChange={() => setRole(r.value)}
                                        className="accent-blue-600"
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600">{error}</p>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 hover:bg-gray-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:from-blue-700 hover:to-cyan-700"
                        >
                            Thêm
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
