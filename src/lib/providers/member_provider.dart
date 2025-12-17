import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../models/member.dart';

class MemberProvider with ChangeNotifier {
  final _supabase = Supabase.instance.client;

  Member? _currentMember;
  List<Member> _allMembers = [];
  bool _isLoading = false;
  String? _error;

  Member? get currentMember => _currentMember;
  List<Member> get allMembers => _allMembers;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Stream for real-time updates
  Stream<List<Member>>? _membersStream;
  Stream<List<Member>>? get membersStream => _membersStream;

  Future<Member?> getMember(String userId) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final supabaseUrl = _supabase.supabaseUrl;
      final url = Uri.parse('$supabaseUrl/functions/v1/make-server-71a69640/member/$userId');

      final response = await http.get(
        url,
        headers: {
          'apikey': _supabase.supabaseKey,
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _currentMember = Member.fromJson(data);
        return _currentMember;
      }

      return null;
    } catch (e) {
      _error = e.toString();
      if (kDebugMode) print('Get member error: $e');
      return null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> completeProfile({
    required String fullName,
    required String cvUrl,
    String? cvName,
    String? photoUrl,
  }) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final session = _supabase.auth.currentSession;
      if (session == null) {
        _error = 'Not authenticated';
        return false;
      }

      final supabaseUrl = _supabase.supabaseUrl;
      final url = Uri.parse('$supabaseUrl/functions/v1/make-server-71a69640/member/complete-profile');

      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'apikey': _supabase.supabaseKey,
          'Authorization': 'Bearer ${session.accessToken}',
        },
        body: jsonEncode({
          'fullName': fullName,
          'cvUrl': cvUrl,
          'cvName': cvName,
          'photoUrl': photoUrl,
        }),
      );

      if (response.statusCode == 200) {
        await getMember(session.user.id);
        return true;
      } else {
        _error = jsonDecode(response.body)['error'] ?? 'Failed to complete profile';
        return false;
      }
    } catch (e) {
      _error = e.toString();
      if (kDebugMode) print('Complete profile error: $e');
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchAllMembers({String? statusFilter, String? searchQuery}) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final session = _supabase.auth.currentSession;
      if (session == null) {
        _error = 'Not authenticated';
        return;
      }

      final supabaseUrl = _supabase.supabaseUrl;
      var url = '$supabaseUrl/functions/v1/make-server-71a69640/admin/members';

      final queryParams = <String, String>{};
      if (statusFilter != null) queryParams['status'] = statusFilter;
      if (searchQuery != null && searchQuery.isNotEmpty) queryParams['search'] = searchQuery;

      if (queryParams.isNotEmpty) {
        url += '?${Uri(queryParameters: queryParams).query}';
      }

      final response = await http.get(
        Uri.parse(url),
        headers: {
          'apikey': _supabase.supabaseKey,
          'Authorization': 'Bearer ${session.accessToken}',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        _allMembers = data.map((json) => Member.fromJson(json)).toList();
      }
    } catch (e) {
      _error = e.toString();
      if (kDebugMode) print('Fetch members error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> approveMember(String memberId, DateTime expiryDate) async {
    try {
      final session = _supabase.auth.currentSession;
      if (session == null) return false;

      final supabaseUrl = _supabase.supabaseUrl;
      final url = Uri.parse('$supabaseUrl/functions/v1/make-server-71a69640/admin/member/$memberId/approve');

      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'apikey': _supabase.supabaseKey,
          'Authorization': 'Bearer ${session.accessToken}',
        },
        body: jsonEncode({
          'expiryDate': expiryDate.toIso8601String(),
        }),
      );

      if (response.statusCode == 200) {
        await fetchAllMembers();
        return true;
      }
      return false;
    } catch (e) {
      _error = e.toString();
      if (kDebugMode) print('Approve member error: $e');
      return false;
    }
  }

  Future<bool> rejectMember(String memberId, String? notes) async {
    try {
      final session = _supabase.auth.currentSession;
      if (session == null) return false;

      final supabaseUrl = _supabase.supabaseUrl;
      final url = Uri.parse('$supabaseUrl/functions/v1/make-server-71a69640/admin/member/$memberId/reject');

      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'apikey': _supabase.supabaseKey,
          'Authorization': 'Bearer ${session.accessToken}',
        },
        body: jsonEncode({
          'notes': notes,
        }),
      );

      if (response.statusCode == 200) {
        await fetchAllMembers();
        return true;
      }
      return false;
    } catch (e) {
      _error = e.toString();
      if (kDebugMode) print('Reject member error: $e');
      return false;
    }
  }

  Future<bool> addAdminNotes(String memberId, String notes) async {
    try {
      final session = _supabase.auth.currentSession;
      if (session == null) return false;

      final supabaseUrl = _supabase.supabaseUrl;
      final url = Uri.parse('$supabaseUrl/functions/v1/make-server-71a69640/admin/member/$memberId/notes');

      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'apikey': _supabase.supabaseKey,
          'Authorization': 'Bearer ${session.accessToken}',
        },
        body: jsonEncode({
          'notes': notes,
        }),
      );

      return response.statusCode == 200;
    } catch (e) {
      if (kDebugMode) print('Add notes error: $e');
      return false;
    }
  }

  Future<bool> bulkApprove(List<String> memberIds, DateTime expiryDate) async {
    try {
      final session = _supabase.auth.currentSession;
      if (session == null) return false;

      final supabaseUrl = _supabase.supabaseUrl;
      final url = Uri.parse('$supabaseUrl/functions/v1/make-server-71a69640/admin/members/bulk-approve');

      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'apikey': _supabase.supabaseKey,
          'Authorization': 'Bearer ${session.accessToken}',
        },
        body: jsonEncode({
          'memberIds': memberIds,
          'expiryDate': expiryDate.toIso8601String(),
        }),
      );

      if (response.statusCode == 200) {
        await fetchAllMembers();
        return true;
      }
      return false;
    } catch (e) {
      if (kDebugMode) print('Bulk approve error: $e');
      return false;
    }
  }

  Future<bool> bulkReject(List<String> memberIds) async {
    try {
      final session = _supabase.auth.currentSession;
      if (session == null) return false;

      final supabaseUrl = _supabase.supabaseUrl;
      final url = Uri.parse('$supabaseUrl/functions/v1/make-server-71a69640/admin/members/bulk-reject');

      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'apikey': _supabase.supabaseKey,
          'Authorization': 'Bearer ${session.accessToken}',
        },
        body: jsonEncode({
          'memberIds': memberIds,
        }),
      );

      if (response.statusCode == 200) {
        await fetchAllMembers();
        return true;
      }
      return false;
    } catch (e) {
      if (kDebugMode) print('Bulk reject error: $e');
      return false;
    }
  }

  void setupRealtimeSubscription() {
    // Listen to changes in members
    _membersStream = _supabase
        .from('kv_store_71a69640')
        .stream(primaryKey: ['key'])
        .map((data) {
      return data
          .where((item) => item['key'].toString().startsWith('member:'))
          .map((item) => Member.fromJson(jsonDecode(item['value'])))
          .toList();
    });
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
