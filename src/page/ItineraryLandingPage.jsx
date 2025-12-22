// src/pages/ItineraryLandingPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ItineraryLanding from "./ItineraryLanding";
import { getFeaturedItineraryDetail }
    from "../service/tripService.js";


/* ============== PAGE ============== */
export default function ItineraryLandingPage() {
    const { id } = useParams(); // vẫn giữ để đúng route /itineraries/:id/landing
    const [data, setData] = useState(null);

    useEffect(() => {
        if (!id) return;

        let isMounted = true;
        setData(null); // để hiện trạng thái loading

        getFeaturedItineraryDetail(id)
            .then((res) => {
                if (!isMounted) return;

                // nếu BE trả thẳng object
                setData(res);

                // nếu BE bọc data: { data: {...} }
                // setData(res.data?.data);
            })
            .catch((err) => {
                console.error("Load itinerary detail failed:", err);
                if (isMounted) setData(null);
            });

        return () => {
            isMounted = false;
        };
    }, [id]);


    // Map về shape mà <ItineraryLanding/> cần
    const mapped = useMemo(() => {
        if (!data) return null;

        // gom theo ngày
        const byDay = new Map();
        (data.items || []).forEach((it) => {
            const d = it.dayNumber || 1;
            if (!byDay.has(d)) byDay.set(d, []);
            const place = it.place || {};
            byDay.get(d).push({
                id: it.id,
                placeName: it.placeName || place.name || "Địa điểm",
                placeAddress: it.placeAddress || place.address || "",
                placeImage: it.placeImage || place.mainImage || "",
                startTime: it.startTime || "",
                endTime: it.endTime || "",
                estimatedCost: it.estimatedCost ?? null,
                lat: it.lat ?? place.lat ?? null,
                lng: it.lng ?? place.lng ?? null,
                description: it.description || "",
                placeRating: place.rating || 0,
                placeReviews: place.reviews || 0,
                orderInDay: it.orderInDay || 0
            });
        });

        const maxDay = Math.max(1, ...Array.from(byDay.keys()));
        const days = Array.from({ length: maxDay }, (_, i) => {
            const dayNum = i + 1;
            const dateISO = data.startDate
                ? new Date(
                    new Date(data.startDate).getTime() + i * 86400000
                )
                    .toISOString()
                    .slice(0, 10)
                : `Day ${dayNum}`;
            return {
                dayNumber: dayNum,
                date: dateISO,
                items: (byDay.get(dayNum) || []).sort(
                    (a, b) => (a.orderInDay || 0) - (b.orderInDay || 0)
                )
            };
        });

        return {
            title: data.title,
            destination: data.destinationName || "",
            startDate: data.startDate,
            endDate: data.endDate,
            coverImage:
                data.coverImage ||
                data.bannerImage ||
                data.heroImages?.[0] ||
                "",
            intro: data.overview || "",
            tags: data.tags || [],
            tips: data.tips || [],
            days
        };

    }, [data]);

    if (!mapped)
        return <div className="p-6 text-gray-600">Đang tải lịch trình…</div>;

    return <ItineraryLanding itinerary={mapped} sourceId={id} />;
}
