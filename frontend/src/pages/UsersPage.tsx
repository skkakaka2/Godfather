import { useMemo, useState } from "react";

import { PlusOutlined } from "@ant-design/icons";
import { App, Button, Drawer, Form, Input, Select, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { PageHeading } from "@/components/PageHeading";
import { authApi, userApi } from "@/lib/api";
import { formatPoints } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import type { User } from "@/lib/types";
import { useAuthStore } from "@/lib/auth-store";

const roleOptions = [
  { value: "ADMIN", label: "ADMIN（管理员）" },
  { value: "PARENT", label: "PARENT（前额叶）" },
  { value: "CHILD", label: "CHILD（神经元）" },
];

const roleTagMap: Record<string, { color: string; label: string }> = {
  ADMIN: { color: "red", label: "管理员" },
  PARENT: { color: "blue", label: "前额叶" },
  CHILD: { color: "green", label: "神经元" },
};

type EditFormValues = {
  nickname: string;
  role: string;
};

type CreateFormValues = {
  username: string;
  password: string;
  nickname: string;
  role: string;
};

export function UsersPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm] = Form.useForm<EditFormValues>();
  const [createForm] = Form.useForm<CreateFormValues>();

  const membersQuery = useQuery({
    queryKey: queryKeys.familyMembers,
    queryFn: userApi.familyMembers,
  });

  const refreshMembers = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.familyMembers });

  const createMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: async () => {
      message.success("居民添加成功");
      setCreateOpen(false);
      createForm.resetFields();
      await refreshMembers();
    },
    onError: (error) => message.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EditFormValues }) =>
      userApi.updateUser(id, data),
    onSuccess: async () => {
      message.success("居民信息已更新");
      setEditOpen(false);
      setEditingUser(null);
      editForm.resetFields();
      await refreshMembers();
    },
    onError: (error) => message.error(error.message),
  });

  const openCreate = () => {
    createForm.setFieldsValue({
      username: "",
      password: "",
      nickname: "",
      role: "CHILD",
    });
    setCreateOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    editForm.setFieldsValue({
      nickname: user.nickname,
      role: user.role,
    });
    setEditOpen(true);
  };

  const columns = useMemo<ColumnsType<User>>(
    () => [
      {
        title: "昵称",
        dataIndex: "nickname",
        render: (value: string) => <strong>{value}</strong>,
      },
      {
        title: "用户名",
        dataIndex: "username",
      },
      {
        title: "角色",
        dataIndex: "role",
        render: (value: string) => {
          const config = roleTagMap[value] ?? { color: "default", label: value };
          return <Tag color={config.color}>{config.label}</Tag>;
        },
      },
      {
        title: "血清素",
        dataIndex: "points",
        render: (value: number) => formatPoints(value ?? 0),
      },
      {
        title: "操作",
        key: "actions",
        render: (_, record) => (
          <Button type="link" onClick={() => openEdit(record)}>
            编辑
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <PageHeading
        title="居民管理"
        description="管理星球居民，添加新成员或编辑角色。"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            添加居民
          </Button>
        }
      />

      <Table<User>
        rowKey="id"
        columns={columns}
        dataSource={membersQuery.data ?? []}
        loading={membersQuery.isLoading}
        pagination={false}
      />

      <Drawer
        title="添加居民"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        width={420}
      >
        <Form<CreateFormValues>
          form={createForm}
          layout="vertical"
          onFinish={(values) => {
            createMutation.mutate({
              ...values,
              familyId: currentUser?.familyId,
            });
          }}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: "请输入用户名" },
              { min: 3, max: 64, message: "用户名长度 3-64 位" },
            ]}
          >
            <Input placeholder="登录用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: "请输入密码" },
              { min: 6, max: 32, message: "密码长度 6-32 位" },
            ]}
          >
            <Input.Password placeholder="登录密码" />
          </Form.Item>

          <Form.Item name="nickname" label="昵称">
            <Input placeholder="显示名称，不填则使用用户名" />
          </Form.Item>

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: "请选择角色" }]}
          >
            <Select options={roleOptions} />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={createMutation.isPending}
          >
            添加居民
          </Button>
        </Form>
      </Drawer>

      <Drawer
        title={`编辑居民：${editingUser?.nickname ?? ""}`}
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditingUser(null);
        }}
        width={420}
      >
        <Form<EditFormValues>
          form={editForm}
          layout="vertical"
          onFinish={(values) => {
            if (editingUser) {
              updateMutation.mutate({ id: editingUser.id, data: values });
            }
          }}
        >
          <Form.Item
            name="nickname"
            label="昵称"
            rules={[{ required: true, message: "请输入昵称" }]}
          >
            <Input placeholder="显示名称" />
          </Form.Item>

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: "请选择角色" }]}
          >
            <Select options={roleOptions} />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={updateMutation.isPending}
          >
            保存修改
          </Button>
        </Form>
      </Drawer>
    </Space>
  );
}
