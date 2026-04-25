import { useMutation } from "@tanstack/react-query";
import { Alert, Button, Card, Form, Input, Space, Typography, message } from "antd";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { authApi, userApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

type LoginFormValues = {
  username: string;
  password: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((state) => state.setSession);
  const setUser = useAuthStore((state) => state.setUser);

  const from = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from ?? "/";
  }, [location.state]);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (payload) => {
      setSession(payload);
      try {
        const me = await userApi.me();
        setUser(me);
      } catch {
        setUser(payload.user);
      }
      message.success("登录成功");
      navigate(from, { replace: true });
    },
    onError: (error) => {
      message.error(error.message);
    },
  });

  return (
    <div className="auth-shell">
      <div className="auth-aurora auth-aurora--left" />
      <div className="auth-aurora auth-aurora--right" />

      <section className="auth-panel animate-enter">
        <div className="auth-copy">
          <p className="eyebrow">Family Hub</p>
          <h1>让星球协作像一张有节奏的作息表，而不是一堆零散提醒。</h1>
          <p>
            这个前端工程承接当前 Spring Boot 后端的认证、突触、血清素和激发逻辑，优先服务前额叶端管理与审批流。
          </p>

          <div className="feature-strip">
            <span>突触激活</span>
            <span>血清素流水</span>
            <span>多巴胺商城</span>
            <span>激发审批</span>
          </div>
        </div>

        <Card className="auth-card" bordered={false}>
          <Space direction="vertical" size={18} style={{ width: "100%" }}>
            <div>
              <Typography.Title level={3} style={{ marginBottom: 4 }}>
                登录控制台
              </Typography.Title>
              <Typography.Text type="secondary">
                使用后端现有 `POST /api/v1/auth/login` 接口。
              </Typography.Text>
            </div>

            <Alert
              type="info"
              showIcon
              message="默认通过 .env 中的 VITE_API_BASE_URL 指向后端地址。"
            />

            <Form<LoginFormValues>
              layout="vertical"
              onFinish={(values) => loginMutation.mutate(values)}
              initialValues={{
                username: "",
                password: "",
              }}
            >
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: "请输入用户名" }]}
              >
                <Input size="large" placeholder="请输入用户名" />
              </Form.Item>

              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: "请输入密码" }]}
              >
                <Input.Password size="large" placeholder="请输入密码" />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loginMutation.isPending}
              >
                进入星球控制台
              </Button>
            </Form>
          </Space>
        </Card>
      </section>
    </div>
  );
}
