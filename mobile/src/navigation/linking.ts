import { LinkingOptions } from "@react-navigation/native";

/**
 * Deep-link configuration.
 * Handles:
 *   esmalteria://auth?token=<jwt>   → navigate to LoginScreen with the token
 */
export const linking: LinkingOptions<ReactNavigation.RootParamList> = {
  prefixes: ["esmalteria://"],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: {
            path: "auth",
            parse: {
              token: (token: string) => token,
            },
          },
        },
      },
    },
  },
};
