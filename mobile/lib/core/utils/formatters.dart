import 'package:intl/intl.dart';

String formatPoints(num? value) => '${value ?? 0} 分';

String formatDateTime(String? value) {
  if (value == null || value.isEmpty) {
    return '-';
  }
  final parsed = DateTime.tryParse(value);
  if (parsed == null) {
    return value;
  }
  return DateFormat('MM-dd HH:mm').format(parsed);
}

String todayText() => DateFormat('yyyy-MM-dd').format(DateTime.now());

String statusLabel(String status) {
  return switch (status) {
    'PENDING' => '待完成',
    'COMPLETED' => '待确认',
    'CONFIRMED' => '已确认',
    'REJECTED' => '已打回',
    'APPROVED' => '已通过',
    'ON' => '上架',
    'OFF' => '下架',
    'ADMIN' => '管理员',
    'PARENT' => '家长',
    'CHILD' => '孩子',
    _ => status,
  };
}

bool canManage(String? role) => role == 'ADMIN' || role == 'PARENT';
