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

export const dataUrlToFile = (url, fileName) => {
  const [mediaType, data] = url.split(",");
  const mime = mediaType.match(/:(.*?);/)?.[0];
  var n = data.length;
  const arr = new Uint8Array(n);
  while (n--) {
    arr[n] = data.charCodeAt(n);
  }
  return new File([arr], fileName, { type: mime });
};

export const dataUrlToFileUsingFetch = async (url, fileName, mimeType) => {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();

  return new File([buffer], fileName, { type: mimeType });
};

