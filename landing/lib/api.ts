import { API_BASE_URL } from "./config";
import { PlanListResponse } from "./types";

// Public API (for landing page)
export async function fetchPublicPlans(): Promise<PlanListResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/pricing/public/plans`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // No credentials needed for public endpoint
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("API Error:", errorText);
      throw new Error(
        `HTTP error! status: ${res.status}, message: ${errorText}`,
      );
    }

    const json = await res.json();
    return json;
  } catch (error) {
    console.error("Failed to fetch public plans:", error);
    throw new Error("Failed to fetch pricing plans");
  }
}
