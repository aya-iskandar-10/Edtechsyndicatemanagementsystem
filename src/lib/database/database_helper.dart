import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'dart:convert';
import '../models/application.dart';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._init();
  static Database? _database;

  DatabaseHelper._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('applications.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  Future<void> _createDB(Database db, int version) async {
    const idType = 'TEXT PRIMARY KEY';
    const textType = 'TEXT NOT NULL';
    const textNullableType = 'TEXT';
    const dateType = 'TEXT';

    // Applications table
    await db.execute('''
      CREATE TABLE applications (
        id $idType,
        fullName $textType,
        email $textType,
        phone $textType,
        position $textType,
        organization $textType,
        yearsExperience $textType,
        education $textType,
        specialization $textType,
        linkedin $textNullableType,
        motivation $textType,
        status $textType,
        submittedAt $dateType,
        reviewedAt $textNullableType,
        expiryDate $textNullableType,
        membershipNumber $textNullableType,
        resume $textNullableType,
        resumeName $textNullableType,
        recommendation $textNullableType,
        recommendationName $textNullableType,
        certificates $textNullableType
      )
    ''');

    // Create indexes for better query performance
    await db.execute('CREATE INDEX idx_email ON applications(email)');
    await db.execute('CREATE INDEX idx_status ON applications(status)');
  }

  // Application CRUD operations
  Future<String> insertApplication(Application application) async {
    final db = await database;
    
    final filesJson = application.files != null ? _filesToJson(application.files!) : null;
    
    await db.insert(
      'applications',
      {
        'id': application.id,
        'fullName': application.fullName,
        'email': application.email,
        'phone': application.phone,
        'position': application.position,
        'organization': application.organization,
        'yearsExperience': application.yearsExperience,
        'education': application.education,
        'specialization': application.specialization,
        'linkedin': application.linkedin,
        'motivation': application.motivation,
        'status': application.status.name,
        'submittedAt': application.submittedAt.toIso8601String(),
        'reviewedAt': application.reviewedAt?.toIso8601String(),
        'expiryDate': application.expiryDate?.toIso8601String(),
        'membershipNumber': application.membershipNumber,
        'resume': filesJson?['resume'],
        'resumeName': filesJson?['resumeName'],
        'recommendation': filesJson?['recommendation'],
        'recommendationName': filesJson?['recommendationName'],
        'certificates': filesJson?['certificates'] != null 
            ? jsonEncode(filesJson!['certificates']) 
            : null,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
    
    return application.id;
  }

  Future<List<Application>> getAllApplications({String? statusFilter, String? searchQuery}) async {
    final db = await database;
    String query = 'SELECT * FROM applications WHERE 1=1';
    List<dynamic> args = [];

    if (statusFilter != null && statusFilter != 'all') {
      query += ' AND status = ?';
      args.add(statusFilter);
    }

    if (searchQuery != null && searchQuery.isNotEmpty) {
      query += ' AND (fullName LIKE ? OR email LIKE ? OR organization LIKE ?)';
      final searchTerm = '%$searchQuery%';
      args.addAll([searchTerm, searchTerm, searchTerm]);
    }

    query += ' ORDER BY submittedAt DESC';

    final List<Map<String, dynamic>> maps = await db.rawQuery(query, args);

    return List.generate(maps.length, (i) => _applicationFromMap(maps[i]));
  }

  Future<Application?> getApplicationById(String id) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'applications',
      where: 'id = ?',
      whereArgs: [id],
    );

    if (maps.isEmpty) return null;
    return _applicationFromMap(maps.first);
  }

  Future<Application?> getApplicationByEmail(String email) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'applications',
      where: 'email = ?',
      whereArgs: [email],
      orderBy: 'submittedAt DESC',
      limit: 1,
    );

    if (maps.isEmpty) return null;
    return _applicationFromMap(maps.first);
  }

  Future<int> updateApplicationStatus(
    String id,
    ApplicationStatus status, {
    DateTime? expiryDate,
    String? membershipNumber,
  }) async {
    final db = await database;
    return await db.update(
      'applications',
      {
        'status': status.name,
        'reviewedAt': DateTime.now().toIso8601String(),
        if (expiryDate != null) 'expiryDate': expiryDate.toIso8601String(),
        if (membershipNumber != null) 'membershipNumber': membershipNumber,
      },
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  Future<int> deleteApplication(String id) async {
    final db = await database;
    return await db.delete(
      'applications',
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  // Helper methods
  Application _applicationFromMap(Map<String, dynamic> map) {
    ApplicationFiles? files;
    if (map['resume'] != null || map['recommendation'] != null) {
      try {
        files = ApplicationFiles(
          resume: map['resume'],
          resumeName: map['resumeName'],
          recommendation: map['recommendation'],
          recommendationName: map['recommendationName'],
          certificates: map['certificates'] != null
              ? _parseCertificates(map['certificates'])
              : null,
        );
      } catch (e) {
        print('Error parsing files: $e');
      }
    }

    return Application(
      id: map['id'],
      userId: '', // Not needed anymore
      fullName: map['fullName'],
      email: map['email'],
      phone: map['phone'],
      position: map['position'],
      organization: map['organization'],
      yearsExperience: map['yearsExperience'],
      education: map['education'],
      specialization: map['specialization'],
      linkedin: map['linkedin'],
      motivation: map['motivation'],
      status: ApplicationStatus.values.firstWhere(
        (e) => e.name == map['status'],
        orElse: () => ApplicationStatus.pending,
      ),
      submittedAt: DateTime.parse(map['submittedAt']),
      reviewedAt: map['reviewedAt'] != null ? DateTime.parse(map['reviewedAt']) : null,
      expiryDate: map['expiryDate'] != null ? DateTime.parse(map['expiryDate']) : null,
      membershipNumber: map['membershipNumber'],
      files: files,
    );
  }

  Map<String, dynamic> _filesToJson(ApplicationFiles files) {
    return {
      'resume': files.resume,
      'resumeName': files.resumeName,
      'recommendation': files.recommendation,
      'recommendationName': files.recommendationName,
      'certificates': files.certificates?.map((c) => {
        'data': c.data,
        'name': c.name,
      }).toList(),
    };
  }

  List<CertificateFile>? _parseCertificates(dynamic certificatesData) {
    if (certificatesData == null || certificatesData.toString().isEmpty) {
      return null;
    }
    
    try {
      final List<dynamic> certificatesList = jsonDecode(certificatesData.toString());
      return certificatesList.map((c) => CertificateFile(
        data: c['data'] ?? '',
        name: c['name'] ?? '',
      )).toList();
    } catch (e) {
      print('Error parsing certificates: $e');
      return null;
    }
  }
}
