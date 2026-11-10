import type { MetadataRoute } from "next";

import { manifeste } from "@/lib/manifeste";

export default function manifest(): MetadataRoute.Manifest {
  return manifeste("/");
}
