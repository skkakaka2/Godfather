# Family Hub Mobile

Flutter Android 客户端，复刻现有 Web 前端已实现的家庭任务、积分、等级、奖励和管理功能。

## 环境

本仓库当前未内置 Flutter SDK。安装 Flutter 后在 `mobile/` 目录执行：

```bash
flutter pub get
flutter analyze
flutter test
flutter build apk --debug
```

## API 地址

默认 API 地址为 Android 模拟器访问宿主机的 `http://10.0.2.2:8080`。

真机联调时传入局域网地址：

```bash
flutter run --dart-define=API_BASE_URL=http://192.168.1.10:8080
```

第一版允许明文 HTTP，正式发布前建议切换 HTTPS。
