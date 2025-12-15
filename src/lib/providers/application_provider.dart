import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/application.dart';

class ApplicationProvider with ChangeNotifier {
  final _supabase = Supabase.instance.client;
  
  Application? _currentApplication;
  List<Application> _allApplications = [];
  bool _isLoading = false;
  String? _error;

  Application? get currentApplication => _currentApplication;
  List<Application> get allApplications => _allApplications;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<Application?> getApplication(String userId) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final response = await _supabase.functions.invoke(
        'make-server-71a69640/application/$userId',
      );

      if (response.status == 200 && response.data != null) {
        _currentApplication = Application.fromJson(response.data);
        return _currentApplication;
      }
      
      return null;
    } catch (e) {
      _error = e.toString();
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

      final session = _supabase.auth.currentSession;
      if (session == null) {
        _error = 'Not authenticated';
        _isLoading = false;
        notifyListeners();
        return false;
      }

      final response = await _supabase.functions.invoke(
        'make-server-71a69640/application',
        body: {
          'fullName': fullName,
          'email': email,
          'phone': phone,
          'position': position,
          'organization': organization,
          'yearsExperience': yearsExperience,
          'education': education,
          'specialization': specialization,
          'linkedin': linkedin,
          'motivation': motivation,
          'files': files,
        },
        headers: {
          'Authorization': 'Bearer ${session.accessToken}',
        },
      );

      if (response.status == 200) {
        // Refresh application
        await getApplication(session.user.id);
        return true;
      } else {
        _error = response.data['error'] ?? 'Failed to submit application';
        return false;
      }
    } catch (e) {
      _error = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchAllApplications() async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final session = _supabase.auth.currentSession;
      if (session == null) {
        _error = 'Not authenticated';
        _isLoading = false;
        notifyListeners();
        return;
      }

      final response = await _supabase.functions.invoke(
        'make-server-71a69640/admin/applications',
        headers: {
          'Authorization': 'Bearer ${session.accessToken}',
        },
      );

      if (response.status == 200 && response.data is List) {
        _allApplications = (response.data as List)
            .map((json) => Application.fromJson(json))
            .toList();
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> approveApplication(String applicationId, String expiryDate) async {
    try {
      final session = _supabase.auth.currentSession;
      if (session == null) return false;

      final response = await _supabase.functions.invoke(
        'make-server-71a69640/admin/application/$applicationId/approve',
        body: {'expiryDate': expiryDate},
        headers: {
          'Authorization': 'Bearer ${session.accessToken}',
        },
      );

      if (response.status == 200) {
        await fetchAllApplications();
        return true;
      }
      return false;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> rejectApplication(String applicationId) async {
    try {
      final session = _supabase.auth.currentSession;
      if (session == null) return false;

      final response = await _supabase.functions.invoke(
        'make-server-71a69640/admin/application/$applicationId/reject',
        headers: {
          'Authorization': 'Bearer ${session.accessToken}',
        },
      );

      if (response.status == 200) {
        await fetchAllApplications();
        return true;
      }
      return false;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }
}
