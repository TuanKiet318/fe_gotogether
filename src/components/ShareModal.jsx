import React, { useEffect, useMemo, useState } from "react";
import { X, Loader2 } from "lucide-react";
import {
    sendInvite,
    listInvites,
    updateCollaboratorRole,
    removeCollaborator,
} from "../service/tripService";

export default function ShareModal({
    onClose,
    inviteEmail,
    setInviteEmail,
    linkPermission, // chưa dùng
    setLinkPermission, // chưa dùng
    copyPlannerLink, // chưa dùng
    itineraryId,
    onInvited,
}) {
    const [inviteRoleUI, setInviteRoleUI] = useState("Can View");
    const [sending, setSending] = useState(false);
    const [users, setUsers] = useState([]);
    const [loadingInvites, setLoadingInvites] = useState(true);
    const [invitesError, setInvitesError] = useState("");
    const [savingRoleId, setSavingRoleId] = useState(null);
    const [removingId, setRemovingId] = useState(null);

    const isValidEmail = useMemo(() => {
        if (!inviteEmail) return false;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail.trim());
    }, [inviteEmail]);

    const uiToApiRole = (ui) => (ui === "Can Edit" ? "EDITOR" : "VIEWER");
    const apiToUiRole = (api) => (api === "EDITOR" ? "Can Edit" : "Can View");

    // Map từ API -> UI row
    const mapInviteToUI = (inv) => {
        // cố gắng lấy userId từ nhiều field phổ biến
        const userId =
            inv.userId ||
            inv.inviteeId ||
            inv.collaboratorId ||
            inv.targetUserId ||
            inv.id; // fallback (nếu BE yêu cầu collaboratorId riêng, hãy dùng đúng field)

        return {
            id: inv.id || inv.inviteId || `${userId}_${inv.inviteEmail}`,
            userId, // dùng cái này để gọi API cập nhật quyền/xoá
            name: inv.inviteeName || inv.name || inv.inviteEmail,
            email: inv.inviteEmail || inv.email,
            role: apiToUiRole(inv.role),
            status: inv.status, // PENDING | ACCEPTED ...
            isOwner: !!inv.isOwner, // nếu BE có trả
            avatar: inv.inviteeAvatarUrl || inv.avatarUrl,
        };
    };

    const fetchInvites = async () => {
        if (!itineraryId) return;
        try {
            setLoadingInvites(true);
            setInvitesError("");
            const res = await listInvites(itineraryId);
            const list = Array.isArray(res) ? res.map(mapInviteToUI) : [];
            setUsers(list);
        } catch (err) {
            console.error("listInvites error:", err);
            setInvitesError(
                err?.response?.data?.message || "Không tải được danh sách lời mời."
            );
        } finally {
            setLoadingInvites(false);
        }
    };

    useEffect(() => {
        fetchInvites();
    }, [itineraryId]);

    const handleSendInvite = async () => {
        if (!isValidEmail || !itineraryId) return;
        try {
            setSending(true);
            const res = await sendInvite(itineraryId, {
                inviteEmail: inviteEmail.trim(),
                role: uiToApiRole(inviteRoleUI),
            });

            // clear ô nhập
            const email = inviteEmail.trim();
            setInviteEmail("");

            // append nhanh vào UI
            const appended = {
                id: res?.id || res?.inviteId || Math.random().toString(36).slice(2),
                userId: res?.userId || res?.inviteeId || res?.collaboratorId, // có thể undefined cho PENDING
                name: res?.inviteeName || email,
                email,
                role: inviteRoleUI,
                status: res?.status || "PENDING",
                isOwner: false,
            };
            setUsers((prev) => {
                const exists = prev.some((u) => u.email === appended.email);
                return exists ? prev : [...prev, appended];
            });

            onInvited && onInvited(res, appended);
        } catch (err) {
            console.error("sendInvite error:", err);
            alert(
                err?.response?.data?.message ||
                "Gửi lời mời thất bại. Vui lòng thử lại."
            );
        } finally {
            setSending(false);
        }
    };

    const handleChangeRole = async (rowId, userId, newUiRole) => {
        // cập nhật UI ngay
        setUsers((prev) =>
            prev.map((u) => (u.id === rowId ? { ...u, role: newUiRole } : u))
        );

        // gọi API
        try {
            setSavingRoleId(rowId);
            const apiRole = uiToApiRole(newUiRole);

            if (!userId) {
                // nếu BE yêu cầu userId/collaboratorId mà invite đang PENDING chưa có userId
                // thì có thể backend sẽ trả lỗi — thông báo rõ ràng
                console.warn(
                    "No userId/collaboratorId found. Role update may fail for PENDING invite."
                );
            }

            await updateCollaboratorRole(itineraryId, userId, apiRole);
        } catch (err) {
            console.error("updateCollaboratorRole error:", err);
            alert(
                err?.response?.data?.message ||
                "Không thể cập nhật quyền. Sẽ khôi phục lại giá trị cũ."
            );
            // khôi phục lại state (fetch lại list để chắc ăn)
            fetchInvites();
        } finally {
            setSavingRoleId(null);
        }
    };

    const handleRemove = async (rowId, userId) => {
        if (!window.confirm("Xoá người này khỏi chuyến đi?")) return;

        try {
            setRemovingId(rowId);
            if (!userId) {
                // Nếu là invite PENDING chưa có userId -> có thể cần API khác (xoá invite).
                // Ở đây demo xoá collaborator; nếu BE tách 2 API, bạn có thể thay bằng DELETE /invites/{inviteId}
                console.warn(
                    "No userId/collaboratorId — nếu đây là invite PENDING, bạn cần API xoá invite riêng."
                );
            }
            await removeCollaborator(itineraryId, userId);
            setUsers((prev) => prev.filter((u) => u.id !== rowId));
        } catch (err) {
            console.error("removeCollaborator error:", err);
            alert(
                err?.response?.data?.message ||
                "Không thể xoá người này. Vui lòng thử lại."
            );
        } finally {
            setRemovingId(null);
        }
    };

    const statusChip = (status) => {
        if (status === "ACCEPTED")
            return "bg-blue-50 text-blue-700 border border-blue-200";
        if (status === "PENDING")
            return "bg-amber-50 text-amber-700 border border-amber-200";
        return "bg-gray-100 text-gray-600 border border-gray-200";
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
                {/* Header */}
                <div className="relative flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4">
                    <div className="flex gap-6">
                        <button className="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold text-white shadow-sm ring-1 ring-white/20">
                            Share
                        </button>
                        <button className="px-3 py-1 text-sm font-semibold text-white/80 hover:text-white">
                            Publish
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        className="inline-flex items-center rounded-full p-1.5 text-white/90 hover:bg-white/10"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                    <h2 className="mb-4 text-[17px] font-semibold text-gray-900">
                        Share with people
                    </h2>

                    {/* Invite form */}
                    <div className="mb-6 grid grid-cols-1 gap-2 md:grid-cols-[1fr,150px,130px]">
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Invite by email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                className="peer h-[42px] w-full rounded-lg border border-gray-300 bg-white px-3 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                            <span
                                className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full ${inviteEmail
                                        ? isValidEmail
                                            ? "bg-blue-500"
                                            : "bg-red-400"
                                        : "bg-gray-300"
                                    }`}
                            />
                        </div>

                        <select
                            value={inviteRoleUI}
                            onChange={(e) => setInviteRoleUI(e.target.value)}
                            className="h-[42px] rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        >
                            <option>Can View</option>
                            <option>Can Edit</option>
                        </select>

                        <button
                            onClick={handleSendInvite}
                            disabled={!isValidEmail || sending}
                            className={`inline-flex h-[42px] items-center justify-center rounded-lg px-4 text-sm font-semibold text-white shadow-sm transition ${!isValidEmail || sending
                                    ? "bg-blue-300 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                                }`}
                            title={!isValidEmail ? "Nhập email hợp lệ" : ""}
                        >
                            {sending ? (
                                <span className="inline-flex items-center gap-2">
                                    <Loader2 className="animate-spin" size={16} />
                                    Sending...
                                </span>
                            ) : (
                                "Send invite"
                            )}
                        </button>
                    </div>

                    {/* Invites list */}
                    <div className="mb-5 space-y-3">
                        {loadingInvites ? (
                            <div className="flex items-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                                <Loader2 className="animate-spin" size={16} />
                                Đang tải danh sách lời mời...
                            </div>
                        ) : invitesError ? (
                            <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                <span>{invitesError}</span>
                                <button
                                    onClick={fetchInvites}
                                    className="font-semibold underline hover:text-red-800"
                                >
                                    Thử lại
                                </button>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                                Chưa có lời mời nào.
                            </div>
                        ) : (
                            users.map((u) => (
                                <div
                                    key={u.id || u.email}
                                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-sm transition hover:shadow-md hover:border-blue-200"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gradient-to-tr from-blue-100 to-sky-50">
                                            {u.avatar ? (
                                                <img src={u.avatar} alt={u.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-sm font-semibold text-blue-700">
                                                    {(u.name || u.email)?.charAt(0).toUpperCase() || "U"}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{u.name}</div>
                                            <div className="text-xs text-gray-500">{u.email}</div>
                                            {u.status && (
                                                <div className="mt-1 text-[11px]">
                                                    <span className={`rounded px-1.5 py-0.5 ${statusChip(u.status)}`}>
                                                        {u.status}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {u.isOwner ? (
                                            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                                                Owner
                                            </span>
                                        ) : (
                                            <>
                                                <select
                                                    value={u.role}
                                                    onChange={(e) =>
                                                        handleChangeRole(u.id, u.userId, e.target.value)
                                                    }
                                                    disabled={savingRoleId === u.id || removingId === u.id}
                                                    className={`h-[34px] rounded-lg border px-2 text-sm ${savingRoleId === u.id || removingId === u.id
                                                            ? "bg-gray-50 text-gray-500"
                                                            : "bg-white"
                                                        } border-gray-200`}
                                                >
                                                    <option>Can Edit</option>
                                                    <option>Can View</option>
                                                </select>

                                                <button
                                                    onClick={() => handleRemove(u.id, u.userId)}
                                                    disabled={removingId === u.id}
                                                    className={`h-[34px] rounded-lg px-3 text-sm font-medium transition ${removingId === u.id
                                                            ? "bg-gray-200 text-gray-500"
                                                            : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                                        }`}
                                                    title="Remove collaborator"
                                                >
                                                    {removingId === u.id ? (
                                                        <span className="inline-flex items-center gap-2">
                                                            <Loader2 className="animate-spin" size={14} />
                                                            Removing...
                                                        </span>
                                                    ) : (
                                                        "Remove"
                                                    )}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
