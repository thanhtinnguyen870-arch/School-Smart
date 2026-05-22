import axiosClient from "../api/axiosClient";

export const downloadFile = async (url, filename) => {
  const blob = await axiosClient.get(url, { responseType: "blob" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
};
