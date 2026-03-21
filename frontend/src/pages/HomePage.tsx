import { useNavigate } from "react-router-dom";
import { useState } from "react";

const HomePage = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");

  return (
    <div className="flex flex-col items-center gap-4 p-10">
      <h1 className="text-2xl font-bold">Video Chat</h1>

      <button className="px-4 py-2 bg-blue-500 text-white rounded-md"
        onClick={() => navigate("/prejoin?mode=create")}
      >
        Create Room
      </button>

      <button
        className="px-4 py-2 bg-green-500 text-white rounded"
        onClick={() => navigate(`/prejoin?mode=join&roomId=${roomId}`)}
      >
        Join Room
      </button>
    </div>
  );
};

export default HomePage;
