import { Compass } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-12 bg-slate-900">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">GoTogether</span>
          </div>

          <div className="flex items-center gap-8 text-slate-400">
            <a href="#" className="hover:text-white transition-colors">
              Điều khoản
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Chính sách
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Hỗ trợ
            </a>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-500">
          <p>&copy; 2025 GoTogether. Bảo lưu mọi quyền.</p>
        </div>
      </div>
    </footer>
  );
}
