export default function QuickLinkCard({ title, desc, color, href }) {
  const colors = {
    emerald: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20",
    blue: "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20",
    purple: "bg-purple-600 hover:bg-purple-700 shadow-purple-900/20",
  };
  return (
    <div className="group bg-gray-900/40 border border-gray-800 p-8 rounded-[2.5rem] flex flex-col justify-between hover:bg-gray-800/40 transition-all duration-300">
      <div>
        <h3 className="text-2xl font-bold text-white mb-4 group-hover:translate-x-1 transition-transform">
          {title}
        </h3>
        <p className="text-gray-400 leading-relaxed text-sm mb-8">{desc}</p>
      </div>
      <a
        href={href}
        className={`w-full text-center font-bold py-4 rounded-2xl transition-all active:scale-95 shadow-lg ${colors[color]}`}
      >
        Yönetime Git
      </a>
    </div>
  );
}
