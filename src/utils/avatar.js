export const getFakeAvatar = () => {
  const id = Math.floor(Math.random() * 70) + 1;
  return `https://i.pravatar.cc/150?img=${id}`;
};
