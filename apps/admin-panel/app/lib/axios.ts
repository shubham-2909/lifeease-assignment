import { backendUrl } from "@repo/common/backendUrl";
import axios from "axios";

const customFetch = axios.create({
  baseURL: backendUrl,
});

export default customFetch;
