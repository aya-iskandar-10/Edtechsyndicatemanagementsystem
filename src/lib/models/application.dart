class Application {
  final String id;
  final String userId;
  final String fullName;
  final String email;
  final String phone;
  final String position;
  final String organization;
  final String yearsExperience;
  final String education;
  final String specialization;
  final String? linkedin;
  final String motivation;
  final ApplicationStatus status;
  final DateTime submittedAt;
  final DateTime? reviewedAt;
  final DateTime? expiryDate;
  final String? membershipNumber;
  final ApplicationFiles? files;

  Application({
    required this.id,
    required this.userId,
    required this.fullName,
    required this.email,
    required this.phone,
    required this.position,
    required this.organization,
    required this.yearsExperience,
    required this.education,
    required this.specialization,
    this.linkedin,
    required this.motivation,
    required this.status,
    required this.submittedAt,
    this.reviewedAt,
    this.expiryDate,
    this.membershipNumber,
    this.files,
  });

  factory Application.fromJson(Map<String, dynamic> json) {
    return Application(
      id: json['id'],
      userId: json['userId'],
      fullName: json['fullName'],
      email: json['email'],
      phone: json['phone'],
      position: json['position'],
      organization: json['organization'],
      yearsExperience: json['yearsExperience'],
      education: json['education'],
      specialization: json['specialization'],
      linkedin: json['linkedin'],
      motivation: json['motivation'],
      status: _statusFromString(json['status']),
      submittedAt: DateTime.parse(json['submittedAt']),
      reviewedAt: json['reviewedAt'] != null ? DateTime.parse(json['reviewedAt']) : null,
      expiryDate: json['expiryDate'] != null ? DateTime.parse(json['expiryDate']) : null,
      membershipNumber: json['membershipNumber'],
      files: json['files'] != null ? ApplicationFiles.fromJson(json['files']) : null,
    );
  }

  static ApplicationStatus _statusFromString(String status) {
    switch (status) {
      case 'pending':
        return ApplicationStatus.pending;
      case 'approved':
        return ApplicationStatus.approved;
      case 'rejected':
        return ApplicationStatus.rejected;
      case 'expired':
        return ApplicationStatus.expired;
      default:
        return ApplicationStatus.pending;
    }
  }

  bool get isExpired {
    if (expiryDate == null) return false;
    return DateTime.now().isAfter(expiryDate!);
  }
}

enum ApplicationStatus {
  pending,
  approved,
  rejected,
  expired,
}

class ApplicationFiles {
  final String? resume;
  final String? resumeName;
  final List<CertificateFile>? certificates;
  final String? recommendation;
  final String? recommendationName;

  ApplicationFiles({
    this.resume,
    this.resumeName,
    this.certificates,
    this.recommendation,
    this.recommendationName,
  });

  factory ApplicationFiles.fromJson(Map<String, dynamic> json) {
    return ApplicationFiles(
      resume: json['resume'],
      resumeName: json['resumeName'],
      certificates: json['certificates'] != null
          ? (json['certificates'] as List)
              .map((c) => CertificateFile.fromJson(c))
              .toList()
          : null,
      recommendation: json['recommendation'],
      recommendationName: json['recommendationName'],
    );
  }
}

class CertificateFile {
  final String data;
  final String name;

  CertificateFile({required this.data, required this.name});

  factory CertificateFile.fromJson(Map<String, dynamic> json) {
    return CertificateFile(
      data: json['data'],
      name: json['name'],
    );
  }
}
