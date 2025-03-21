export const formatDuration = seconds => {
  // Convert the input to an integer.
  const sec = parseInt(seconds, 10);
  if (isNaN(sec) || sec < 0) return '00:00:00';

  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const secs = sec % 60;

  const pad = num => String(num).padStart(2, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
};
