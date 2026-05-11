import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/auth/auth_controller.dart';
import '../models/models.dart';
import 'api_client.dart';

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(
    readAccessToken: () async => ref.read(authControllerProvider)?.accessToken,
    onUnauthorized: () async => ref.read(authControllerProvider.notifier).logout(),
  );
});

final familyHubApiProvider = Provider<FamilyHubApi>((ref) {
  return FamilyHubApi(ref.watch(apiClientProvider));
});

class FamilyHubApi {
  const FamilyHubApi(this._client);

  final ApiClient _client;

  Future<LoginResponse> login(String username, String password) {
    return _client.post<LoginResponse>(
      '/api/v1/auth/login',
      data: {'username': username, 'password': password},
      decode: (data) => LoginResponse.fromJson(asJsonMap(data)),
    );
  }

  Future<LoginResponse> register({
    required String username,
    required String password,
    String? nickname,
    String? role,
    int? familyId,
  }) {
    return _client.post<LoginResponse>(
      '/api/v1/auth/register',
      data: {
        'username': username,
        'password': password,
        'nickname': nickname,
        'role': role,
        'familyId': familyId,
      },
      decode: (data) => LoginResponse.fromJson(asJsonMap(data)),
    );
  }

  Future<User> me() {
    return _client.get<User>(
      '/api/v1/users/me',
      decode: (data) => User.fromJson(asJsonMap(data)),
    );
  }

  Future<List<User>> familyMembers() {
    return _client.get<List<User>>(
      '/api/v1/users/family/members',
      decode: (data) => asJsonMapList(data).map(User.fromJson).toList(),
    );
  }

  Future<User> updateUser(
    int id, {
    String? nickname,
    String? avatar,
    String? role,
  }) {
    return _client.put<User>(
      '/api/v1/users/$id',
      query: {'nickname': nickname, 'avatar': avatar, 'role': role},
      decode: (data) => User.fromJson(asJsonMap(data)),
    );
  }

  Future<List<DailyTask>> tasks({
    int? userId,
    String? taskDate,
    String? status,
  }) {
    return _client.get<List<DailyTask>>(
      '/api/v1/tasks',
      query: {'userId': userId, 'taskDate': taskDate, 'status': status},
      decode: (data) => asJsonMapList(data).map(DailyTask.fromJson).toList(),
    );
  }

  Future<void> completeTask(int id) {
    return _client.post<void>(
      '/api/v1/tasks/complete',
      data: {'id': id, 'userId': 0, 'photoUrls': <String>[]},
      decode: (_) {},
    );
  }

  Future<void> confirmTask(int id, {int? points, String? remark}) {
    return _client.post<void>(
      '/api/v1/tasks/confirm',
      data: {'id': id, 'points': points, 'remark': remark},
      decode: (_) {},
    );
  }

  Future<void> rejectTask(int id, String reason) {
    return _client.post<void>(
      '/api/v1/tasks/reject',
      data: {'id': id, 'reason': reason},
      decode: (_) {},
    );
  }

  Future<List<TaskTemplate>> taskTemplates() {
    return _client.get<List<TaskTemplate>>(
      '/api/v1/task-templates',
      decode: (data) => asJsonMapList(data).map(TaskTemplate.fromJson).toList(),
    );
  }

  Future<TaskTemplate> createTaskTemplate(Map<String, Object?> payload) {
    return _client.post<TaskTemplate>(
      '/api/v1/task-templates',
      data: payload,
      decode: (data) => TaskTemplate.fromJson(asJsonMap(data)),
    );
  }

  Future<TaskTemplate> updateTaskTemplate(int id, Map<String, Object?> payload) {
    return _client.put<TaskTemplate>(
      '/api/v1/task-templates/$id',
      data: payload,
      decode: (data) => TaskTemplate.fromJson(asJsonMap(data)),
    );
  }

  Future<void> deleteTaskTemplate(int id) {
    return _client.delete<void>(
      '/api/v1/task-templates/$id',
      decode: (_) {},
    );
  }

  Future<int> pointBalance() {
    return _client.get<int>(
      '/api/v1/store/points/balance',
      decode: asInt,
    );
  }

  Future<PageResult<PointLog>> pointLogs({
    int? userId,
    String? type,
    int page = 1,
    int pageSize = 10,
  }) {
    return _client.get<PageResult<PointLog>>(
      '/api/v1/store/points/logs',
      query: {'userId': userId, 'type': type, 'page': page, 'pageSize': pageSize},
      decode: (data) => PageResult.fromJson(data, PointLog.fromJson),
    );
  }

