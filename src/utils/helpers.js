/**
 * Formats a date string to a readable format.
 * @param {string} dateString - The date string to format.
 * @returns {string} Formatted date.
 */
export const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

/**
 * Capitalizes the first letter of a string.
 * @param {string} str - The string to capitalize.
 * @returns {string} Capitalized string.
 */
export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Filters data based on role.
 * @param {Array} data - The array of data to filter.
 * @param {string} role - The role to filter data for.
 * @returns {Array} Filtered data.
 */
export const filterDataByRole = (data, role) => {
  if (role === "admin") return data; // Admin sees all data
  return data.filter((item) => item.role === role);
};

export const dataUrlToFile = (base64String, filename) => {
  const [header, data] = base64String.split(",");

  const mime = header.match(/data:(.*);base64/)?.[1];
  const byteString = atob(data);
  const byteArray = new Uint8Array(byteString.length);

  for (let i = 0; i < byteString.length; i++) {
    byteArray[i] = byteString.charCodeAt(i);
  }

  return new File([byteArray], filename, { type: mime });
};

export const dataUrlToFileUsingFetch = async (url, fileName, mimeType) => {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();

  return new File([buffer], fileName, { type: mimeType });
};
