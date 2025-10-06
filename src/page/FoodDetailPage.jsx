import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  GetFoodDetail,
  GetRestaurantsByFood,
} from "../service/api.admin.service.jsx";

export default function FoodDetail() {
  const { id } = useParams();
  const [food, setFood] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const foodData = await GetFoodDetail(id);
        setFood(foodData);
      } catch (error) {
        console.error("Error fetching food detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const resData = await GetRestaurantsByFood(id);
        setRestaurants(resData.places || []);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      } finally {
        setLoadingRestaurants(false);
      }
    };
    fetchRestaurants();
  }, [id]);

  if (loading) {
    return <p className="text-center text-gray-500 py-10">Đang tải...</p>;
  }

  if (!food) {
    return <p className="text-center text-gray-500 py-10">Không tìm thấy món ăn.</p>;
  }

  return (
    <div className="w-full">
      {/* Hero Image */}
      <div className="relative w-full h-[420px]">
        {food.imageUrl ? (
          <img
            src={food.imageUrl}
            alt={food.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-300"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 text-center text-white">
          <h1 className="text-4xl font-bold mb-2">{food.name}</h1>
          <p className="text-sm opacity-90">Đặc sản Quy Nhơn</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Nội dung mô tả */}
        <div className="mb-12">
          {food.content?.map((block, index) => {
            if (block.type === "paragraph" && block.text) {
              return (
                <p
                  key={index}
                  className="text-justify leading-relaxed text-gray-800 mb-6 text-[17px]"
                >
                  {block.text}
                </p>
              );
            }
            if (block.type === "image" && block.src) {
              return (
                <div key={index} className="my-8 flex flex-col items-center">
                  <img
                    src={block.src}
                    alt={block.alt || ""}
                    className="w-full rounded-xl shadow-md object-cover"
                  />
                  {block.alt && (
                    <p className="text-sm text-gray-500 text-center mt-2 italic">
                      {block.alt}
                    </p>
                  )}
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* Danh sách nhà hàng gợi ý */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Quán ăn đề xuất
          </h2>
          {loadingRestaurants ? (
            <p className="text-gray-500">Đang tải quán ăn...</p>
          ) : restaurants.length === 0 ? (
            <p className="text-gray-500">
              Hiện chưa có thông tin quán ăn cho món này.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((place) => (
                <Link
                  key={place.id}
                  to={`/destination/place/${place.id}`}
                  className="group block bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden"
                >
                  {place.mainImage ? (
                    <img
                      src={place.mainImage}
                      alt={place.name}
                      className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-44 bg-gray-200"></div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                      {place.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {place.address}
                    </p>
                    <div className="text-yellow-500 text-sm mt-2 flex items-center gap-1">
                      <span>⭐</span>{" "}
                      <span>{place.rating || "Chưa có đánh giá"}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
