import axios from "axios";
import { toast } from "react-toastify";

export function handleAxiosError(
  error: unknown,
  fallbackMsg = "Something went wrong"
) {
  if (axios.isAxiosError<Record<string, string>>(error)) {
    const message = error.response?.data?.error || fallbackMsg;
    toast.error(message);
  } else {
    toast.error(fallbackMsg);
  }
}
