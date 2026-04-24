import {
  CheckSquareOutlined,
  GiftOutlined,
  HomeOutlined,
  LogoutOutlined,
  ShoppingCartOutlined,
  StarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Layout, Menu, Space, Tag, Typography } from "antd";
import type { MenuProps } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuthStore } from "@/lib/auth-store";

const { Header, Content, Sider } = Layout;

const menuItems: MenuProps["items"] = [
  { key: "/", icon: <HomeOutlined />, label: "概览" },
  { key: "/tasks", icon: <CheckSquareOutlined />, label: "任务管理" },
  { key: "/points", icon: <StarOutlined />, label: "积分流水" },
  { key: "/rewards", icon: <GiftOutlined />, label: "奖励商城" },
  { key: "/redeem-orders", icon: <ShoppingCartOutlined />, label: "兑换审批" },
];

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  return (
    <Layout className="shell">
      <Sider breakpoint="lg" collapsedWidth={0} width={252} className="shell-sider">
        <div className="brand-block">
          <p>家庭小助手</p>
          <strong>Family Hub Console</strong>
          <span>把任务、积分和奖励放在同一条家庭节奏线上。</span>
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="shell-menu"
        />
      </Sider>

      <Layout>
        <Header className="shell-header">
          <Space size={16}>
            <Avatar size={42} icon={<UserOutlined />} />
            <div>
              <Typography.Text strong>{user?.nickname ?? user?.username ?? "未登录"}</Typography.Text>
              <div>
                <Tag color="processing">{user?.role ?? "访客"}</Tag>
              </div>
            </div>
          </Space>

          <Button
            icon={<LogoutOutlined />}
            onClick={() => {
              clearSession();
              navigate("/login", { replace: true });
            }}
          >
            退出登录
          </Button>
        </Header>

        <Content className="shell-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
