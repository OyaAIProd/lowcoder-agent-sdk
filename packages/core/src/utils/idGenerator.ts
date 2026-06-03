/** Replica exacta de genRandomKey() del frontend de Lowcoder */
export const genGridKey = (): string =>
  Math.floor(Math.random() * 0xffffffff).toString(16);

/** Replica exacta de genQueryId() del frontend de Lowcoder */
export const genQueryId = (len = 24): string => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: len }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};
