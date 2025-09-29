import { ImageType } from "../api/useGetLogoData.types";

export type GroupedFolder = {
  uploaded_at: string; // should be the date key!
  labels: Array<ImageType>;
};

const extractDate = (timestamp: string): string => {
  return new Date(timestamp).toISOString().split("T")[0]; // YYYY-MM-DD
};

export const groupImagesByDate = (
  images: Array<ImageType>
): Array<GroupedFolder> => {
  const grouped: Record<string, GroupedFolder> = {};

  images.forEach((image) => {
    const dateKey = extractDate(image.uploaded_at);

    if (!grouped[dateKey]) {
      grouped[dateKey] = {
        uploaded_at: dateKey, // ✅ use dateKey, not image.uploaded_at
        labels: [image],
      };
    } else {
      grouped[dateKey].labels.push(image);
    }
  });

  return Object.values(grouped);
};
