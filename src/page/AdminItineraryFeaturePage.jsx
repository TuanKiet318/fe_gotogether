import { useEffect, useState } from "react";
import {
    Plus,
    Search,
    X,
    ImagePlus,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { featureItinerary } from "../service/itineraryApi";
import { listTags } from "../service/tagService";

export default function AdminItineraryFeaturePage({ itineraryId }) {
    /* ================= STATE ================= */
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [overview, setOverview] = useState("");
    const [heroFiles, setHeroFiles] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    /* ================= FETCH TAGS ================= */
    useEffect(() => {
        const fetchTags = async () => {
            const res = await listTags({ page: 0, size: 100 });
            setTags(res.items || []);
        };
        fetchTags();
    }, []);

    /* ================= HANDLERS ================= */
    const handleFileChange = (e) => {
        setHeroFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    };

    const removeFile = (index) => {
        setHeroFiles(heroFiles.filter((_, i) => i !== index));
    };

    const toggleTag = (tag) => {
        setSelectedTags((prev) =>
            prev.find((t) => t.id === tag.id)
                ? prev.filter((t) => t.id !== tag.id)
                : [...prev, tag]
        );
    };

    const handleSave = async () => {
        if (!overview.trim()) {
            toast.warning("Overview là bắt buộc");
            return;
        }

        try {
            setLoading(true);
            await featureItinerary(itineraryId, {
                overview,
                tagIds: selectedTags.map((t) => t.id),
                heroImageFiles: heroFiles,
            });
            toast.success("Feature itinerary thành công");
            setShowModal(false);
        } catch {
            toast.error("Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    /* ================= RENDER ================= */
    return (
        <div className="p-4 sm:p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-zinc-900">
                        Feature Itinerary
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        Highlight itinerary with overview, tags & hero images
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-2 bg-zinc-900 text-white h-9 px-4 rounded-md text-sm font-medium shadow-sm hover:bg-zinc-800"
                >
                    <Plus className="w-4 h-4" />
                    Feature
                </button>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        onClick={() => setShowModal(false)}
                        className="absolute inset-0 bg-zinc-900/20 backdrop-blur-[2px]"
                    />

                    <div className="relative bg-white rounded-xl w-full max-w-2xl border shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-5 border-b flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-zinc-900">
                                    Feature Itinerary
                                </h3>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                    Add overview, tags and hero images
                                </p>
                            </div>
                            <button onClick={() => setShowModal(false)}>
                                <X className="w-4 h-4 text-zinc-400 hover:text-zinc-900" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">
                            {/* Overview */}
                            <div>
                                <label className="text-xs font-medium text-zinc-700">
                                    Overview
                                </label>
                                <textarea
                                    rows={4}
                                    value={overview}
                                    onChange={(e) => setOverview(e.target.value)}
                                    placeholder="Describe the itinerary..."
                                    className="mt-1 w-full border rounded-md p-3 text-sm focus:ring-2 focus:ring-zinc-200"
                                />
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="text-xs font-medium text-zinc-700">
                                    Tags
                                </label>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {tags.map((tag) => {
                                        const active = selectedTags.some((t) => t.id === tag.id);
                                        return (
                                            <button
                                                key={tag.id}
                                                onClick={() => toggleTag(tag)}
                                                className={`px-3 py-1 text-xs rounded-md border transition
                          ${active
                                                        ? "bg-zinc-900 text-white border-zinc-900"
                                                        : "bg-white text-zinc-700 border-gray-200 hover:bg-gray-50"
                                                    }`}
                                            >
                                                {tag.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Hero Images */}
                            <div>
                                <label className="text-xs font-medium text-zinc-700">
                                    Hero Images
                                </label>
                                <div className="mt-2 space-y-3">
                                    <label className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-50 text-sm">
                                        <ImagePlus className="w-4 h-4" />
                                        Upload images
                                        <input
                                            type="file"
                                            multiple
                                            hidden
                                            onChange={handleFileChange}
                                        />
                                    </label>

                                    <div className="grid grid-cols-3 gap-3">
                                        {heroFiles.map((file, i) => (
                                            <div
                                                key={i}
                                                className="relative border rounded-md p-2 text-xs"
                                            >
                                                <span className="truncate block">
                                                    {file.name}
                                                </span>
                                                <button
                                                    onClick={() => removeFile(i)}
                                                    className="absolute top-1 right-1 text-red-500"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-2">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-3 py-2 text-sm text-zinc-600 hover:bg-gray-100 rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={loading}
                                onClick={handleSave}
                                className="px-4 py-2 text-sm text-white bg-zinc-900 hover:bg-zinc-800 rounded-md"
                            >
                                {loading ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
