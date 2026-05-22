export const formatDate = (value) => value ? new Intl.DateTimeFormat("vi-VN").format(new Date(value)) : "-";
export const formatTime = (value) => value ? new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(value)) : "-";
