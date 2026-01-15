import { useEffect, useState } from "react";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    X,
    List,
    Grid,
} from "lucide-react";
import {
    listTags,
    createTag,
    updateTag,
    deleteTag,
} from "../service/tagService";
import { toast } from "sonner";

export default function AdminTagPage() {
    // ================= STATE =================
    const [tags, setTags] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [pageInfo, setPageInfo] = useState({
        pageNumber: 0,
        totalPages: 1,
    });
    const [loading, setLoading] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editingTag, setEditingTag] = useState(null);

    const [form, setForm] = useState({
        code: "",
        name: "",
        description: "",
    });

    // ================= FETCH =================
    const fetchTags = async () => {
        try {
            setLoading(true);
            const res = await listTags({ page, size, keyword });

            setTags(res.items || []);
            setPageInfo({
                pageNumber: res.pageNumber,
                totalPages: res.totalPages,
            });
        } catch (e) {
            toast.error("Không tải được danh sách tag");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTags();
    }, [page, keyword]);

    // ================= MODAL =================
    const openCreate = () => {
        setEditingTag(null);
        setForm({ code: "", name: "", description: "" });
        setShowModal(true);
    };

    const openEdit = (tag) => {
        setEditingTag(tag);
        setForm({
            code: tag.code,
            name: tag.name,
            description: tag.description || "",
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const handleSave = async () => {
        if (!form.code.trim() || !form.name.trim()) {
            toast.warning("Code và Name là bắt buộc");
            return;
        }

        try {
            if (editingTag) {
                await updateTag(editingTag.id, {
                    name: form.name,
                    description: form.description,
                });
                toast.success("Cập nhật tag thành công");
            } else {
                await createTag(form);
                toast.success("Tạo tag mới thành công");
            }
            setShowModal(false);
            fetchTags();
        } catch {
            toast.error("Có lỗi xảy ra");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Xóa tag này?")) return;
        try {
            await deleteTag(id);
            toast.success("Đã xóa tag");
            fetchTags();
        } catch {
            toast.error("Không thể xóa tag");
        }
    };

    // ================= RENDER =================
    return (
        <div className="p-4 sm:p-8 space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Tag Management</h1>
                    <p className="text-sm text-zinc-500 mt-1">Manage tags for schedules & content organization.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium h-9 px-4 rounded-md shadow-sm transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    New Tag
                </button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-600 transition-colors" />
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => {
                            setKeyword(e.target.value);
                            setPage(0);
                        }}
                        placeholder="Search tags..."
                        className="w-full h-10 pl-9 pr-4 text-sm bg-white border border-gray-200 rounded-md text-zinc-900 placeholder:text-zinc-400 transition-all hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-zinc-200"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">View:</span>
                    <button className="p-1.5 text-zinc-900 bg-white border border-gray-200 rounded-md shadow-sm">
                        <List className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-zinc-400 hover:text-zinc-900 transition-colors">
                        <Grid className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-[0px_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="py-3 px-6 font-medium text-zinc-500 w-[15%]">Code</th>
                                <th className="py-3 px-6 font-medium text-zinc-500 w-[25%]">Name</th>
                                <th className="py-3 px-6 font-medium text-zinc-500 w-[45%]">Description</th>
                                <th className="py-3 px-6 font-medium text-zinc-500 w-[15%] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-zinc-400">
                                        Loading...
                                    </td>
                                </tr>
                            ) : tags.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-zinc-400">
                                        No tags found
                                    </td>
                                </tr>
                            ) : (
                                tags.map((tag) => (
                                    <tr key={tag.id} className="group hover:bg-gray-50/60 transition-colors">
                                        <td className="py-3 px-6 align-middle">
                                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-zinc-100 text-zinc-700 text-xs font-medium border border-zinc-200 font-mono">
                                                {tag.code}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6 align-middle font-medium text-zinc-900">{tag.name}</td>
                                        <td className="py-3 px-6 align-middle text-zinc-500 truncate max-w-xs">
                                            {tag.description || "-"}
                                        </td>
                                        <td className="py-3 px-6 align-middle text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEdit(tag)}
                                                    className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-gray-100 rounded-md transition-colors"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(tag.id)}
                                                    className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                    <span className="text-xs text-zinc-500 font-medium">
                        Page {pageInfo.pageNumber + 1} of {pageInfo.totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={page === 0}
                            onClick={() => setPage((p) => p - 1)}
                            className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 bg-white text-zinc-600 hover:bg-gray-50 hover:text-zinc-900 transition-colors shadow-sm disabled:text-zinc-300 disabled:cursor-not-allowed disabled:hover:bg-white"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            disabled={page + 1 >= pageInfo.totalPages}
                            onClick={() => setPage((p) => p + 1)}
                            className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 bg-white text-zinc-600 hover:bg-gray-50 hover:text-zinc-900 transition-colors shadow-sm disabled:text-zinc-300 disabled:cursor-not-allowed disabled:hover:bg-white"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal Backdrop & Content */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <div
                        onClick={closeModal}
                        className="absolute inset-0 bg-zinc-900/20 backdrop-blur-[2px] transition-opacity"
                    ></div>

                    {/* Modal Card */}
                    <div className="relative bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full max-w-[440px] border border-gray-100 overflow-hidden flex flex-col">

                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
                            <div>
                                <h3 className="text-base font-semibold text-zinc-900 tracking-tight">
                                    {editingTag ? "Update Tag" : "Create Tag"}
                                </h3>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                    {editingTag ? "Edit tag information below." : "Add a new tag to categorize your content."}
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="text-zinc-400 hover:text-zinc-900 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4 bg-white">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-700">Code</label>
                                <input
                                    type="text"
                                    disabled={!!editingTag}
                                    value={form.code}
                                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                                    placeholder="e.g. foodie"
                                    className="w-full h-9 px-3 text-sm bg-white border border-gray-200 rounded-md text-zinc-900 placeholder:text-zinc-400 transition-all focus:outline-none focus:ring-2 focus:ring-zinc-200 disabled:bg-gray-50 disabled:text-zinc-400"
                                />
                                <p className="text-[10px] text-zinc-400">Unique identifier for system usage.</p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-700">Name</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g. Culinary"
                                    className="w-full h-9 px-3 text-sm bg-white border border-gray-200 rounded-md text-zinc-900 placeholder:text-zinc-400 transition-all focus:outline-none focus:ring-2 focus:ring-zinc-200"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-700">
                                    Description <span className="text-zinc-400 font-normal">(Optional)</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Describe the purpose of this tag..."
                                    className="w-full p-3 text-sm bg-white border border-gray-200 rounded-md text-zinc-900 placeholder:text-zinc-400 transition-all focus:outline-none focus:ring-2 focus:ring-zinc-200 resize-none"
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-2">
                            <button
                                onClick={closeModal}
                                className="px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-gray-100 rounded-md transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md shadow-sm transition-all active:scale-95 flex items-center gap-2"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}