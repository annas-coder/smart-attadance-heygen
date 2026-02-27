const BASE_URL = process.env.YOUVERSE_BASE_URL || "https://face.youverse.id/v3";
const API_KEY = process.env.YOUVERSE_API_KEY || "";

interface QualityMetric {
  name: string;
  value: number;
  enum?: string;
  bottom_threshold: number;
  top_threshold: number;
  test: boolean;
}

interface ProcessedFace {
  biometric_type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  template: string;
  template_version: string;
  quality_metrics: QualityMetric[];
  matching_image?: string;
}

export interface FaceProcessResult {
  detected: boolean;
  template: string | null;
  qualityMetrics: QualityMetric[];
  qualityPassed: boolean;
  raw: ProcessedFace[];
}

export interface IdentifyCandidate {
  template_id: string;
  score: number;
}

async function youverseRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      ...options.headers,
    },
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  if (!res.ok) {
    throw new Error(
      `Youverse API error ${res.status} on ${path}: ${text}`
    );
  }

  return text ? JSON.parse(text) : undefined;
}

export async function processFace(imageBase64: string): Promise<FaceProcessResult> {
  const raw = await youverseRequest<ProcessedFace[]>("/face/process", {
    method: "POST",
    body: JSON.stringify({
      image: imageBase64,
      processings: ["detect", "analyze", "templify"],
    }),
  });

  if (!raw || raw.length === 0) {
    return {
      detected: false,
      template: null,
      qualityMetrics: [],
      qualityPassed: false,
      raw: [],
    };
  }

  const face = raw[0];
  const allQualityPassed = face.quality_metrics
    ? face.quality_metrics.every((m) => m.test)
    : true;

  return {
    detected: true,
    template: face.template,
    qualityMetrics: face.quality_metrics || [],
    qualityPassed: allQualityPassed,
    raw,
  };
}

export async function createGallery(galleryId: string): Promise<void> {
  try {
    await youverseRequest<void>(`/gallery/${galleryId}`, {
      method: "POST",
    });
  } catch (err: any) {
    if (err.message?.includes("409")) {
      return;
    }
    throw err;
  }
}

export async function enrollInGallery(
  galleryId: string,
  personId: string,
  template: string
): Promise<void> {
  await createGallery(galleryId);

  try {
    await youverseRequest<void>(`/gallery/${galleryId}/${personId}`, {
      method: "POST",
      body: JSON.stringify({ template }),
    });
  } catch (err: any) {
    if (err.message?.includes("409")) {
      await youverseRequest<void>(`/gallery/${galleryId}/${personId}`, {
        method: "DELETE",
      });
      await youverseRequest<void>(`/gallery/${galleryId}/${personId}`, {
        method: "POST",
        body: JSON.stringify({ template }),
      });
      return;
    }
    throw err;
  }
}

export async function identifyFace(
  template: string,
  galleryId: string,
  candidateListLength = 1,
  minimumScore = 0.5
): Promise<IdentifyCandidate[]> {
  return youverseRequest<IdentifyCandidate[]>("/face/identify", {
    method: "POST",
    body: JSON.stringify({
      template,
      gallery_id: galleryId,
      candidate_list_length: candidateListLength,
      minimum_score: minimumScore,
    }),
  });
}

export async function removeFromGallery(
  galleryId: string,
  personId: string
): Promise<void> {
  try {
    await youverseRequest<void>(`/gallery/${galleryId}/${personId}`, {
      method: "DELETE",
    });
  } catch (err: any) {
    if (err.message?.includes("404")) {
      return;
    }
    throw err;
  }
}

export async function deleteGallery(galleryId: string): Promise<void> {
  try {
    await youverseRequest<void>(`/gallery/${galleryId}`, {
      method: "DELETE",
    });
  } catch (err: any) {
    if (err.message?.includes("404")) {
      return;
    }
    throw err;
  }
}

export async function listGalleryMembers(
  galleryId: string
): Promise<string[]> {
  try {
    return await youverseRequest<string[]>(`/gallery/${galleryId}`, {
      method: "GET",
    });
  } catch (err: any) {
    if (err.message?.includes("404")) {
      return [];
    }
    throw err;
  }
}
