const JoinRejected = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h2 className="text-xl font-semibold text-red-500">
        Join Request Rejected
      </h2>

      <p className="text-gray-500">
        The host rejected your request.
      </p>
    </div>
  );
};

export default JoinRejected;
