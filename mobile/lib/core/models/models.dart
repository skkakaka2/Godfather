int asInt(Object? value) {
  if (value is int) {
    return value;
  }
  if (value is num) {
    return value.toInt();
  }
  return int.tryParse(value?.toString() ?? '') ?? 0;
}

int? asNullableInt(Object? value) {
  if (value == null) {
    return null;
  }
  final parsed = asInt(value);
  return parsed == 0 && value.toString() != '0' ? null : parsed;
}

String? asNullableString(Object? value) {
  final text = value?.toString();
  if (text == null || text.isEmpty) {
    return null;
  }
  return text;
}

bool asBool(Object? value) {
  if (value is bool) {
    return value;
  }
  if (value is num) {
    return value != 0;
  }
  return value?.toString().toLowerCase() == 'true';
}

Map<String, Object?> asJsonMap(Object? value) {
  if (value is Map) {
    return value.map((key, item) => MapEntry(key.toString(), item));
  }
  return <String, Object?>{};
}

List<Map<String, Object?>> asJsonMapList(Object? value) {
  if (value is List) {
    return value.map(asJsonMap).toList();
  }
  return const [];
}

class PageResult<T> {
  const PageResult({
    required this.list,
    required this.total,
    required this.page,
    required this.pageSize,
  });

  final List<T> list;
  final int total;
  final int page;
  final int pageSize;

  factory PageResult.fromJson(
    Object? json,
    T Function(Map<String, Object?> json) fromJson,
  ) {
    final map = asJsonMap(json);
    return PageResult<T>(
      list: asJsonMapList(map['list']).map(fromJson).toList(),
      total: asInt(map['total']),
      page: asInt(map['page']),
      pageSize: asInt(map['pageSize']),
    );
  }
}

class User {
  const User({
    required this.id,
    required this.familyId,
    required this.username,
    required this.nickname,
    required this.role,
    this.avatar,
    this.gender,
    this.birthDate,
    this.points,
    this.endorphins,
  });

  final int id;
  final int familyId;
  final String username;
  final String nickname;
  final String role;
  final String? avatar;
  final int? gender;
  final String? birthDate;
  final int? points;
  final int? endorphins;

  factory User.fromJson(Map<String, Object?> json) {
    return User(
      id: asInt(json['id']),
      familyId: asInt(json['familyId']),
      username: json['username']?.toString() ?? '',
      nickname: json['nickname']?.toString() ?? json['username']?.toString() ?? '',
      role: json['role']?.toString() ?? '',
      avatar: asNullableString(json['avatar']),
      gender: asNullableInt(json['gender']),
      birthDate: asNullableString(json['birthDate']),
      points: asNullableInt(json['points']),
      endorphins: asNullableInt(json['endorphins']),
    );
  }

  Map<String, Object?> toJson() => {
        'id': id,
        'familyId': familyId,
        'username': username,
        'nickname': nickname,
        'role': role,
        'avatar': avatar,
        'gender': gender,
        'birthDate': birthDate,
        'points': points,
        'endorphins': endorphins,
      };
}

class LoginResponse {
  const LoginResponse({
    required this.accessToken,
    required this.refreshToken,
    required this.expiresIn,
    required this.user,
  });

  final String accessToken;
  final String refreshToken;
  final int expiresIn;
  final User user;

  factory LoginResponse.fromJson(Map<String, Object?> json) {
    return LoginResponse(
      accessToken: json['accessToken']?.toString() ?? '',
      refreshToken: json['refreshToken']?.toString() ?? '',
      expiresIn: asInt(json['expiresIn']),
      user: User.fromJson(asJsonMap(json['user'])),
    );
  }
}

class DailyTask {
  const DailyTask({
    required this.id,
    required this.familyId,
    required this.userId,
    required this.taskDate,
    required this.name,
    required this.points,
    required this.status,
    this.templateId,
    this.category,
    this.icon,
    this.deadlineTime,
    this.sortOrder,
    this.isTemp,
    this.reminded,
    this.createdAt,
    this.updatedAt,
  });

  final int id;
  final int familyId;
  final int userId;
  final int? templateId;
  final String taskDate;
  final String name;
  final String? category;
  final String? icon;
  final int points;
  final String? deadlineTime;
  final int? sortOrder;
  final String status;
  final int? isTemp;
  final int? reminded;
  final String? createdAt;
  final String? updatedAt;

