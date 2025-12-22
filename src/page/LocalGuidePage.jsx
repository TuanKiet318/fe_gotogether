import React, { useEffect, useState } from "react";
import { getMyLocalGuideProfile } from "../service/localGuideService";
import LocalGuideRegisterPage from "./LocalGuideRegisterPage";
import LocalGuideProfile from "./LocalGuideProfile";

export default function LocalGuidePage() {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [status, setStatus] = useState("loading");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getMyLocalGuideProfile();
                console.log("Fetched Local Guide Profile:", res);
                setProfile(res);
                setStatus("registered");
                if (!res) {
                    setStatus("not_registered");
                }
            } catch (error) {
                if (error) {
                    setStatus("not_registered");
                } else {
                    setStatus("error");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return <p className="text-center mt-10">Đang tải...</p>;

    if (status === "registered")
        return <LocalGuideProfile profile={profile} />;

    if (status === "not_registered")
        return <LocalGuideRegisterPage />;

    return <p className="text-center text-red-500">Có lỗi xảy ra.</p>;
}
