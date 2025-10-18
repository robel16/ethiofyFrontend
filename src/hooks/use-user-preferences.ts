import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/user.service";
import toast from "react-hot-toast";

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  marketing: boolean;
}

export interface UserPreferences {
  notifications: NotificationPreferences;
  currency: string;
  measurement_unit: string;
}

// Query key factory
export const userPreferencesKeys = {
  all: ["userPreferences"] as const,
  preferences: () => [...userPreferencesKeys.all, "preferences"] as const,
};

// Hook to fetch user preferences
export function useUserPreferences() {
  return useQuery({
    queryKey: userPreferencesKeys.preferences(),
    queryFn: async (): Promise<UserPreferences> => {
      try {
        const response = await userService.getProfile();
        console.log("Profile fetched in useUserPreferences:", response);

        // Extract user data from response (structure is {user: {...}})
        const user = response.user || response;
        console.log("User data:", user);

        // Ensure we always return a valid UserPreferences object
        const preferences: UserPreferences = {
          notifications: {
            email: user.preferences?.notifications?.email ?? true,
            sms: user.preferences?.notifications?.sms ?? false,
            push: user.preferences?.notifications?.push ?? true,
            marketing: user.preferences?.notifications?.marketing ?? false,
          },
          currency: user.preferences?.currency ?? "USD",
          measurement_unit: user.preferences?.measurement_unit ?? "metric",
        };

        console.log("Processed preferences:", preferences);
        return preferences;
      } catch (error) {
        console.error("Failed to fetch user preferences:", error);
        // Return default preferences if API call fails
        return {
          notifications: {
            email: true,
            sms: false,
            push: true,
            marketing: false,
          },
          currency: "USD",
          measurement_unit: "metric",
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1, // Only retry once on failure
  });
}

// Hook to update notification preferences
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notifications: Partial<NotificationPreferences>) => {
      console.log("Updating notification preferences:", notifications);
      try {
        const result = await userService.updatePreferences({ notifications });
        console.log("Update preferences result:", result);
        return result;
      } catch (error) {
        console.error("Mutation failed:", error);
        throw error;
      }
    },
    onMutate: async (newNotifications) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: userPreferencesKeys.preferences(),
      });

      // Snapshot the previous value
      const previousPreferences = queryClient.getQueryData<UserPreferences>(
        userPreferencesKeys.preferences()
      );

      // Optimistically update to the new value
      if (previousPreferences) {
        queryClient.setQueryData<UserPreferences>(
          userPreferencesKeys.preferences(),
          {
            ...previousPreferences,
            notifications: {
              ...previousPreferences.notifications,
              ...newNotifications,
            },
          }
        );
      }

      // Return a context object with the snapshotted value
      return { previousPreferences };
    },
    onError: (error, _newNotifications, context) => {
      console.error("Failed to update notification preferences:", error);
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPreferences) {
        queryClient.setQueryData(
          userPreferencesKeys.preferences(),
          context.previousPreferences
        );
      }
      toast.error("Failed to update notification preferences");
    },
    onSuccess: (data) => {
      console.log("Mutation successful, received data:", data);
      toast.success("Notification preferences updated");
    },
    onSettled: (data, error) => {
      console.log("Mutation settled - data:", data, "error:", error);
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({
        queryKey: userPreferencesKeys.preferences(),
      });
    },
  });
}

// Hook to update general preferences (currency, measurement_unit)
export function useUpdateGeneralPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      preferences: Partial<Omit<UserPreferences, "notifications">>
    ) => {
      return await userService.updatePreferences(preferences);
    },
    onMutate: async (newPreferences) => {
      await queryClient.cancelQueries({
        queryKey: userPreferencesKeys.preferences(),
      });

      const previousPreferences = queryClient.getQueryData<UserPreferences>(
        userPreferencesKeys.preferences()
      );

      if (previousPreferences) {
        queryClient.setQueryData<UserPreferences>(
          userPreferencesKeys.preferences(),
          {
            ...previousPreferences,
            ...newPreferences,
          }
        );
      }

      return { previousPreferences };
    },
    onError: (error, _newPreferences, context) => {
      console.error("Failed to update general preferences:", error);
      if (context?.previousPreferences) {
        queryClient.setQueryData(
          userPreferencesKeys.preferences(),
          context.previousPreferences
        );
      }
      toast.error("Failed to update preferences");
    },
    onSuccess: () => {
      toast.success("Preferences updated");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: userPreferencesKeys.preferences(),
      });
    },
  });
}
