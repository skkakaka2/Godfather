import {
  CheckSquareOutlined,
  CopyOutlined,
  GiftOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuOutlined,
  ShoppingCartOutlined,
  StarOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Divider, Drawer, Grid, Layout, Menu, Space, Tag, Typography } from "antd";
import { useCallback, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuthStore } from "@/lib/auth-store";

const { Header, Content, Sider } = Layout;
const { useBreakpoint } = Grid;

type RoleMenuItem = {
  key: string;
  icon: React.ReactNode;
  label: string;
  roles: string[];
};

const allMenuItems: RoleMenuItem[] = [
  { key: "/", icon: <HomeOutlined />, label: "概览", roles: ["ADMIN", "PARENT"] },
  { key: "/tasks", icon: <CheckSquareOutlined />, label: "突触管理", roles: ["ADMIN", "PARENT", "CHILD"] },
  { key: "/task-templates", icon: <CopyOutlined />, label: "突触模板", roles: ["ADMIN", "PARENT"] },
  { key: "/points", icon: <StarOutlined />, label: "血清素脉冲", roles: ["ADMIN", "PARENT", "CHILD"] },
  { key: "/endorphins", icon: <ThunderboltOutlined />, label: "内啡肽脉冲", roles: ["ADMIN", "PARENT", "CHILD"] },
  { key: "/rewards", icon: <GiftOutlined />, label: "多巴胺商城", roles: ["ADMIN", "PARENT", "CHILD"] },
  { key: "/redeem-orders", icon: <ShoppingCartOutlined />, label: "激发审批", roles: ["ADMIN", "PARENT"] },
  { key: "/users", icon: <TeamOutlined />, label: "居民管理", roles: ["ADMIN", "PARENT"] },
];

const mobileTabItems: RoleMenuItem[] = [
  { key: "/", icon: <HomeOutlined />, label: "概览", roles: ["ADMIN", "PARENT"] },
  { key: "/tasks", icon: <CheckSquareOutlined />, label: "突触管理", roles: ["ADMIN", "PARENT", "CHILD"] },
  { key: "/points", icon: <StarOutlined />, label: "血清素脉冲", roles: ["ADMIN", "PARENT", "CHILD"] },
  { key: "/endorphins", icon: <ThunderboltOutlined />, label: "内啡肽脉冲", roles: ["ADMIN", "PARENT", "CHILD"] },
  { key: "/rewards", icon: <GiftOutlined />, label: "多巴胺商城", roles: ["ADMIN", "PARENT", "CHILD"] },
];

const adminDrawerItems: RoleMenuItem[] = [
  { key: "/task-templates", icon: <CopyOutlined />, label: "突触模板", roles: ["ADMIN", "PARENT"] },
  { key: "/redeem-orders", icon: <ShoppingCartOutlined />, label: "激发审批", roles: ["ADMIN", "PARENT"] },
  { key: "/users", icon: <TeamOutlined />, label: "居民管理", roles: ["ADMIN", "PARENT"] },
];

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [drawerOpen, setDrawerOpen] = useState(false);

  const role = user?.role ?? "";

  const menuItems = allMenuItems
    .filter((item) => item.roles.includes(role))
    .map(({ key, icon, label }) => ({ key, icon, label }));

  const tabs = mobileTabItems
    .filter((item) => item.roles.includes(role));

  const drawerMenuItems = adminDrawerItems
    .filter((item) => item.roles.includes(role))
    .map(({ key, icon, label }) => ({ key, icon, label }));

  const handleLogout = useCallback(() => {
    clearSession();
    navigate("/login", { replace: true });
  }, [clearSession, navigate]);

  const roleLabel: Record<string, string> = {
    ADMIN: "管理员",
    PARENT: "家长",
    CHILD: "孩子",
  };

  return (
    <Layout className="shell">
      {!isMobile && (
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
      )}

      <Layout>
        {!isMobile && (
          <Header className="shell-header">
            <Space size={16}>
              <Avatar size={42} icon={<UserOutlined />} />
              <Space size={8}>
                <Typography.Text strong>{user?.nickname ?? user?.username ?? "未登录"}</Typography.Text>
                <Tag color="processing">{roleLabel[role] ?? role}</Tag>
              </Space>
            </Space>

            <Button icon={<LogoutOutlined />} onClick={handleLogout}>
              退出登录
            </Button>
          </Header>
        )}

        <Content className="shell-content">
          <Outlet />
        </Content>
      </Layout>

      {isMobile && (
        <nav className="mobile-tabbar">
          {tabs.map((item) => (
            <button
              key={item.key}
              className={`mobile-tabbar__item${location.pathname === item.key ? " active" : ""}`}
              onClick={() => navigate(item.key)}
            >
              <span className="mobile-tabbar__icon">{item.icon}</span>
              <span className="mobile-tabbar__label">{item.label}</span>
            </button>
          ))}
          <button
            className={`mobile-tabbar__item${drawerOpen ? " active" : ""}`}
            onClick={() => setDrawerOpen(true)}
          >
            <span className="mobile-tabbar__icon"><MenuOutlined /></span>
            <span className="mobile-tabbar__label">我的</span>
          </button>

          <Drawer
            placement="bottom"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            height="auto"
            title={null}
            closable={false}
            className="mobile-drawer"
          >
            <div className="mobile-drawer__user">
              <Avatar size={52} icon={<UserOutlined />} />
              <div>
                <Typography.Text strong style={{ fontSize: 17 }}>
                  {user?.nickname ?? user?.username ?? "未登录"}
                </Typography.Text>
                <Tag color="processing" style={{ marginLeft: 8 }}>{roleLabel[role] ?? role}</Tag>
              </div>
            </div>

            {drawerMenuItems.length > 0 && (
              <>
                <Divider style={{ margin: "12px 0" }} />
                <Menu
                  mode="inline"
                  selectedKeys={[location.pathname]}
                  items={drawerMenuItems}
                  onClick={({ key }) => {
                    navigate(key);
                    setDrawerOpen(false);
                  }}
                  style={{ border: "none" }}
                />
              </>
            )}

            <Divider style={{ margin: "12px 0" }} />
            <Button
              block
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              退出登录
            </Button>
          </Drawer>
        </nav>
      )}
    </Layout>
  );
}
