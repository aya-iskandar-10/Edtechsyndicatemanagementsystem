import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

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
        
        // Get user metadata
        final metadata = session.user.userMetadata;
        _userName = metadata?['name'] ?? session.user.email;
        _isAdmin = metadata?['role'] == 'admin';
        
        if (kDebugMode) {
          print('Session found - User: $_userName, Admin: $_isAdmin');
          print('User metadata: $metadata');
        }
      } else {
        _isAuthenticated = false;
        _isAdmin = false;
        _userId = null;
        _accessToken = null;
        _userName = null;
        
        if (kDebugMode) {
          print('No session found');
        }
      }
    } catch (e) {
      _error = e.toString();
      if (kDebugMode) {
        print('Check session error: $e');
      }
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
      
      if (kDebugMode) {
        print('Attempting signup for: $email');
      }
      
      // Get Supabase URL
      final supabaseUrl = _supabase.supabaseUrl;
      final url = Uri.parse('$supabaseUrl/functions/v1/make-server-71a69640/signup');
      
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'apikey': _supabase.supabaseKey,
        },
        body: jsonEncode({
          'email': email,
          'password': password,
          'name': name,
        }),
      );

      if (kDebugMode) {
        print('Signup response status: ${response.statusCode}');
        print('Signup response body: ${response.body}');
      }

      if (response.statusCode == 200) {
        // Now sign in
        return await signIn(email: email, password: password);
      } else {
        final errorData = jsonDecode(response.body);
        _error = errorData['error'] ?? 'Failed to sign up';
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'Sign up error: ${e.toString()}';
      if (kDebugMode) {
        print('Signup error: $e');
      }
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
      
      if (kDebugMode) {
        print('Attempting sign in for: $email');
      }
      
      final response = await _supabase.auth.signInWithPassword(
        email: email,
        password: password,
      );

      if (kDebugMode) {
        print('Sign in response - Session exists: ${response.session != null}');
        print('User metadata: ${response.user?.userMetadata}');
      }

      if (response.session != null) {
        _isAuthenticated = true;
        _userId = response.user?.id;
        _accessToken = response.session?.accessToken;
        
        final metadata = response.user?.userMetadata;
        _userName = metadata?['name'] ?? email;
        _isAdmin = metadata?['role'] == 'admin';
        
        if (kDebugMode) {
          print('Sign in successful - User: $_userName, Admin: $_isAdmin');
        }
        
        notifyListeners();
        return true;
      } else {
        _error = 'Failed to sign in';
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'Sign in error: ${e.toString()}';
      if (kDebugMode) {
        print('Sign in error: $e');
      }
      notifyListeners();
      return false;
    }
  }

  Future<void> signOut() async {
    try {
      await _supabase.auth.signOut();
      _isAuthenticated = false;
      _isAdmin = false;
      _userId = null;
      _accessToken = null;
      _userName = null;
      notifyListeners();
      
      if (kDebugMode) {
        print('Sign out successful');
      }
    } catch (e) {
      if (kDebugMode) {
        print('Sign out error: $e');
      }
    }
  }
}
