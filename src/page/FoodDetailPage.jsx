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

  // Lấy chi tiết món ăn
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

  // Lấy danh sách quán ăn có món này
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
    return <p className="text-center text-gray-500">Đang tải...</p>;
  }

  if (!food) {
    return <p className="text-center text-gray-500">Không tìm thấy món ăn.</p>;
  }

  return (
    <div className="py-8 px-4 max-w-5xl mx-auto">
      {/* Ảnh chính full width */}
      {food.imageUrl && (
        <img
          src={food.imageUrl}
          alt={food.name}
          className="w-full h-[400px] object-cover shadow-lg mb-8"
        />
      )}

      {/* Tiêu đề */}
      <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
        {food.name}
      </h1>
      <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-red-500 rounded-full mb-10"></div>

      {/* Nội dung chi tiết */}
      <div className="prose max-w-none mb-12">
        {food.content?.map((block, index) => {
          if (block.type === "paragraph") {
            return (
              <p
                key={index}
                className="text-justify leading-relaxed text-gray-700 mb-6"
              >
                {block.text}
              </p>
            );
          }
          if (block.type === "image") {
            return (
              <div key={index} className="my-8">
                <img
                  src={block.src}
                  alt={block.alt || ""}
                  className="w-full shadow-md object-cover rounded-xl"
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

      {/* Danh sách quán ăn có món này */}
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
              <div
                key={place.id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
              >
                <Link
                  key={place.id}
                  to={`/destination/place/${place.id}`}
                  className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden block"
                >
                  {place.mainImage && (
                    <img
                      src={place.mainImage}
                      alt={place.name}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                      {place.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {place.address}
                    </p>
                    <p className="text-yellow-500 text-sm mt-2">
                      ⭐ {place.rating || "Chưa có đánh giá"}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
