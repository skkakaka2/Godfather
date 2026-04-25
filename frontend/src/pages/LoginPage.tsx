import { useMutation } from "@tanstack/react-query";
import { Button, Card, Form, Input, Space, Typography, message } from "antd";
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
          <p className="eyebrow">Synapse Planet</p>
          <h1>激活突触，收获血清素，激发多巴胺。</h1>
          <p>
            在突触星球上，每个神经元通过激活突触赚取血清素，用血清素激发多巴胺。前额叶负责管理和审批，让星球节奏井然有序。
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
                登录星球控制台
              </Typography.Title>
              <Typography.Text type="secondary">
                输入你的用户名和密码，进入突触星球。
              </Typography.Text>
            </div>

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
