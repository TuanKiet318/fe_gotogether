// src/pages/ItineraryLandingPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ItineraryLanding from "./ItineraryLanding";

/* ================= MOCK DETAIL ================= */
// Lấy phần "data" trong JSON bạn gửi, có bổ sung vài field tùy chọn (coverImage / intro / tags / tips)
const MOCK_ITINERARY_DETAIL = {
    id: "2466a75e-f6b1-4e28-b986-ae9cd40d07eb",
    title: "Quy Nhơn 3 ngày 2 đêm",
    startDate: "2025-10-09",
    endDate: "2025-10-11",
    destinationId: "dest-quynhon",
    destinationName: "Quy Nhơn",
    coverImage:
        "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1600&auto=format&fit=crop",
    intro:
        "Lịch trình 3 ngày 2 đêm khám phá Quy Nhơn: biển xanh, góc sống ảo Kỳ Co – Eo Gió, hải sản tươi sống và những quán cà phê chill ven biển.",
    tags: ["Biển đảo", "Ẩm thực", "Check-in"],
    tips: [
        "Mang kính râm và kem chống nắng.",
        "Đặt cano đi Kỳ Co sớm để chủ động thời gian.",
        "Buổi chiều dạo Surf Bar và ngắm hoàng hôn ở Xuân Diệu."
    ],
    items: [
        {
            id: "6b629f9c-a46f-4cef-8a93-8337b2b9fd16",
            placeId: "place-trungluong",
            placeName: "Bãi Trung Lương",
            placeAddress: "Cát Tiến, Phù Cát, Bình Định",
            placeImage:
                "https://image.vietgoing.com/editor/image_ege1639014624.jpg",
            lat: 14.0167,
            lng: 109.1833,
            dayNumber: 1,
            orderInDay: 1,
            startTime: "09:00:00",
            endTime: "11:00:00",
            description: "",
            estimatedCost: 100000.0,
            transportMode: "WALK"
        },
        {
            id: "c54bc76d-041b-4eb7-aa04-759e75540e2d",
            placeId: "pl-quynhon10",
            placeName: "Nhà hàng Hoàng Thao Seaview",
            placeAddress: "102 Xuân Diệu, Quy Nhơn",
            placeImage:
                "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1d/b4/18/81/b-a-t-i-t-i-nha-hang.jpg?w=1400&h=-1&s=1",
            lat: 13.7715,
            lng: 109.2301,
            dayNumber: 1,
            orderInDay: 2,
            startTime: "12:00:00",
            endTime: "13:30:00",
            description: "",
            estimatedCost: 1000000.0,
            transportMode: "WALK"
        },
        {
            id: "4794571b-3e5d-4652-86b2-a596a9065dd1",
            placeId: "place-chuathienhung",
            placeName: "Chùa Thiên Hưng",
            placeAddress: "An Nhơn, Bình Định",
            placeImage:
                "https://ik.imagekit.io/tvlk/blog/2022/03/chua-thien-hung-binh-dinh-3-1024x683.jpg?tr=q-70,c-at_max,w-500,h-300,dpr-2",
            lat: 13.95,
            lng: 109.0833,
            dayNumber: 1,
            orderInDay: 3,
            startTime: "15:00:00",
            endTime: "16:00:00",
            description: "",
            estimatedCost: 100000.0,
            transportMode: "WALK"
        },
        {
            id: "9c5d8a0c-6d5a-4755-9045-6f6172797f5b",
            placeId: "place-kyco",
            placeName: "Bãi Kỳ Co",
            placeAddress: "Nhơn Lý, Quy Nhơn, Bình Định",
            placeImage:
                "https://statics.vinpearl.com/ky-co-quy-nhon-2_1706683587.jpeg",
            lat: 13.8678,
            lng: 109.2973,
            dayNumber: 2,
            orderInDay: 1,
            startTime: "08:30:00",
            endTime: "11:00:00",
            description: "",
            estimatedCost: 100000.0,
            transportMode: "WALK"
        },
        {
            id: "468be814-737b-4ed0-85de-a8c25f99b0a3",
            placeId: "pl-quynhon09",
            placeName: "Surf Bar Quy Nhơn",
            placeAddress: "Bãi biển Xuân Diệu, Quy Nhơn",
            placeImage:
                "https://mia.vn/media/uploads/blog-du-lich/surf-bar-quy-nhon-6-1680970528.jpg",
            lat: 13.7709,
            lng: 109.2265,
            dayNumber: 2,
            orderInDay: 2,
            startTime: "17:00:00",
            endTime: "18:30:00",
            description: "",
            estimatedCost: 99998.0,
            transportMode: "WALK"
        },
        {
            id: "e9cae935-fb83-4d00-b7d6-0a2b583cec2c",
            placeId: "place-baixep",
            placeName: "Bãi Xép",
            placeAddress: "Ghềnh Ráng, Quy Nhơn, Bình Định",
            placeImage:
                "https://itin-dev.wanderlogstatic.com/freeImage/PTgBqvuqbRoveh44aJttH4WffdZo8qfm",
            lat: 13.7167,
            lng: 109.2,
            dayNumber: 2,
            orderInDay: 3,
            startTime: "13:30:00",
            endTime: "16:00:00",
            description: "",
            estimatedCost: 100000.0,
            transportMode: "WALK"
        },
        {
            id: "739cc726-2495-43a6-8352-8bac910e8770",
            placeId: "place-baixep",
            placeName: "Bãi Xép",
            placeAddress: "Ghềnh Ráng, Quy Nhơn, Bình Định",
            placeImage:
                "https://itin-dev.wanderlogstatic.com/freeImage/PTgBqvuqbRoveh44aJttH4WffdZo8qfm",
            lat: 13.7167,
            lng: 109.2,
            dayNumber: 3,
            orderInDay: 1,
            startTime: "08:00:00",
            endTime: "10:00:00",
            description: "",
            estimatedCost: 100000.0,
            transportMode: "WALK"
        },
        {
            id: "d8acf8a4-4d49-47d5-8c9e-7a104e33575c",
            placeId: "pl-quynhon06",
            placeName: "Ốc Thúy Kiều",
            placeAddress: "5D Tăng Bạt Hổ, Quy Nhơn",
            placeImage:
                "https://quynhonland.com.vn/wp-content/uploads/2019/01/%E1%BB%91c-th%C3%BAy-ki%E1%BB%81u4.jpg",
            lat: 13.7745,
            lng: 109.2232,
            dayNumber: 3,
            orderInDay: 2,
            startTime: "18:30:00",
            endTime: "20:00:00",
            description: "",
            estimatedCost: 800000.0,
            transportMode: "WALK"
        },
        {
            id: "9f501d0b-9a78-40d4-8e92-b509ef8ef8fe",
            placeId: "place-daimo",
            placeName: "Đầm Thị Nại",
            placeAddress: "Quy Nhơn, Bình Định",
            placeImage:
                "https://quynhon.binhdinh.gov.vn/publish/thumbnail/105285/1170x658xdefault/upload/105285/20230906/2d4dda700e5700b0778eb95b8156cd98damthinai01_637027696164871909_74de1.jpg",
            lat: 13.8167,
            lng: 109.2167,
            dayNumber: 3,
            orderInDay: 3,
            startTime: "15:00:00",
            endTime: "16:30:00",
            description: "",
            estimatedCost: 100000.0,
            transportMode: "WALK"
        }
    ]
};

/* ============== PAGE ============== */
export default function ItineraryLandingPage() {
    const { id } = useParams(); // vẫn giữ để đúng route /itineraries/:id/landing
    const [data, setData] = useState(null);

    // Dùng mock thay vì call API
    useEffect(() => {
        // nếu muốn có “đang tải”, có thể fake delay nhẹ
        const t = setTimeout(() => setData(MOCK_ITINERARY_DETAIL), 150);
        return () => clearTimeout(t);
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
            destination: data.destinationName || data.destination?.name || "",
            startDate: data.startDate,
            endDate: data.endDate,
            coverImage: data.coverImage || data.bannerImage || "",
            intro: data.intro || "",
            tags: data.tags || [],
            tips: data.tips || [],
            days
        };
    }, [data]);

    if (!mapped)
        return <div className="p-6 text-gray-600">Đang tải lịch trình…</div>;

    return <ItineraryLanding itinerary={mapped} sourceId={id} />
}