  factory DailyTask.fromJson(Map<String, Object?> json) {
    return DailyTask(
      id: asInt(json['id']),
      familyId: asInt(json['familyId']),
      userId: asInt(json['userId']),
      templateId: asNullableInt(json['templateId']),
      taskDate: json['taskDate']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      category: asNullableString(json['category']),
      icon: asNullableString(json['icon']),
      points: asInt(json['points']),
      deadlineTime: asNullableString(json['deadlineTime']),
      sortOrder: asNullableInt(json['sortOrder']),
      status: json['status']?.toString() ?? '',
      isTemp: asNullableInt(json['isTemp']),
      reminded: asNullableInt(json['reminded']),
      createdAt: asNullableString(json['createdAt']),
      updatedAt: asNullableString(json['updatedAt']),
    );
  }
}

class TaskTemplate {
  const TaskTemplate({
    required this.id,
    required this.name,
    required this.category,
    required this.defaultPoints,
    required this.applicableSun,
    required this.applicableMon,
    required this.applicableTue,
    required this.applicableWed,
    required this.applicableThu,
    required this.applicableFri,
    required this.applicableSat,
    required this.deadlineTime,
    required this.enabled,
    this.icon,
    this.sortOrder,
  });

  final int id;
  final String name;
  final String category;
  final String? icon;
  final int defaultPoints;
  final int applicableSun;
  final int applicableMon;
  final int applicableTue;
  final int applicableWed;
  final int applicableThu;
  final int applicableFri;
  final int applicableSat;
  final String deadlineTime;
  final int? sortOrder;
  final int enabled;

  factory TaskTemplate.fromJson(Map<String, Object?> json) {
    return TaskTemplate(
      id: asInt(json['id']),
      name: json['name']?.toString() ?? '',
      category: json['category']?.toString() ?? '',
      icon: asNullableString(json['icon']),
      defaultPoints: asInt(json['defaultPoints']),
      applicableSun: asInt(json['applicableSun']),
      applicableMon: asInt(json['applicableMon']),
      applicableTue: asInt(json['applicableTue']),
      applicableWed: asInt(json['applicableWed']),
      applicableThu: asInt(json['applicableThu']),
      applicableFri: asInt(json['applicableFri']),
      applicableSat: asInt(json['applicableSat']),
      deadlineTime: json['deadlineTime']?.toString() ?? '20:00:00',
      sortOrder: asNullableInt(json['sortOrder']),
      enabled: asInt(json['enabled']),
    );
  }
}

class PointLog {
  const PointLog({
    required this.id,
    required this.familyId,
    required this.userId,
    required this.type,
    required this.amount,
    required this.balanceAfter,
    this.refId,
    this.remark,
    this.createdAt,
  });

  final int id;
  final int familyId;
  final int userId;
  final String type;
  final int amount;
  final int balanceAfter;
  final int? refId;
  final String? remark;
  final String? createdAt;

  factory PointLog.fromJson(Map<String, Object?> json) {
    return PointLog(
      id: asInt(json['id']),
      familyId: asInt(json['familyId']),
      userId: asInt(json['userId']),
      type: json['type']?.toString() ?? '',
      amount: asInt(json['amount']),
      balanceAfter: asInt(json['balanceAfter']),
      refId: asNullableInt(json['refId']),
      remark: asNullableString(json['remark']),
      createdAt: asNullableString(json['createdAt']),
    );
  }
}

typedef EndorphinLog = PointLog;

class Reward {
  const Reward({
    required this.id,
    required this.familyId,
    required this.name,
    required this.pointsPrice,
    required this.stock,
    required this.status,
    this.description,
    this.imageUrl,
    this.createdAt,
    this.updatedAt,
  });

  final int id;
  final int familyId;
  final String name;
  final String? description;
  final int pointsPrice;
  final String? imageUrl;
  final int stock;
  final String status;
  final String? createdAt;
  final String? updatedAt;

