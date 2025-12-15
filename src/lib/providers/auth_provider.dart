import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AuthProvider with ChangeNotifier {
  final _supabase = Supabase.instance.client;
  
  bool _isAuthenticated = false;
  bool _isAdmin = false;
  bool _isLoading = true;
  String? _userId;
  String? _accessToken;
  String? _userName;
  String? _error;

  bool get isAuthenticated => _isAuthenticated;
  bool get isAdmin => _isAdmin;
  bool get isLoading => _isLoading;
  String? get userId => _userId;
  String? get accessToken => _accessToken;
  String? get userName => _userName;
  String? get error => _error;

  Future<void> checkSession() async {
    try {
      final session = _supabase.auth.currentSession;
      
      if (session != null) {
        _isAuthenticated = true;
        _userId = session.user.id;
        _accessToken = session.accessToken;
        _userName = session.user.userMetadata?['name'] ?? session.user.email;
        _isAdmin = session.user.userMetadata?['role'] == 'admin';
      } else {
        _isAuthenticated = false;
        _isAdmin = false;
        _userId = null;
        _accessToken = null;
        _userName = null;
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> signUp({
    required String email,
    required String password,
    required String name,
  }) async {
    try {
      _error = null;
      
      // Call backend signup endpoint
      final response = await _supabase.functions.invoke(
        'make-server-71a69640/signup',
        body: {
          'email': email,
          'password': password,
          'name': name,
        },
      );

      if (response.status == 200) {
        // Now sign in
        return await signIn(email: email, password: password);
      } else {
        _error = response.data['error'] ?? 'Failed to sign up';
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> signIn({
    required String email,
    required String password,
  }) async {
    try {
      _error = null;
      
      final response = await _supabase.auth.signInWithPassword(
        email: email,
        password: password,
      );

      if (response.session != null) {
        _isAuthenticated = true;
        _userId = response.user?.id;
        _accessToken = response.session?.accessToken;
        _userName = response.user?.userMetadata?['name'] ?? email;
        _isAdmin = response.user?.userMetadata?['role'] == 'admin';
        notifyListeners();
        return true;
      } else {
        _error = 'Failed to sign in';
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<void> signOut() async {
    await _supabase.auth.signOut();
    _isAuthenticated = false;
    _isAdmin = false;
    _userId = null;
    _accessToken = null;
    _userName = null;
    notifyListeners();
  }
}
