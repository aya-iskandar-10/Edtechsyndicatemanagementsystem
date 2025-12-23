import 'package:flutter/foundation.dart';
import 'dart:convert';
import 'package:uuid/uuid.dart';
import '../models/application.dart';
import '../database/database_helper.dart';

class ApplicationProvider with ChangeNotifier {
  final DatabaseHelper _dbHelper = DatabaseHelper.instance;
  final _uuid = const Uuid();

  Application? _currentApplication;
  List<Application> _allApplications = [];
  bool _isLoading = false;
  String? _error;

  Application? get currentApplication => _currentApplication;
  List<Application> get allApplications => _allApplications;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }

  // Clear application data
  void clearApplication() {
    _currentApplication = null;
    notifyListeners();
  }

  Future<Application?> getApplicationByEmail(String email) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      if (kDebugMode) {
        print('🔍 Getting application for email: $email');
      }

      final application = await _dbHelper.getApplicationByEmail(email);
      _currentApplication = application;

      return application;
    } catch (e) {
      _error = 'Error getting application: ${e.toString()}';
      if (kDebugMode) {
        print('❌ Exception in getApplicationByEmail: $e');
      }
      return null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> submitApplication({
    required String fullName,
    required String email,
    required String phone,
    required String position,
    required String organization,
    required String yearsExperience,
    required String education,
    required String specialization,
    String? linkedin,
    required String motivation,
    Map<String, dynamic>? files,
  }) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      if (kDebugMode) {
        print('📤 Submitting application for: $email');
      }

      // Check if application already exists for this email
      final existing = await _dbHelper.getApplicationByEmail(email);
      if (existing != null) {
        _error = 'An application with this email already exists';
        if (kDebugMode) {
          print('❌ Application already exists for email: $email');
        }
        return false;
      }

      // Parse files if provided
      ApplicationFiles? applicationFiles;
      if (files != null) {
        List<CertificateFile>? certificates;
        if (files['certificates'] != null && files['certificates'] is List) {
          certificates = (files['certificates'] as List).map((c) {
            if (c is Map) {
              return CertificateFile(
                data: c['data'] ?? '',
                name: c['name'] ?? '',
              );
            }
            return CertificateFile(data: '', name: '');
          }).toList();
        }

        applicationFiles = ApplicationFiles(
          resume: files['resume'],
          resumeName: files['resumeName'],
          recommendation: files['recommendation'],
          recommendationName: files['recommendationName'],
          certificates: certificates,
        );
      }

      // Create application
      final application = Application(
        id: _uuid.v4(),
        userId: null, // No user account needed
        fullName: fullName,
        email: email,
        phone: phone,
        position: position,
        organization: organization,
        yearsExperience: yearsExperience,
        education: education,
        specialization: specialization,
        linkedin: linkedin,
        motivation: motivation,
        status: ApplicationStatus.pending,
        submittedAt: DateTime.now(),
        files: applicationFiles,
      );

      // Save to database
      await _dbHelper.insertApplication(application);

      if (kDebugMode) {
        print('✅ Application submitted successfully: ${application.id}');
      }

      return true;
    } catch (e) {
      _error = 'Error submitting application: ${e.toString()}';
      if (kDebugMode) {
        print('❌ Exception during submission: $e');
      }
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchAllApplications({String? statusFilter, String? searchQuery}) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      if (kDebugMode) {
        print('📋 Fetching all applications (admin)');
      }

      _allApplications = await _dbHelper.getAllApplications(
        statusFilter: statusFilter,
        searchQuery: searchQuery,
      );

      if (kDebugMode) {
        print('✅ Loaded ${_allApplications.length} applications');
      }
    } catch (e) {
      _error = 'Error fetching applications: ${e.toString()}';
      if (kDebugMode) {
        print('❌ Exception fetching applications: $e');
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> approveApplication(String applicationId, DateTime expiryDate) async {
    try {
      _isLoading = true;
      notifyListeners();

      if (kDebugMode) {
        print('✅ Approving application: $applicationId');
      }

      // Generate membership number
      final membershipNumber = 'MEM-${DateTime.now().millisecondsSinceEpoch}';

      final rowsAffected = await _dbHelper.updateApplicationStatus(
        applicationId,
        ApplicationStatus.approved,
        expiryDate: expiryDate,
        membershipNumber: membershipNumber,
      );

      if (rowsAffected > 0) {
        await fetchAllApplications();
        if (kDebugMode) {
          print('✅ Application approved successfully');
        }
        return true;
      }

      _error = 'Failed to approve application';
      return false;
    } catch (e) {
      _error = 'Error approving: ${e.toString()}';
      if (kDebugMode) {
        print('❌ Error approving application: $e');
      }
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> rejectApplication(String applicationId) async {
    try {
      _isLoading = true;
      notifyListeners();

      if (kDebugMode) {
        print('❌ Rejecting application: $applicationId');
      }

      final rowsAffected = await _dbHelper.updateApplicationStatus(
        applicationId,
        ApplicationStatus.rejected,
      );

      if (rowsAffected > 0) {
        await fetchAllApplications();
        if (kDebugMode) {
          print('✅ Application rejected');
        }
        return true;
      }

      _error = 'Failed to reject application';
      return false;
    } catch (e) {
      _error = 'Error rejecting: ${e.toString()}';
      if (kDebugMode) {
        print('❌ Error rejecting application: $e');
      }
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Reset all state
  void reset() {
    _currentApplication = null;
    _allApplications = [];
    _isLoading = false;
    _error = null;
    notifyListeners();
  }
}