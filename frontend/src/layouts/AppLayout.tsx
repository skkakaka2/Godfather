import {
  CheckSquareOutlined,
  CopyOutlined,
  GiftOutlined,
  HomeOutlined,
  LogoutOutlined,
  ShoppingCartOutlined,
  StarOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Layout, Menu, Space, Tag, Typography } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuthStore } from "@/lib/auth-store";

const { Header, Content, Sider } = Layout;

type RoleMenuItem = {
  key: string;
  icon: React.ReactNode;
  label: string;
  roles: string[];
};

const allMenuItems: RoleMenuItem[] = [
  { key: "/", icon: <HomeOutlined />, label: "概览", roles: ["ADMIN", "PARENT", "CHILD"] },
  { key: "/tasks", icon: <CheckSquareOutlined />, label: "突触管理", roles: ["ADMIN", "PARENT", "CHILD"] },
  { key: "/task-templates", icon: <CopyOutlined />, label: "突触模板", roles: ["ADMIN", "PARENT"] },
  { key: "/points", icon: <StarOutlined />, label: "血清素流水", roles: ["ADMIN", "PARENT", "CHILD"] },
  { key: "/rewards", icon: <GiftOutlined />, label: "多巴胺商城", roles: ["ADMIN", "PARENT", "CHILD"] },
  { key: "/redeem-orders", icon: <ShoppingCartOutlined />, label: "激发审批", roles: ["ADMIN", "PARENT"] },
  { key: "/users", icon: <TeamOutlined />, label: "居民管理", roles: ["ADMIN", "PARENT"] },
];

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const menuItems = allMenuItems
    .filter((item) => item.roles.includes(user?.role ?? ""))
    .map(({ key, icon, label }) => ({ key, icon, label }));

  return (
    <Layout className="shell">
      <Sider breakpoint="lg" collapsedWidth={0} width={252} className="shell-sider">
        <div className="brand-block">
          <p className="brand-title">突触星球</p>
          <strong>Synapse Planet</strong>
          <span>把突触、血清素和多巴胺放在同一条星球节奏线上。</span>
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
            <Space size={8}>
              <Typography.Text strong>{user?.nickname ?? user?.username ?? "未登录"}</Typography.Text>
              <Tag color="processing">{user?.role ?? "访客"}</Tag>
            </Space>
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