  factory Reward.fromJson(Map<String, Object?> json) {
    return Reward(
      id: asInt(json['id']),
      familyId: asInt(json['familyId']),
      name: json['name']?.toString() ?? '',
      description: asNullableString(json['description']),
      pointsPrice: asInt(json['pointsPrice']),
      imageUrl: asNullableString(json['imageUrl']),
      stock: asInt(json['stock']),
      status: json['status']?.toString() ?? '',
      createdAt: asNullableString(json['createdAt']),
      updatedAt: asNullableString(json['updatedAt']),
    );
  }
}

class RedeemOrder {
  const RedeemOrder({
    required this.id,
    required this.familyId,
    required this.userId,
    required this.rewardId,
    required this.rewardName,
    required this.pointsCost,
    required this.status,
    this.remark,
    this.createdAt,
    this.updatedAt,
  });

  final int id;
  final int familyId;
  final int userId;
  final int rewardId;
  final String rewardName;
  final int pointsCost;
  final String status;
  final String? remark;
  final String? createdAt;
  final String? updatedAt;

  factory RedeemOrder.fromJson(Map<String, Object?> json) {
    return RedeemOrder(
      id: asInt(json['id']),
      familyId: asInt(json['familyId']),
      userId: asInt(json['userId']),
      rewardId: asInt(json['rewardId']),
      rewardName: json['rewardName']?.toString() ?? '',
      pointsCost: asInt(json['pointsCost']),
      status: json['status']?.toString() ?? '',
      remark: asNullableString(json['remark']),
      createdAt: asNullableString(json['createdAt']),
      updatedAt: asNullableString(json['updatedAt']),
    );
  }
}

class UserLevel {
  const UserLevel({
    required this.userId,
    required this.totalLevel,
    required this.level,
    required this.subLevel,
    required this.title,
    required this.exp,
    required this.bonusPercent,
    required this.dailySignBonus,
    required this.streakShield,
    required this.doubleCard,
    required this.dailyChest,
    required this.expBoost,
    required this.redeemDiscount,
    required this.wishDiscount,
    this.nextExpRequired,
    this.avatarFrame,
  });

  final int userId;
  final int totalLevel;
  final int level;
  final int subLevel;
  final String title;
  final int exp;
  final int? nextExpRequired;
  final int bonusPercent;
  final int dailySignBonus;
  final int streakShield;
  final int doubleCard;
  final bool dailyChest;
  final int expBoost;
  final num redeemDiscount;
  final String? avatarFrame;
  final int wishDiscount;

  factory UserLevel.fromJson(Map<String, Object?> json) {
    return UserLevel(
      userId: asInt(json['userId']),
      totalLevel: asInt(json['totalLevel']),
      level: asInt(json['level']),
      subLevel: asInt(json['subLevel']),
      title: json['title']?.toString() ?? '',
      exp: asInt(json['exp']),
      nextExpRequired: asNullableInt(json['nextExpRequired']),
      bonusPercent: asInt(json['bonusPercent']),
      dailySignBonus: asInt(json['dailySignBonus']),
      streakShield: asInt(json['streakShield']),
      doubleCard: asInt(json['doubleCard']),
      dailyChest: asBool(json['dailyChest']),
      expBoost: asInt(json['expBoost']),
      redeemDiscount: json['redeemDiscount'] is num ? json['redeemDiscount'] as num : 1,
      avatarFrame: asNullableString(json['avatarFrame']),
      wishDiscount: asInt(json['wishDiscount']),
    );
  }
}

class LevelConfig {
  const LevelConfig({
    required this.id,
    required this.title,
    required this.expRequired,
    required this.level,
    required this.subLevel,
  });

  final int id;
  final String title;
  final int expRequired;
  final int level;
  final int subLevel;

  factory LevelConfig.fromJson(Map<String, Object?> json) {
    return LevelConfig(
      id: asInt(json['id']),
      title: json['title']?.toString() ?? '',
      expRequired: asInt(json['expRequired']),
      level: asInt(json['level']),
      subLevel: asInt(json['subLevel']),
    );
  }
}

class ChestResult {
  const ChestResult({required this.points, required this.exp});

  final int points;
  final int exp;

  factory ChestResult.fromJson(Map<String, Object?> json) {
    return ChestResult(
      points: asInt(json['points']),
      exp: asInt(json['exp']),
    );
  }
}
