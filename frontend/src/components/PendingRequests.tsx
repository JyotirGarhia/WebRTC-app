type Request = {
  userId: string;
  name: string;
};

type Props = {
  requests: Request[];
  onApprove: (userId: string) => void;
  onReject: (userId: string) => void;
};

const PendingRequests = ({ requests, onApprove, onReject}: Props) => {
  
    return (
    <div className="mt-6 w-full max-w-md">
      <h3 className="mb-3 font-semibold">
        Join Requests
      </h3>

      {requests.length === 0 && (
        <p className="text-gray-500">
          No pending requests
        </p>
      )}

      <div className="flex flex-col gap-2">
        {requests.map(req => (
          <div
            key={req.userId}
            className="flex justify-between items-center border p-2 rounded"
          >
            <span>{req.name}</span>

            <div className="flex gap-2">
              <button onClick={() => onApprove(req.userId)}>
                Approve
              </button>
              <button onClick={() => onReject(req.userId)}>
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingRequests;
