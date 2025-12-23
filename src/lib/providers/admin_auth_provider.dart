import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AdminAuthProvider with ChangeNotifier {
  // Hardcoded admin credentials
  static const String adminEmail = 'admin@edtech.com';
  static const String adminPassword = 'admin123'; // Change this in production!

  bool _isAuthenticated = false;
  bool _isLoading = false;
  String? _error;

  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  String? get error => _error;

  AdminAuthProvider() {
    _checkSession();
  }

  Future<void> _checkSession() async {
    try {
      _isLoading = true;
      notifyListeners();

      final prefs = await SharedPreferences.getInstance();
      final isLoggedIn = prefs.getBool('admin_logged_in') ?? false;

      if (isLoggedIn) {
        _isAuthenticated = true;
      }
    } catch (e) {
      if (kDebugMode) {
        print('Error checking admin session: $e');
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    try {
      _error = null;
      _isLoading = true;
      notifyListeners();

      if (kDebugMode) {
        print('Admin login attempt: $email');
      }

      // Check credentials
      if (email.trim().toLowerCase() == adminEmail.toLowerCase() &&
          password == adminPassword) {
        _isAuthenticated = true;
        
        // Save session
        final prefs = await SharedPreferences.getInstance();
        await prefs.setBool('admin_logged_in', true);

        if (kDebugMode) {
          print('✅ Admin login successful');
        }

        notifyListeners();
        return true;
      } else {
        _error = 'Invalid email or password';
        if (kDebugMode) {
          print('❌ Admin login failed: Invalid credentials');
        }
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'Login error: ${e.toString()}';
      if (kDebugMode) {
        print('❌ Admin login exception: $e');
      }
      notifyListeners();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    try {
      if (kDebugMode) {
        print('👋 Admin logging out...');
      }

      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('admin_logged_in', false);

      _isAuthenticated = false;
      _error = null;

      if (kDebugMode) {
        print('✅ Admin logout successful');
      }

      notifyListeners();
    } catch (e) {
      if (kDebugMode) {
        print('❌ Admin logout error: $e');
      }
      // Even if logout fails, clear local state
      _isAuthenticated = false;
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
