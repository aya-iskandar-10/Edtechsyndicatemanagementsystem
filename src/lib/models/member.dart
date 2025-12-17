class Member {
  final String id;
  final String userId;
  final String email;
  final String? fullName;
  final String? cvUrl;
  final String? cvName;
  final String? photoUrl;
  final MemberStatus status;
  final bool profileCompleted;
  final DateTime createdAt;
  final DateTime? approvedAt;
  final DateTime? expiryDate;
  final String? membershipNumber;
  final String? adminNotes;
  final bool emailVerified;

  Member({
    required this.id,
    required this.userId,
    required this.email,
    this.fullName,
    this.cvUrl,
    this.cvName,
    this.photoUrl,
    required this.status,
    required this.profileCompleted,
    required this.createdAt,
    this.approvedAt,
    this.expiryDate,
    this.membershipNumber,
    this.adminNotes,
    this.emailVerified = false,
  });

  factory Member.fromJson(Map<String, dynamic> json) {
    return Member(
      id: json['id'],
      userId: json['userId'],
      email: json['email'],
      fullName: json['fullName'],
      cvUrl: json['cvUrl'],
      cvName: json['cvName'],
      photoUrl: json['photoUrl'],
      status: _statusFromString(json['status']),
      profileCompleted: json['profileCompleted'] ?? false,
      createdAt: DateTime.parse(json['createdAt']),
      approvedAt: json['approvedAt'] != null ? DateTime.parse(json['approvedAt']) : null,
      expiryDate: json['expiryDate'] != null ? DateTime.parse(json['expiryDate']) : null,
      membershipNumber: json['membershipNumber'],
      adminNotes: json['adminNotes'],
      emailVerified: json['emailVerified'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'email': email,
      'fullName': fullName,
      'cvUrl': cvUrl,
      'cvName': cvName,
      'photoUrl': photoUrl,
      'status': status.name,
      'profileCompleted': profileCompleted,
      'createdAt': createdAt.toIso8601String(),
      'approvedAt': approvedAt?.toIso8601String(),
      'expiryDate': expiryDate?.toIso8601String(),
      'membershipNumber': membershipNumber,
      'adminNotes': adminNotes,
      'emailVerified': emailVerified,
    };
  }

  static MemberStatus _statusFromString(String status) {
    switch (status) {
      case 'pending':
        return MemberStatus.pending;
      case 'approved':
        return MemberStatus.approved;
      case 'rejected':
        return MemberStatus.rejected;
      case 'expired':
        return MemberStatus.expired;
      default:
        return MemberStatus.pending;
    }
  }

  bool get isExpired {
    if (expiryDate == null) return false;
    return DateTime.now().isAfter(expiryDate!);
  }

  String get displayName => fullName ?? email.split('@').first;
}

enum MemberStatus {
  pending,
  approved,
  rejected,
  expired,
}

extension MemberStatusExtension on MemberStatus {
  String get displayName {
    switch (this) {
      case MemberStatus.pending:
        return 'Pending';
      case MemberStatus.approved:
        return 'Approved';
      case MemberStatus.rejected:
        return 'Rejected';
      case MemberStatus.expired:
        return 'Expired';
    }
  }
}
