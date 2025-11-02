export const logEvent = (type, message) => {
  console.log(`[${new Date().toISOString()}] [${type.toUpperCase()}] ${message}`);
};
