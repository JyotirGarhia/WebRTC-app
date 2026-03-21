export function getOrCreateUserId() {
  let id = sessionStorage.getItem("userId");

  if (!id) {
    id = `user_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem("userId", id);
  }

  return id;
}

export function generateRoomId() {
  return Math.random().toString(36).slice(2, 9);
}