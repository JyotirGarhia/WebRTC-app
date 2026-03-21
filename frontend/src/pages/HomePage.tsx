import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

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
        onClick={() => navigate(`/prejoin?mode=join`)}
      >
        Join Room
      </button>
    </div>
  );
};

export default HomePage;
