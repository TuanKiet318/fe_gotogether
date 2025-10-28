import React, { useEffect, useMemo, useState } from "react";
import { X, Globe, Loader2 } from "lucide-react";
import { sendInvite, listInvites } from "../service/tripService";
import CreateTourModal from "./CreateTourModal";

export default function ShareModal({
  onClose,
  inviteEmail,
  setInviteEmail,
  linkPermission,
  setLinkPermission,
  copyPlannerLink,
  itineraryId,
  onInvited,
  itineraryData, // Thêm prop này để truyền dữ liệu lịch trình
}) {
  const [activeTab, setActiveTab] = useState("share");
  const [inviteRoleUI, setInviteRoleUI] = useState("Can View");
  const [sending, setSending] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [invitesError, setInvitesError] = useState("");
  const [showCreateTourModal, setShowCreateTourModal] = useState(false);

  const isValidEmail = useMemo(() => {
    if (!inviteEmail) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail.trim());
  }, [inviteEmail]);

  const apiRole = useMemo(
    () => (inviteRoleUI === "Can Edit" ? "EDITOR" : "VIEWER"),
    [inviteRoleUI]
  );

  const uiRoleFromApi = (role) => (role === "EDITOR" ? "Can Edit" : "Can View");

  const mapInviteToUI = (inv) => ({
    id: inv.id || inv.inviteId,
    name: inv.inviteeName || inv.inviteEmail,
    email: inv.inviteEmail,
    role: uiRoleFromApi(inv.role),
    status: inv.status,
    isOwner: false,
    avatar: inv.inviteeAvatarUrl,
  });

  const fetchInvites = async () => {
    if (!itineraryId) return;
    try {
      setLoadingInvites(true);
      setInvitesError("");
      const res = await listInvites(itineraryId);
      const mapped = Array.isArray(res) ? res.map(mapInviteToUI) : [];
      setUsers(mapped);
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
        role: apiRole,
      });
      setInviteEmail("");
      const appended = {
        id: res?.id || res?.inviteId || Math.random().toString(36).slice(2),
        name: res?.inviteeName || inviteEmail.trim(),
        email: inviteEmail.trim(),
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

  const handlePublishClick = () => {
    setShowCreateTourModal(true);
  };

  const handleCloseTourModal = () => {
    setShowCreateTourModal(false);
  };

  const statusChip = (status) => {
    if (status === "ACCEPTED")
      return "bg-blue-50 text-blue-700 border border-blue-200";
    if (status === "PENDING")
      return "bg-amber-50 text-amber-700 border border-amber-200";
    return "bg-gray-100 text-gray-600 border border-gray-200";
  };

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          {/* Header */}
          <div className="relative flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab("share")}
                className={`rounded-full px-3 py-1 text-sm font-semibold shadow-sm ring-1 ${
                  activeTab === "share"
                    ? "bg-white/20 text-white ring-white/20"
                    : "text-white/80 hover:text-white ring-transparent"
                }`}
              >
                Share
              </button>
              <button
                onClick={() => setActiveTab("publish")}
                className={`rounded-full px-3 py-1 text-sm font-semibold shadow-sm ring-1 ${
                  activeTab === "publish"
                    ? "bg-white/20 text-white ring-white/20"
                    : "text-white/80 hover:text-white ring-transparent"
                }`}
              >
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
            {activeTab === "share" ? (
              <>
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
                      className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full ${
                        inviteEmail
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
                    className={`inline-flex h-[42px] items-center justify-center rounded-lg px-4 text-sm font-semibold text-white shadow-sm transition ${
                      !isValidEmail || sending
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
                    users.map((user) => (
                      <div
                        key={user.id || user.email}
                        className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-sm transition hover:shadow-md hover:border-blue-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gradient-to-tr from-blue-100 to-sky-50">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-semibold text-blue-700">
                                {(user.name || user.email)
                                  ?.charAt(0)
                                  .toUpperCase() || "U"}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user.email}
                            </div>
                            {user.status && (
                              <div className="mt-1 text-[11px]">
                                <span
                                  className={`rounded px-1.5 py-0.5 ${statusChip(
                                    user.status
                                  )}`}
                                >
                                  {user.status}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {user.isOwner ? (
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                            Owner
                          </span>
                        ) : (
                          <select
                            value={user.role}
                            disabled
                            className="h-[34px] rounded-lg border border-gray-200 bg-gray-50 px-2 text-sm text-gray-600"
                            title="Đổi quyền sẽ thêm sau"
                          >
                            <option>Can Edit</option>
                            <option>Can View</option>
                          </select>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Publish Tab Content */}
                <div
                  className="relative mb-6 overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 p-8"
                  style={{
                    backgroundColor: "rgba(34, 36, 134, 0.4)",
                    backgroundImage: "url('/imgs/tour.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundBlendMode: "overlay",
                    minHeight: "360px",
                  }}
                ></div>

                <div className="flex items-start gap-4">
                  <Globe
                    className="mt-1 flex-shrink-0 text-gray-600"
                    size={20}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">
                      Publish a version of this file to the marketplace for the
                      public to duplicate and remix.{" "}
                      <a
                        href="#"
                        className="font-medium text-blue-600 hover:underline"
                      >
                        Learn more
                      </a>
                    </p>
                  </div>
                  <button
                    onClick={handlePublishClick}
                    className="flex-shrink-0 rounded-lg bg-red-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-600 transition"
                  >
                    Tạo tour
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Create Tour Modal */}
      <CreateTourModal
        isOpen={showCreateTourModal}
        onClose={handleCloseTourModal}
        itineraryId={itineraryId}
        itineraryData={itineraryData}
      />
    </>
  );
}