  Future<List<Reward>> rewards({String? status}) {
    return _client.get<List<Reward>>(
      '/api/v1/store/rewards',
      query: {'status': status},
      decode: (data) => asJsonMapList(data).map(Reward.fromJson).toList(),
    );
  }

  Future<Reward> createReward(Map<String, Object?> payload) {
    return _client.post<Reward>(
      '/api/v1/store/rewards',
      data: payload,
      decode: (data) => Reward.fromJson(asJsonMap(data)),
    );
  }

  Future<Reward> updateReward(int id, Map<String, Object?> payload) {
    return _client.put<Reward>(
      '/api/v1/store/rewards/$id',
      data: payload,
      decode: (data) => Reward.fromJson(asJsonMap(data)),
    );
  }

  Future<void> deleteReward(int id) {
    return _client.delete<void>(
      '/api/v1/store/rewards/$id',
      decode: (_) {},
    );
  }

  Future<void> toggleReward(int id) {
    return _client.put<void>(
      '/api/v1/store/rewards/$id/toggle',
      decode: (_) {},
    );
  }

  Future<RedeemOrder> redeem(int rewardId) {
    return _client.post<RedeemOrder>(
      '/api/v1/store/redeem',
      data: {'rewardId': rewardId},
      decode: (data) => RedeemOrder.fromJson(asJsonMap(data)),
    );
  }

  Future<List<RedeemOrder>> redeemOrders({int? userId, String? status}) {
    return _client.get<List<RedeemOrder>>(
      '/api/v1/store/redeem/orders',
      query: {'userId': userId, 'status': status},
      decode: (data) => asJsonMapList(data).map(RedeemOrder.fromJson).toList(),
    );
  }

  Future<PageResult<RedeemOrder>> redeemOrdersPaged({
    int? userId,
    String? status,
    int page = 1,
    int pageSize = 10,
  }) {
    return _client.get<PageResult<RedeemOrder>>(
      '/api/v1/store/redeem/orders/paged',
      query: {'userId': userId, 'status': status, 'page': page, 'pageSize': pageSize},
      decode: (data) => PageResult.fromJson(data, RedeemOrder.fromJson),
    );
  }

  Future<void> approveRedeemOrder(int id) {
    return _client.post<void>(
      '/api/v1/store/redeem/$id/approve',
      decode: (_) {},
    );
  }

  Future<void> rejectRedeemOrder(int id) {
    return _client.post<void>(
      '/api/v1/store/redeem/$id/reject',
      decode: (_) {},
    );
  }

  Future<int> endorphinBalance() {
    return _client.get<int>(
      '/api/v1/store/endorphins/balance',
      decode: asInt,
    );
  }

  Future<PageResult<EndorphinLog>> endorphinLogs({
    String? type,
    int page = 1,
    int pageSize = 10,
  }) {
    return _client.get<PageResult<EndorphinLog>>(
      '/api/v1/store/endorphins/logs',
      query: {'type': type, 'page': page, 'pageSize': pageSize},
      decode: (data) => PageResult.fromJson(data, PointLog.fromJson),
    );
  }

  Future<void> exchangeEndorphins(int amount) {
    return _client.post<void>(
      '/api/v1/store/endorphins/exchange',
      data: {'amount': amount},
      decode: (_) {},
    );
  }

  Future<UserLevel> levelInfo() {
    return _client.get<UserLevel>(
      '/api/v1/level/info',
      decode: (data) => UserLevel.fromJson(asJsonMap(data)),
    );
  }

  Future<void> dailySign() {
    return _client.post<void>(
      '/api/v1/level/sign',
      decode: (_) {},
    );
  }

  Future<ChestResult> openChest() {
    return _client.post<ChestResult>(
      '/api/v1/level/chest',
      decode: (data) => ChestResult.fromJson(asJsonMap(data)),
    );
  }

  Future<void> useDoubleCard() {
    return _client.post<void>(
      '/api/v1/level/double-card',
      decode: (_) {},
    );
  }

  Future<void> useWishDirect(int rewardId) {
    return _client.post<void>(
      '/api/v1/level/wish/$rewardId',
      decode: (_) {},
    );
  }

  Future<List<LevelConfig>> levelConfigs() {
    return _client.get<List<LevelConfig>>(
      '/api/v1/level/config',
      decode: (data) => asJsonMapList(data).map(LevelConfig.fromJson).toList(),
    );
  }
}
