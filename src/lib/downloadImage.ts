export const downloadImage = async (imageUrl: string, filename: string) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading image:", error);
    throw new Error("Failed to download image");
  }
};

export const generateFilename = (styleName: string, type: "redesign" | "original") => {
  const timestamp = new Date().toISOString().split("T")[0];
  const sanitizedStyle = styleName.toLowerCase().replace(/\s+/g, "-");
  return `room-${type}-${sanitizedStyle}-${timestamp}.png`;
};
