/**
 * Preferences Tools - User personalization preferences
 *
 * These tools manage user preferences for personalized cosmetics recommendations.
 * Preferences include skin type, concerns, favorite brands, budget, and allergies.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TOOL_METADATA } from "../config/constants";
import {
  GetPreferencesInputSchema,
  UpdatePreferencesInputSchema,
  UserPreferenceAPIResponseSchema,
  GetPreferencesInput,
  UpdatePreferencesInput,
  UserPreference,
} from "../types";
import {
  apiClient,
  formatSuccessResponse,
  formatErrorResponse,
} from "../utils/api";
import {
  createToolDescription,
  validateAuthToken,
  cleanParams,
} from "../utils/helper";

/**
 * Register all preferences-related tools
 */
export function registerPreferencesTools(server: McpServer) {
  registerGetPreferences(server);
  registerUpdatePreferences(server);
}

/**
 * Tool: get_preferences
 *
 * Fetch the current user's saved preferences.
 * Call this at conversation start if preferences are not already injected.
 * Use the returned data to personalize search filters.
 */
function registerGetPreferences(server: McpServer) {
  server.registerTool(
    "get_preferences",
    {
      title: "Get User Preferences",
      description: createToolDescription(
        TOOL_METADATA.PREFERENCE_MANAGEMENT,
        "Fetch user's saved preferences (skin type, concerns, brands, budget, allergies). " +
          "Call this at conversation start to enable personalization."
      ),
      inputSchema: GetPreferencesInputSchema,
      outputSchema: UserPreferenceAPIResponseSchema,
    },
    async (args: GetPreferencesInput) => {
      try {
        console.log("[MCP] Fetching user preferences");

        const authToken = args.__auth_token;
        validateAuthToken(authToken);

        const response = await apiClient.get<UserPreference>(
          "/me/preferences",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.success) {
          throw new Error("Failed to fetch user preferences");
        }

        const prefsData = UserPreferenceAPIResponseSchema.parse(response);
        console.log(">>>> get_preferences", prefsData);

        return formatSuccessResponse(prefsData);
      } catch (error: any) {
        return formatErrorResponse(error.message);
      }
    }
  );
}

/**
 * Tool: update_preferences
 *
 * Persist user preferences for future sessions.
 *
 * WHEN TO CALL:
 * - User mentions their skin type: "da dầu" → skin_type: "oily"
 * - User mentions concerns: "bị mụn, thâm" → skin_concerns: ["acne", "dark_spots"]
 * - User mentions brands: "thích cerave" → favorite_brands: ["cerave"]
 * - User mentions budget: "200-500k" → price_range_min: 200000, price_range_max: 500000
 * - User mentions allergies: "dị ứng cồn" → allergies: ["alcohol"]
 *
 * This is a partial update - only provided fields are updated.
 */
function registerUpdatePreferences(server: McpServer) {
  server.registerTool(
    "update_preferences",
    {
      title: "Update User Preferences",
      description: createToolDescription(
        TOOL_METADATA.PREFERENCE_MANAGEMENT,
        "Save user preferences for personalization. " +
          "Call when user mentions skin type, concerns, brands, budget, or allergies. " +
          "Partial update - only provided fields are changed."
      ),
      inputSchema: UpdatePreferencesInputSchema,
      outputSchema: UserPreferenceAPIResponseSchema,
    },
    async (args: UpdatePreferencesInput) => {
      try {
        const payload = buildPreferencePayload(args);
        console.log("[MCP] Updating user preferences:", Object.keys(payload));

        const authToken = args.__auth_token;
        validateAuthToken(authToken);

        const response = await apiClient.put<UserPreference>(
          "/me/preferences",
          payload,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.success) {
          throw new Error("Failed to update user preferences");
        }

        const prefsData = UserPreferenceAPIResponseSchema.parse(response);
        console.log(">>>> update_preferences", prefsData);
        return formatSuccessResponse(prefsData);
      } catch (error: any) {
        return formatErrorResponse(error.message);
      }
    }
  );
}

/**
 * Build preference update payload from tool args.
 */
function buildPreferencePayload(
  args: UpdatePreferencesInput
): Record<string, any> {
  return cleanParams({
    skin_type: args.skin_type,
    skin_concerns: args.skin_concerns,
    favorite_brands: args.favorite_brands,
    price_range_min: args.price_range_min,
    price_range_max: args.price_range_max,
    preferred_categories: args.preferred_categories,
    allergies: args.allergies,
  });
}
