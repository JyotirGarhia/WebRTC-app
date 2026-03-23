import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
   <div className="flex flex-col items-center justify-start min-h-screen pt-24 gap-6">

  <h1 className="text-4xl font-bold">WebRTC Meet</h1>

  <p className="text-gray-400 text-center max-w-md">
    Fast, secure peer-to-peer video calls. No login required.
  </p>

  <div className="flex gap-4 mt-4">
    <button
      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:scale-105 active:scale-95 transition duration-200"
      onClick={() => navigate("/prejoin?mode=create")}
    >
      🎥 Create Room
    </button>

    <button
      className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 hover:scale-105 active:scale-95 transition duration-200"
      onClick={() => navigate("/prejoin?mode=join")}
    >
      🔗 Join Room
    </button>
  </div>

  <p className="text-sm text-gray-400 text-center">
    No account required • Works in browser • Secure connection
  </p>

</div>
  );
};

export default HomePage;
