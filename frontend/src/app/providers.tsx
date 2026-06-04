import type { PropsWithChildren } from "react";

import { App as AntdApp, ConfigProvider } from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 15_000,
    },
  },
});

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#c95d3c",
          colorSuccess: "#3c7a63",
          colorWarning: "#e09f3e",
          colorInfo: "#5b7dd1",
          colorTextBase: "#2f241d",
          colorBgBase: "#f6f1e8",
          borderRadius: 22,
          fontFamily:
            '"Avenir Next", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
        },
        components: {
          Card: {
            borderRadiusLG: 28,
          },
          Layout: {
            bodyBg: "#f6f1e8",
            siderBg: "rgba(255, 250, 245, 0.78)",
            headerBg: "rgba(255, 255, 255, 0.45)",
          },
        },
      }}
    >
      <AntdApp>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </AntdApp>
    </ConfigProvider>
  );
}
